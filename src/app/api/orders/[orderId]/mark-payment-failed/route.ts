import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * POST /api/orders/:orderId/mark-payment-failed
 * Помечает заказ как «оплата не прошла», когда пользователь вернулся с Idram/банка по FAIL_URL.
 * Только для заказов с онлайн-оплатой (idram) и текущим paymentStatus PENDING.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    if (!orderId?.trim()) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId.trim(), userId: session.user.id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const isOnlinePayment = order.paymentMethod === 'idram'
    if (!isOnlinePayment) {
      return NextResponse.json(
        { error: 'Order is not an online payment order' },
        { status: 400 }
      )
    }

    if (order.paymentStatus !== 'PENDING') {
      // Уже SUCCESS или FAILED — идемпотентно считаем успехом
      return NextResponse.json({ success: true })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'FAILED' },
    })

    logger.debug('Order marked as payment failed', { orderId: order.id })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('mark-payment-failed error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
