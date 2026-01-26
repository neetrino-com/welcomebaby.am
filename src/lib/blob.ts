/**
 * Утилита для работы с Vercel Blob Storage
 * Работает одинаково в локальной разработке и на production
 * Требует BLOB_READ_WRITE_TOKEN для работы
 */

import { put, del, list } from '@vercel/blob'

export interface BlobUploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
  size: number
}

/**
 * Загружает файл в Vercel Blob Storage
 * Требует BLOB_READ_WRITE_TOKEN в переменных окружения
 */
export async function uploadFile(
  file: File,
  fileName: string
): Promise<{ url: string; path: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN не настроен. ' +
      'Настройте Vercel Blob Storage и добавьте токен в .env файл. ' +
      'Получить токен: Vercel Dashboard → Storage → Blob → Tokens'
    )
  }

  const blob = await put(fileName, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: file.type,
  })

  // Возвращаем URL и относительный путь
  return {
    url: blob.url,
    path: blob.pathname,
  }
}

/**
 * Удаляет файл из Vercel Blob
 */
export async function deleteFile(url: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN не настроен')
  }

  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

/**
 * Список файлов в Blob Store
 */
export async function listFiles(prefix?: string): Promise<BlobUploadResult[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN не настроен')
  }

  const { blobs } = await list({
    prefix,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return blobs.map((blob) => ({
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType || 'application/octet-stream',
    contentDisposition: blob.contentDisposition || '',
    size: blob.size,
  }))
}
