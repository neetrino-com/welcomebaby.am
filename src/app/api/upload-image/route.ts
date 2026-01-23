import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Проверяем тип файла по MIME
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Проверяем расширение файла (дополнительная защита)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `File extension not allowed. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      )
    }

    // Проверяем минимальный размер (защита от пустых файлов)
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      )
    }

    // Генерируем уникальное имя файла (UUID-подобное)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomString}.${extension}`

    // Определяем директорию сохранения
    // ВАЖНО: по умолчанию и в development, и в production сохраняем в public/images,
    // чтобы поведение сервера совпадало с локальным без дополнительной настройки Nginx.
    // При необходимости можно переопределить через переменную окружения UPLOAD_DIR.
    const defaultDir = join(process.cwd(), 'public', 'images')
    const uploadDir = process.env.UPLOAD_DIR || defaultDir

    const filePath = join(uploadDir, fileName)

    // Создаем папку images если её нет
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Папка уже существует, это нормально
    }

    // Конвертируем файл в буфер и сохраняем
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Возвращаем относительный URL (префикс можно переопределить)
    const urlPrefix = (process.env.UPLOAD_URL_PREFIX || '/images').replace(/\/$/, '')
    const imagePath = `${urlPrefix}/${fileName}`

    return NextResponse.json({
      success: true,
      path: imagePath,
      fileName: fileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
