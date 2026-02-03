import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Invalid product IDs' },
        { status: 400 }
      )
    }

    // Проверяем, какие продукты существуют
    const existingProducts = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        isAvailable: true,
        published: true
      },
      select: { id: true }
    })

    const validIds = existingProducts.map(product => product.id)

    return NextResponse.json({ validIds })
  } catch (error) {
    console.error('Product validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
