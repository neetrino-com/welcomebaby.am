import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const VALID_PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED'] as const

/**
 * PATCH /api/admin/orders/[id]/payment-status
 * Изменить статус оплаты вручную (как в Bank-integration-shop).
 * Допустимые значения: PENDING, SUCCESS, FAILED.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const paymentStatus = body.paymentStatus as string | undefined

    if (
      !paymentStatus ||
      !VALID_PAYMENT_STATUSES.includes(paymentStatus as (typeof VALID_PAYMENT_STATUSES)[number])
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid paymentStatus. Must be one of: ' +
            VALID_PAYMENT_STATUSES.join(', '),
        },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, image: true },
            },
          },
        },
      },
    })

    const totalAmount = updated.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    return NextResponse.json({
      ...updated,
      totalAmount,
    })
  } catch (error) {
    console.error('Payment status update error', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update payment status',
      },
      { status: 500 }
    )
  }
}
