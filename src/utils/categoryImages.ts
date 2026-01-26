/**
 * Утилита для получения изображений категорий
 * Все изображения хранятся в Vercel Blob Storage
 * Изображения должны быть загружены в blob и сохранены в БД (category.image)
 */

/**
 * Получить изображение категории из БД
 * Изображение должно быть blob URL, сохраненным в поле category.image
 * Если изображения нет, возвращает null (компоненты покажут placeholder)
 */
export const getCategoryImage = (category: { name: string; image?: string | null }): string | null => {
  // Проверяем изображение из БД (должно быть blob URL)
  if (category.image) {
    const url = String(category.image).trim()
    // Принимаем blob URLs или полные URLs
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      return url
    }
    // Если это старый локальный путь, игнорируем
    if (url && !url.startsWith('/images/')) {
      return url
    }
  }
  
  // Изображения категорий должны быть загружены в blob и сохранены в БД
  return null
}

