import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем, что пользователь существует и не удален
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        deletedAt: null
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Мягкое удаление - помечаем пользователя как удаленного
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        deletedAt: new Date(),
        // Анонимизируем персональные данные
        name: 'Deleted User',
        email: `deleted_${user.id}@deleted.com`,
        phone: null,
        address: null
      }
    })

    // Заказы пользователя остаются в системе для аналитики
    // но связь с пользователем разрывается (userId становится null)
    await prisma.order.updateMany({
      where: {
        userId: session.user.id
      },
      data: {
        userId: null,
        name: 'Deleted User'
      }
    })

    return NextResponse.json(
      { message: 'Account successfully deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete account API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
