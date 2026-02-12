import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET /api/admin/products/[id] - получить товар по ID для админки
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Проверяем аутентификацию
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем права администратора
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Нормализуем изображение - товар без изображения получит null
    const normalizedProduct = {
      ...product,
      image: (product.image && product.image.trim() !== '') 
        ? product.image 
        : null
    }

    return NextResponse.json(normalizedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/[id] - обновить товар (только для админов)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Проверяем аутентификацию
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем права администратора
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Получаем данные из запроса
    const body = await request.json()
    const { name, description, price, salePrice, categoryId, image, images, ingredients, isAvailable, status, published, stock } = body

    // Проверяем существование товара
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Валидация цены
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      )
    }

    // Валидация скидочной цены
    if (salePrice !== undefined && salePrice !== null) {
      if (typeof salePrice !== 'number' || salePrice <= 0) {
        return NextResponse.json(
          { error: 'Sale price must be a positive number' },
          { status: 400 }
        )
      }
      const currentPrice = price !== undefined ? price : existingProduct.price
      if (salePrice >= currentPrice) {
        return NextResponse.json(
          { error: 'Sale price must be less than regular price' },
          { status: 400 }
        )
      }
    }

    // Валидация категории
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })
      
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        )
      }
    }

    // Валидация статуса (пустая строка означает REGULAR)
    if (status !== undefined) {
      const validStatuses = ['', 'REGULAR', 'HIT', 'NEW', 'CLASSIC', 'BANNER']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: ' + validStatuses.filter(s => s).join(', ') },
          { status: 400 }
        )
      }
    }

    // Обновляем товар
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(salePrice !== undefined && { salePrice: salePrice === null || salePrice === '' ? null : salePrice }),
        ...(categoryId && { categoryId }),
        ...(image !== undefined && { image: (image && image.trim() !== '' && image !== 'no-image') ? image : 'no-image' }),
        ...(images !== undefined && { images }),
        ...(ingredients && { ingredients }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(status !== undefined && { status: status || 'REGULAR' }),
        ...(published !== undefined && { published: !!published }),
        ...(stock !== undefined && { stock: Math.max(0, typeof stock === 'number' ? stock : parseInt(stock, 10) || 0) })
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

    // Нормализуем изображение - товар без изображения получит null
    const normalizedProduct = {
      ...updatedProduct,
      image: (updatedProduct.image && updatedProduct.image.trim() !== '' && updatedProduct.image !== 'no-image') 
        ? updatedProduct.image 
        : null
    }

    return NextResponse.json(normalizedProduct)
  } catch (error) {
    // Логируем полные детали только на сервере
    console.error('Error updating product:', error)
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    }
    
    // В проде не раскрываем детали ошибок клиенту
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id] — безвозвратное удаление (только для админов)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}