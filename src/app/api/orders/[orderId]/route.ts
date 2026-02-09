import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { OrderDetails } from '@/types'

/**
 * GET /api/orders/:orderId
 * Returns full order details for the authenticated user.
 * 404 if order not found, 403 if order belongs to another user.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId } = await params
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    const details: OrderDetails = {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus ?? null,
      paymentMethod: order.paymentMethod,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      name: order.name,
      phone: order.phone,
      address: order.address,
      notes: order.notes,
      deliveryTime: order.deliveryTime,
      items: order.items.map((item) => ({
        product: {
          name: item.product.name,
          image: item.product.image
        },
        quantity: item.quantity,
        price: item.price
      }))
    }

    return NextResponse.json(details)
  } catch (error) {
    logger.error('Order details API error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
