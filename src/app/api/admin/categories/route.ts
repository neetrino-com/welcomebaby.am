import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image, sortOrder, showInMainPage, isActive } = body
    
    // Нормализуем URL изображения
    // Blob URLs сохраняем как есть, локальные пути больше не используем
    const normalizedImage = ((): string | null => {
      if (!image || typeof image !== 'string') return null
      const trimmed = image.trim()
      if (!trimmed) return null
      
      // Игнорируем blob: и data: URLs (временные)
      if (/^(blob:|data:)/i.test(trimmed)) return null
      
      // Если это полный URL от blob storage, сохраняем как есть
      if (trimmed.startsWith('https://') && trimmed.includes('public.blob.vercel-storage.com')) {
        return trimmed
      }
      
      // Если это полный HTTP URL, сохраняем как есть
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed
      }
      
      // Старые локальные пути /images/ больше не поддерживаются
      // Возвращаем null, чтобы пользователь загрузил изображение в blob
      if (trimmed.startsWith('/images/')) {
        return null
      }
      
      // Любые другие пути считаем невалидными
      return null
    })()

    // Валидация
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Проверка на уникальность имени
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        image: normalizedImage,
        sortOrder: sortOrder || 0,
        showInMainPage: showInMainPage || false,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}