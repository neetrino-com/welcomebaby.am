import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  },
}

// GET /api/products/[id]/details — товар + похожие в одном запросе (убирает waterfall)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now()
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id, isAvailable: true },
      include: productInclude,
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const categoryId = product.categoryId
    let related = await prisma.product.findMany({
      where: {
        isAvailable: true,
        id: { not: id },
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: productInclude,
    })

    if (related.length < 4) {
      const excludeIds = [id, ...related.map((p) => p.id)]
      const more = await prisma.product.findMany({
        where: {
          isAvailable: true,
          id: { notIn: excludeIds },
        },
        orderBy: { createdAt: 'desc' },
        take: 8 - related.length,
        include: productInclude,
      })
      related = [...related, ...more].slice(0, 8)
    }

    const normalizeImage = (p: { image: string | null }) => ({
      ...p,
      image: p.image && p.image.trim() !== '' ? p.image : null,
    })

    const productNormalized = normalizeImage(product)
    const relatedNormalized = related.map(normalizeImage)

    const body = { product: productNormalized, relatedProducts: relatedNormalized }
    const queryMs = Date.now() - start
    const sizeBytes = Buffer.byteLength(JSON.stringify(body), 'utf8')
    console.log(`[API /api/products/${id}/details] prisma: ${queryMs}ms, response size: ${sizeBytes} bytes`)

    const response = NextResponse.json(body)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('[API /api/products/[id]/details] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
