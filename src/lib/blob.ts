/**
 * Утилита для работы с Cloudflare R2 (S3‑совместимое хранилище)
 * Обёртка сохраняет старый интерфейс (uploadFile / deleteFile / listFiles),
 * чтобы не менять остальные части кода.
 *
 * Требуемые переменные окружения:
 * - S3_ENDPOINT   — S3 endpoint R2, напр.: https://<account>.r2.cloudflarestorage.com
 * - S3_ACCESS_KEY — Access Key ID
 * - S3_SECRET_KEY — Secret Access Key
 * - S3_BUCKET     — имя bucket'а (напр.: welcomebaby)
 * - S3_REGION     — регион, для R2 обычно "auto"
 * - S3_PUBLIC_URL — публичный base URL, напр. https://<account>.r2.cloudflarestorage.com/<bucket>
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'

const S3_ENDPOINT = process.env.S3_ENDPOINT
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY
const S3_SECRET_KEY = process.env.S3_SECRET_KEY
const S3_BUCKET = process.env.S3_BUCKET
const S3_REGION = process.env.S3_REGION || 'auto'
// Публичный base URL, по которому фронт будет забирать файлы
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL

const missingS3Message =
  'S3/R2 storage not configured. Please set S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET and S3_PUBLIC_URL.'

function getS3Client(): S3Client {
  if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_BUCKET) {
    throw new Error(missingS3Message)
  }

  return new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
  })
}

function getPublicUrlForKey(key: string): string {
  if (!S3_PUBLIC_URL) {
    throw new Error(missingS3Message)
  }
  const base = S3_PUBLIC_URL.replace(/\/+$/, '')
  // encodeURIComponent, но оставляем / как разделитель путей
  const encodedKey = key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
  return `${base}/${encodedKey}`
}

export interface BlobUploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
  size: number
}

/**
 * Загружает файл в Cloudflare R2 (S3‑совместимое хранилище)
 */
export async function uploadFile(
  file: File,
  fileName: string
): Promise<{ url: string; path: string }> {
  const client = getS3Client()
  if (!S3_BUCKET) {
    throw new Error(missingS3Message)
  }

  // File в Next.js имеет метод arrayBuffer — конвертируем в Buffer для S3 клиента
  const arrayBuffer = await file.arrayBuffer()
  const body = Buffer.from(arrayBuffer)

  const key = fileName

  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type,
      // R2 управляет публичностью на уровне bucket'а; ACL можно не указывать
    })
  )

  const url = getPublicUrlForKey(key)

  // path — "логический" путь/ключ внутри bucket'а
  return { url, path: key }
}

/**
 * Удаляет файл из R2 по URL или ключу
 */
export async function deleteFile(url: string): Promise<void> {
  const client = getS3Client()
  if (!S3_BUCKET) {
    throw new Error(missingS3Message)
  }

  let key = url

  // Если передан полный URL, вырезаем ключ относительно S3_PUBLIC_URL
  if (/^https?:\/\//i.test(url)) {
    if (!S3_PUBLIC_URL) {
      throw new Error(missingS3Message)
    }
    const base = S3_PUBLIC_URL.replace(/\/+$/, '')
    if (!url.startsWith(base + '/')) {
      throw new Error('Invalid R2 URL: does not match S3_PUBLIC_URL')
    }
    key = decodeURIComponent(url.substring(base.length + 1))
  } else {
    // Если ключ начинается с / — убираем его
    key = url.replace(/^\/+/, '')
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  )
}

/**
 * Список файлов в bucket'е R2
 */
export async function listFiles(prefix?: string): Promise<BlobUploadResult[]> {
  const client = getS3Client()
  if (!S3_BUCKET) {
    throw new Error(missingS3Message)
  }

  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: prefix,
  })

  const result = await client.send(command)
  const contents = result.Contents || []

  return contents
    .filter((obj) => !!obj.Key)
    .map((obj) => ({
      url: getPublicUrlForKey(obj.Key!),
      pathname: obj.Key!,
      contentType: 'application/octet-stream',
      contentDisposition: '',
      size: obj.Size ?? 0,
    }))
}
