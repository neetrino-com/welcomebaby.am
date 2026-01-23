import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const folder: string = data.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Проверяем размер файла (максимум 10MB для общих файлов)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Проверяем минимальный размер
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      )
    }

    // Проверяем расширение файла
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx']
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `File extension not allowed. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создаем уникальное имя файла (безопасное, без оригинального имени)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const filename = `${timestamp}-${randomString}.${extension}`
    
    // Путь к папке public
    const uploadDir = join(process.cwd(), 'public', folder)
    
    // Создаем папку если не существует
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Папка уже существует
    }

    // Путь к файлу
    const filepath = join(uploadDir, filename)
    
    // Сохраняем файл
    await writeFile(filepath, buffer)

    // Возвращаем URL файла
    const fileUrl = `/${folder}/${filename}`

    return NextResponse.json({ 
      url: fileUrl,
      filename: filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
