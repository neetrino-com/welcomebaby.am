import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/products - получить все товары
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const newProducts = searchParams.get('new')
    const saleProducts = searchParams.get('sale')
    const newToys = searchParams.get('newToys')

    const whereClause: any = {
      isAvailable: true
    }

    if (category && category !== 'Все') {
      whereClause.category = {
        name: category
      }
    }

    if (status) {
      whereClause.status = status
    }

    if (featured === 'true') {
      whereClause.status = 'HIT'
    }

    if (newProducts === 'true') {
      // Товары добавленные за последние 30 дней
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      whereClause.createdAt = {
        gte: thirtyDaysAgo
      }
    }

    if (saleProducts === 'true') {
      whereClause.salePrice = {
        not: null
      }
    }

    if (newToys === 'true') {
      // Новые музыкальные игрушки за последние 30 дней
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      whereClause.createdAt = {
        gte: thirtyDaysAgo
      }
      whereClause.category = {
        name: 'Երաժշտական խաղալիքներ'
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ingredients: { contains: search, mode: 'insensitive' } }
      ]
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
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
        stock: true,
        status: true,
        createdAt: true
      }
    })

    // Нормализуем изображения - все товары без изображения получат nophoto.jpg
    const normalizedProducts = products.map(product => ({
      ...product,
      image: (product.image && product.image.trim() !== '') 
        ? product.image 
        : '/images/nophoto.jpg'
    }))

    // Возвращаем массив продуктов напрямую
    const response = NextResponse.json(normalizedProducts)
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600')
    
    return response
  } catch (error) {
    logger.error('Error fetching products', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - создать товар (для админки)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, ...productData } = body
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }
    
    const product = await prisma.product.create({
      data: {
        ...productData,
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    logger.error('Error creating product', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
