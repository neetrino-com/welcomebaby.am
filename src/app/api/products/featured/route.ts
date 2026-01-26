import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/featured - получить товары-хиты
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        status: 'HIT'
      },
      orderBy: { createdAt: 'desc' },
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
        isAvailable: true,
        status: true,
        createdAt: true
      }
    })

    // Нормализуем изображения - все товары без изображения получат null
    const normalizedProducts = products.map(product => ({
      ...product,
      image: (product.image && product.image.trim() !== '') 
        ? product.image 
        : null
    }))

    return NextResponse.json(normalizedProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}