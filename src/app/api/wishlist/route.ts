import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/wishlist - получить список товаров в wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Нормализуем изображения товаров - все товары без изображения получат null
    const normalizedItems = wishlistItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        image: (item.product.image && item.product.image.trim() !== '') 
          ? item.product.image 
          : null
      }
    }));

    return NextResponse.json({ 
      data: normalizedItems,
      count: normalizedItems.length 
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/wishlist - добавить товар в wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' }, 
        { status: 400 }
      );
    }

    // Проверяем, существует ли товар
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      );
    }

    // Проверяем, не добавлен ли уже товар в wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Product already in wishlist' }, 
        { status: 409 }
      );
    }

    // Добавляем товар в wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId: productId
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    // Нормализуем изображение товара
    const normalizedItem = {
      ...wishlistItem,
      product: {
        ...wishlistItem.product,
        image: (wishlistItem.product.image && wishlistItem.product.image.trim() !== '') 
          ? wishlistItem.product.image 
          : null
      }
    };

    return NextResponse.json({ 
      data: normalizedItem,
      message: 'Product added to wishlist' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - удалить товар из wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' }, 
        { status: 400 }
      );
    }

    // Удаляем товар из wishlist
    const deletedItem = await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        productId: productId
      }
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: 'Product not found in wishlist' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Product removed from wishlist' 
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
