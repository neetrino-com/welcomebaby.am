import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getIdramCredentials, getIdramPaymentFormUrl } from '@/lib/payments/idram'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    let body: { orderId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const { orderId } = body
    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const credentials = getIdramCredentials()
    if (!credentials.recAccount || !credentials.secretKey) {
      logger.error('Idram init: credentials not configured')
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId.trim() } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    if (session?.user?.id && order.userId && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const amount = order.total
    if (amount <= 0 || !Number.isFinite(amount)) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 })
    }
    const amountStr = amount.toFixed(2)

    const formUrl = getIdramPaymentFormUrl()
    const formData: Record<string, string> = {
      EDP_LANGUAGE: 'AM',
      EDP_REC_ACCOUNT: credentials.recAccount,
      EDP_DESCRIPTION: `Order #${orderId}`,
      EDP_AMOUNT: amountStr,
      EDP_BILL_NO: orderId,
    }

    logger.debug('Idram init', { orderId, amount: amountStr })
    return NextResponse.json({ success: true, formUrl, formData })
  } catch (error) {
    logger.error('Idram init error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
