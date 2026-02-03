import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/orders/bulk-delete
 * Body: { ids: string[] }
 * Admin only. Deletes orders (cascade deletes order items). Returns { deleted: number, failed: { id, error }[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : []

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 })
    }

    const failed: { id: string; error: string }[] = []
    let deleted = 0

    for (const id of ids) {
      try {
        await prisma.order.delete({ where: { id } })
        deleted++
      } catch (e) {
        failed.push({ id, error: e instanceof Error ? e.message : 'Unknown error' })
      }
    }

    return NextResponse.json({ deleted, failed })
  } catch (error) {
    console.error('Bulk delete orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
