import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const productSelect = {
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
      isActive: true,
    },
  },
  image: true,
  ingredients: true,
  isAvailable: true,
  stock: true,
  status: true,
  createdAt: true,
}

function getOrderBy(sortBy: string | null) {
  switch (sortBy) {
    case 'name-asc':
      return { name: 'asc' as const }
    case 'name-desc':
      return { name: 'desc' as const }
    case 'price-asc':
      return { price: 'asc' as const }
    case 'price-desc':
      return { price: 'desc' as const }
    case 'newest':
      return { createdAt: 'desc' as const }
    case 'oldest':
      return { createdAt: 'asc' as const }
    default:
      return { createdAt: 'desc' as const }
  }
}

// GET /api/products - получить товары (поддержка page/limit для каталога)
export async function GET(request: NextRequest) {
  const start = Date.now()
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const newProducts = searchParams.get('new')
    const saleProducts = searchParams.get('sale')
    const newToys = searchParams.get('newToys')
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const sortBy = searchParams.get('sortBy')

    const whereClause: Record<string, unknown> = {
      isAvailable: true,
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    } else if (category && category !== 'Все') {
      whereClause.category = {
        name: category,
      }
    }

    if (status) {
      whereClause.status = status
    }

    if (featured === 'true') {
      whereClause.status = 'HIT'
    }

    if (newProducts === 'true') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      whereClause.createdAt = { gte: thirtyDaysAgo }
    }

    if (saleProducts === 'true') {
      whereClause.salePrice = { not: null }
    }

    if (newToys === 'true') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      whereClause.createdAt = { gte: thirtyDaysAgo }
      whereClause.category = { name: 'Երաժշտական խաղալիքներ' }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ingredients: { contains: search, mode: 'insensitive' } },
      ]
    }

    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 0
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 0
    const usePagination = page > 0 && limit > 0

    const orderBy = getOrderBy(sortBy)

    const [products, total] = usePagination
      ? await Promise.all([
          prisma.product.findMany({
            where: whereClause,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            select: productSelect,
          }),
          prisma.product.count({ where: whereClause }),
        ])
      : [
          await prisma.product.findMany({
            where: whereClause,
            orderBy,
            select: productSelect,
          }),
          0,
        ]

    const normalizedProducts = products.map((product) => ({
      ...product,
      image: product.image && product.image.trim() !== '' ? product.image : null,
    }))

    const queryMs = Date.now() - start
    const body = usePagination
      ? {
          data: normalizedProducts,
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        }
      : normalizedProducts
    const sizeBytes = Buffer.byteLength(JSON.stringify(body), 'utf8')
    console.log(`[API /api/products] prisma: ${queryMs}ms, response size: ${sizeBytes} bytes`)

    const response = NextResponse.json(body)
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
