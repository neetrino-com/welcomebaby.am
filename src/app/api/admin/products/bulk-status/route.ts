import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/admin/products/bulk-status
 * Body: { ids: string[], status: "active" | "draft" }
 * Admin only. Updates visibility for multiple products. Does NOT delete.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : []
    const status = body?.status

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 })
    }
    if (status !== 'active' && status !== 'draft') {
      return NextResponse.json(
        { error: 'status must be "active" or "draft"' },
        { status: 400 }
      )
    }

    const published = status === 'active'

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { published }
    })

    return NextResponse.json({
      success: true,
      status,
      updated: result.count
    })
  } catch (error) {
    console.error('Bulk status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
