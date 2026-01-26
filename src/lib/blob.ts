/**
 * Утилита для работы с Vercel Blob Storage
 * Поддерживает как локальную разработку (файловая система), так и production (Blob)
 */

import { put, del, list } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export interface BlobUploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
  size: number
}

/**
 * Загружает файл в Vercel Blob или локальную файловую систему
 */
export async function uploadFile(
  file: File,
  fileName: string
): Promise<{ url: string; path: string }> {
  // Если есть токен Blob - используем Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
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

  // Fallback для локальной разработки - сохраняем в public/images
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Определяем путь для локального сохранения
  const uploadDir = join(process.cwd(), 'public', 'images')
  
  // Создаем папку если не существует
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    // Папка уже существует
  }

  // Сохраняем файл локально
  const localPath = join(uploadDir, fileName.split('/').pop() || fileName)
  await writeFile(localPath, buffer)

  // Возвращаем относительный путь
  const relativePath = `/images/${fileName.split('/').pop() || fileName}`
  
  return {
    url: relativePath,
    path: relativePath,
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
