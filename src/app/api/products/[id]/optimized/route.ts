import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/[id]/optimized - оптимизированный endpoint для страницы продукта
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Загружаем продукт и похожие товары в одном запросе
    const [product, similarProducts] = await Promise.all([
      // Основной продукт
      prisma.product.findUnique({
        where: {
          id,
          isAvailable: true,
          published: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          image: true,
          ingredients: true,
          isAvailable: true,
          status: true,
          createdAt: true
        }
      }),
      
      // Похожие товары (исключаем текущий)
      prisma.product.findMany({
        where: {
          isAvailable: true,
          published: true,
          id: { not: id }
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          image: true,
          ingredients: true,
          isAvailable: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 4 // Берем только 4 похожих товара
      })
    ])

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Нормализуем изображения - товары без изображения получат null
    const normalizedProduct = {
      ...product,
      image: (product.image && product.image.trim() !== '') 
        ? product.image 
        : null
    }

    const normalizedSimilarProducts = similarProducts.map(p => ({
      ...p,
      image: (p.image && p.image.trim() !== '') 
        ? p.image 
        : null
    }))

    // Возвращаем объединенные данные
    const response = {
      product: normalizedProduct,
      similarProducts: normalizedSimilarProducts
    }

    // Агрессивное кэширование на 10 минут
    const nextResponse = NextResponse.json(response)
    nextResponse.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    nextResponse.headers.set('CDN-Cache-Control', 'public, s-maxage=3600')
    
    return nextResponse
  } catch (error) {
    console.error('Error fetching optimized product data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product data' },
      { status: 500 }
    )
  }
}
