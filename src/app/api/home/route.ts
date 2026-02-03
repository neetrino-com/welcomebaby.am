import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

function normalizeImage(product: { image: string | null }) {
  return {
    ...product,
    image: product.image && product.image.trim() !== '' ? product.image : null,
  }
}

// GET /api/home — все секции главной в одном ответе (убирает 6 клиентских запросов)
export async function GET() {
  const start = Date.now()
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      allProducts,
      featuredProducts,
      bannerProducts,
      newProducts,
      saleProducts,
      newToysProducts,
    ] = await Promise.all([
      prisma.product.findMany({
        where: { isAvailable: true, published: true },
        orderBy: { createdAt: 'desc' },
        select: productSelect,
      }),
      prisma.product.findMany({
        where: { isAvailable: true, published: true, status: 'HIT' },
        orderBy: { createdAt: 'desc' },
        select: productSelect,
      }),
      prisma.product.findMany({
        where: { isAvailable: true, published: true, status: 'BANNER' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: productSelect,
      }),
      prisma.product.findMany({
        where: {
          isAvailable: true,
          published: true,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        select: productSelect,
      }),
      prisma.product.findMany({
        where: { isAvailable: true, published: true, salePrice: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: productSelect,
      }),
      prisma.product.findMany({
        where: {
          isAvailable: true,
          published: true,
          createdAt: { gte: thirtyDaysAgo },
          category: { name: 'Երաժշտական խաղալիքներ' },
        },
        orderBy: { createdAt: 'desc' },
        select: productSelect,
      }),
    ])

    const queryMs = Date.now() - start

    const products = allProducts.map(normalizeImage)
    const featured = featuredProducts.map(normalizeImage)
    const banner = bannerProducts[0] ? normalizeImage(bannerProducts[0]) : null
    const newP = newProducts.map(normalizeImage)
    const sale = saleProducts.map(normalizeImage)
    const newToys = newToysProducts.map(normalizeImage)

    const comboProducts = products.filter((p: { categoryId: string }) => p.categoryId === 'Հյուսեր').slice(0, 4)

    const body = {
      products,
      comboProducts,
      featuredProducts: featured,
      bannerProduct: banner,
      newProducts: newP,
      saleProducts: sale,
      newToysProducts: newToys,
    }
    const response = NextResponse.json(body)
    const sizeBytes = Buffer.byteLength(JSON.stringify(body), 'utf8')
    console.log(`[API /api/home] prisma queries: ${queryMs}ms, response size: ${sizeBytes} bytes`)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('[API /api/home] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    )
  }
}
