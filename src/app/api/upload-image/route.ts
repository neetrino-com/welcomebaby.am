import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { uploadFile } from '@/lib/blob'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const hasS3Config =
      !!process.env.S3_ENDPOINT &&
      !!process.env.S3_ACCESS_KEY &&
      !!process.env.S3_SECRET_KEY &&
      !!process.env.S3_BUCKET &&
      !!process.env.S3_PUBLIC_URL

    if (!hasS3Config) {
      logger.error('Upload image: S3/R2 storage is not configured')
      return NextResponse.json(
        { error: 'S3/R2 storage not configured. Add S3_* variables in environment.' },
        { status: 503 }
      )
    }

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

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileName = `images/${timestamp}-${randomString}.${extension}`

    // Загружаем файл в Cloudflare R2 (S3‑совместимое хранилище)
    const { url, path } = await uploadFile(file, fileName)

    // Возвращаем URL файла
    // url - полный публичный URL (например, https://<endpoint>/<bucket>/images/...)
    // path - относительный путь/ключ внутри bucket'а (images/...)
    // Используем url как основной для отображения
    return NextResponse.json({
      success: true,
      path: path || url, // Для обратной совместимости
      url: url, // Полный URL от Blob - используется для отображения
      fileName: fileName.split('/').pop() || fileName
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Upload image error', error)
    const isConfigError = message.includes('S3/R2 storage not configured')
    return NextResponse.json(
      { error: isConfigError ? 'S3/R2 storage not configured. Add S3_* variables in environment.' : 'Failed to upload image' },
      { status: isConfigError ? 503 : 500 }
    )
  }
}
