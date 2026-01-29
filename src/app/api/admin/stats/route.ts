import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Временно отключаем проверку авторизации для тестирования
    // const session = await getServerSession(authOptions)
    // if (!session || session.user?.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    // Получаем статистику
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalDeliveryTypes,
      totalCategories
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      }),
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      }),
      prisma.order.count({
        where: {
          status: 'DELIVERED'
        }
      }),
      prisma.deliveryType.count(),
      prisma.category.count()
    ])

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      completedOrders,
      totalDeliveryTypes,
      totalCategories
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
