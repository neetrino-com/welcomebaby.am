import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/admin/products/[id]/status
 * Body: { status: "active" | "draft" }
 * Admin only. Updates product visibility (published). Does NOT delete.
 */
export async function PATCH(
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

    const body = await request.json()
    const status = body?.status
    if (status !== 'active' && status !== 'draft') {
      return NextResponse.json(
        { error: 'status must be "active" or "draft"' },
        { status: 400 }
      )
    }

    const published = status === 'active'

    await prisma.product.update({
      where: { id },
      data: { published }
    })

    return NextResponse.json({ success: true, status, published })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    console.error('Error updating product status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
