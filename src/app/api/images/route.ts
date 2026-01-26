import { NextResponse } from 'next/server'
import { listFiles } from '@/lib/blob'

export async function GET() {
  try {
    // Получаем список всех изображений из Vercel Blob Storage
    // Все изображения теперь хранятся в blob, включая изображения категорий
    const blobs = await listFiles('images/')
    
    // Фильтруем только изображения
    const imageFiles = blobs
      .filter(blob => {
        const ext = blob.pathname.toLowerCase().split('.').pop()
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
      })
      .map(blob => {
        const fileName = blob.pathname.split('/').pop() || blob.pathname
        return {
          name: fileName,
          path: blob.url, // Используем полный URL из blob
          category: getImageCategory(fileName)
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(imageFiles)
  } catch (error) {
    // Если произошла ошибка, возвращаем пустой массив
    console.error('Error reading images from blob storage:', error)
    return NextResponse.json([])
  }
}

/**
 * Определяет категорию изображения по названию
 */
function getImageCategory(filename: string): string {
  const name = filename.toLowerCase()
  
  if (name.includes('pide') || name.includes('пиде')) return 'Пиде'
  if (name.includes('kombo') || name.includes('комбо')) return 'Комбо'
  if (name.includes('sauce') || name.includes('соус')) return 'Соусы'
  if (name.includes('drink') || name.includes('напиток') || name.includes('cola') || name.includes('juice')) return 'Напитки'
  if (name.includes('snack') || name.includes('снэк') || name.includes('popcorn') || name.includes('fries')) return 'Снэк'
  
  return 'Другое'
}
