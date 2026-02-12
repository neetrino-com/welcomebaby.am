import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { OrderStatus } from '@/types'

// GET /api/admin/orders - получить все заказы (только для админов)
export async function GET(request: NextRequest) {
  try {
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

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const sortBy = searchParams.get('sortBy') || ''

    // Строим фильтр (как в Bank-integration-shop: статус заказа + статус оплаты)
    const whereClause: {
      status?: OrderStatus
      paymentStatus?: string | null
      createdAt?: { gte?: Date; lte?: Date }
    } = {}
    if (status) {
      whereClause.status = status as OrderStatus
    }
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus
    }
    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo)
      }
    }

    // Получаем заказы с пагинацией
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true
                }
              }
            }
          }
        },
        orderBy: sortBy === 'name_asc'
          ? { name: 'asc' }
          : sortBy === 'name_desc'
            ? { name: 'desc' }
            : { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ])

    // Сумма заказа — по цене на момент заказа (item.price), т.е. со скидкой, если была
    const ordersWithTotal = orders.map(order => ({
      ...order,
      totalAmount: order.items.reduce((sum: number, item) => sum + item.price * item.quantity, 0)
    }))

    return NextResponse.json({
      orders: ordersWithTotal,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
