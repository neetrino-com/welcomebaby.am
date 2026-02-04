/**
 * Утилита для работы с Vercel Blob Storage
 * Использует welcomebaby_READ_WRITE_TOKEN (или BLOB_READ_WRITE_TOKEN для совместимости)
 */

import { put, del, list } from '@vercel/blob'

const getBlobToken = () =>
  process.env.welcomebaby_READ_WRITE_TOKEN ||
  process.env.WELCOMEBABY_READ_WRITE_TOKEN ||
  process.env.BLOB_READ_WRITE_TOKEN

export interface BlobUploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
  size: number
}

/**
 * Загружает файл в Vercel Blob Storage
 */
export async function uploadFile(
  file: File,
  fileName: string
): Promise<{ url: string; path: string }> {
  const token = getBlobToken()
  if (!token) {
    throw new Error(
      'welcomebaby_READ_WRITE_TOKEN не настроен. ' +
      'Добавьте токен в Vercel Environment Variables.'
    )
  }

  const blob = await put(fileName, file, {
    access: 'public',
    token,
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
  const token = getBlobToken()
  if (!token) throw new Error('welcomebaby_READ_WRITE_TOKEN не настроен')
  await del(url, { token })
}

/**
 * Список файлов в Blob Store
 */
export async function listFiles(prefix?: string): Promise<BlobUploadResult[]> {
  const token = getBlobToken()
  if (!token) throw new Error('welcomebaby_READ_WRITE_TOKEN не настроен')
  const { blobs } = await list({ prefix, token })

  return blobs.map((blob) => ({
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType || 'application/octet-stream',
    contentDisposition: blob.contentDisposition || '',
    size: blob.size,
  }))
}
