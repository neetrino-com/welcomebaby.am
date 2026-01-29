'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useCallback } from 'react'
import { ArrowLeft, ShoppingCart, Plus, Minus, Star, Clock, MapPin, Phone, Zap } from 'lucide-react'
import { Product } from '@/types'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductCarousel from '@/components/ProductCarousel'
import { useCart } from '@/hooks/useCart'
import { prisma } from '@/lib/prisma'
import { parseIngredients, hasIngredients } from '@/utils/ingredients'
import { formatPrice } from '@/utils/priceUtils'
import { isValidImagePath } from '@/utils/imageUtils'

// Server Component - данные загружаются на сервере
export default async function OptimizedProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    // Загружаем данные на сервере
    const [product, similarProducts] = await Promise.all([
      // Основной продукт
      prisma.product.findUnique({
        where: {
          id,
          isAvailable: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          salePrice: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          image: true,
          ingredients: true,
          isAvailable: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          stock: true,
          images: true
        }
      }),
      
      // Похожие товары (исключаем текущий)
      prisma.product.findMany({
        where: {
          isAvailable: true,
          id: { not: id }
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          salePrice: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          image: true,
          ingredients: true,
          isAvailable: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          stock: true,
          images: true
        },
        orderBy: { createdAt: 'desc' },
        take: 4
      })
    ])

    if (!product) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50" style={{ overflow: 'auto' }}>
        
        {/* Breadcrumb */}
        <div className="bg-white pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-orange-500">Главная</Link>
              <span className="text-gray-400">/</span>
              <Link href="/products" className="text-gray-500 hover:text-orange-500">Կատալոգ</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link 
            href="/products"
            className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Назад к каталогу
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-visible group relative">
                <div className="relative h-96 overflow-visible">
                  {/* 3D Product Container */}
                  {product.image && product.image !== 'no-image' && isValidImagePath(product.image) ? (
                    <div className="relative w-full h-full">
                      {/* 3D Product Image with floating effect */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%+1rem)] h-[calc(100%+1rem)]">
                        {/* 3D Shadow Layer */}
                        <div 
                          className="absolute inset-0 rounded-3xl transform translate-y-2 translate-x-1 group-hover:translate-y-3 group-hover:translate-x-2 transition-all duration-700"
                          style={{ 
                            backgroundColor: 'rgba(255, 221, 132, 0.1)',
                            filter: 'none'
                          }}
                        />
                        
                        {/* Main 3D Product Image - Оптимизированное изображение */}
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                          className="relative w-full h-full object-contain group-hover:scale-125 group-hover:-translate-y-3 group-hover:rotate-2 transition-all duration-700 ease-out"
                          style={{
                            filter: 'none',
                            transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
                            imageRendering: 'crisp-edges' as const,
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-[calc(100%+3rem)] h-[calc(100%+3rem)] flex items-center justify-center opacity-70 group-hover:opacity-90 transition-opacity duration-500 text-8xl"
                      style={{
                        filter: 'none',
                        transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
                      }}
                    >
                      🧸
                    </div>
                  )}
                  
                  {/* 3D Floating Badges */}
                  <div className="absolute top-12 left-4 flex flex-col gap-2 z-20">
                    {/* 3D Category Badge */}
                    <div 
                      className="text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500"
                      style={{
                        backgroundColor: '#ffdd84',
                        boxShadow: '0 10px 25px rgba(255, 107, 53, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {product.category?.name || 'Без категории'}
                    </div>
                    
                    {/* 3D Special Badge */}
                    {product.status === 'HIT' && (
                      <div 
                        className="text-white px-3 py-1 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-1 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500"
                        style={{
                          backgroundColor: '#ffdd84',
                          boxShadow: '0 10px 25px rgba(255, 193, 7, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Star className="w-3 h-3" />
                        ՀԻԹ
                      </div>
                    )}
                    
                    {product.status === 'NEW' && (
                      <div 
                        className="text-white px-3 py-1 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-1 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500"
                        style={{
                          backgroundColor: '#ffdd84',
                          boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Zap className="w-3 h-3" />
                        ՆՈՐ
                      </div>
                    )}
                    
                    {product.status === 'CLASSIC' && (
                      <div 
                        className="text-white px-3 py-1 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-1 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500"
                        style={{
                          backgroundColor: '#ffdd84',
                          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Star className="w-3 h-3" />
                        ԴԱՍԻԿ
                      </div>
                    )}
                  </div>

                </div>
                
                {/* 3D Floating Decorative Elements - positioned inside container */}
                <div 
                  className="absolute top-2 right-2 w-6 h-6 rounded-full opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: '#ffdd84',
                    boxShadow: '0 10px 25px rgba(255, 221, 132, 0.3)',
                    filter: 'blur(1px)',
                  }}
                />
                <div 
                  className="absolute bottom-2 left-2 w-4 h-4 rounded-full opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: '#ffdd84',
                    boxShadow: '0 10px 25px rgba(255, 221, 132, 0.3)',
                    filter: 'blur(1px)',
                  }}
                />
                <div 
                  className="absolute top-1/2 left-2 w-2 h-2 rounded-full opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-125"
                  style={{
                    backgroundColor: '#ffdd84',
                    boxShadow: '0 5px 15px rgba(255, 221, 132, 0.2)',
                    filter: 'blur(0.5px)',
                  }}
                />
              </div>

              {/* Additional Info */}
              <div style={{ marginTop: '50px' }}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Информация о товаре:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Категория: {product.category?.name || 'Без категории'}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Время приготовления: 15-20 минут
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Вес: ~300г
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Только свежие ингредиенты
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Без консервантов
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                
                {/* Price */}
                <div className="flex items-center space-x-4 mb-8">
                  {product.salePrice ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-green-600">{formatPrice(product.salePrice)} ֏</span>
                        <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                          🔥 СКИДКА
                        </span>
                      </div>
                      <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)} ֏</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-[#f3d98c]">{formatPrice(product.price)} ֏</span>
                  )}
                  <span className="text-lg text-gray-500">за порцию</span>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ингредиенты:</h3>
                <div className="flex flex-wrap gap-3">
                  {hasIngredients(product.ingredients) ? parseIngredients(product.ingredients).map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-orange-100 text-orange-800 text-sm rounded-full font-medium hover:bg-orange-200 transition-colors"
                    >
                      {ingredient}
                    </span>
                  )) : (
                    <p className="text-gray-500 text-sm">Ингредиенты не указаны</p>
                  )}
                </div>
              </div>

              {/* Quantity and Add to Cart - Client Component */}
              <div className="space-y-6">
                <ProductQuantityControls product={product} />
              </div>

              {/* Product Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-semibold text-gray-900">15-20 мин</div>
                      <div className="text-sm text-gray-600">Время приготовления</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-semibold text-gray-900">30 мин</div>
                      <div className="text-sm text-gray-600">Доставка</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-semibold text-gray-900">24/7</div>
                      <div className="text-sm text-gray-600">Поддержка</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Carousel */}
          {similarProducts.length > 0 && (
            <SimilarProductsCarousel products={similarProducts} />
          )}
        </div>

        {/* Hide Footer on Mobile and Tablet */}
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading product page:', error)
    notFound()
  }
}

// Client Component для карусели похожих товаров
function SimilarProductsCarousel({ products }: { products: Product[] }) {
  'use client'
  const { addItem } = useCart()
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    setAddedToCart(prev => new Set(prev).add(product.id))
  }

  return (
    <ProductCarousel
      products={products}
      title="Նմանատիպ ապրանքներ"
      onAddToCart={handleAddToCart}
      addedToCart={addedToCart}
    />
  )
}

// Client Component для интерактивности
function ProductQuantityControls({ product }: { product: Product }) {
  'use client'
  
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = useCallback(() => {
    addItem(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }, [product, quantity, addItem])

  return (
    <>
      <div className="flex items-center space-x-6">
        <label className="text-lg font-medium text-gray-900">Количество:</label>
        <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-orange-100 transition-colors text-gray-700 hover:text-orange-600"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="px-6 py-3 min-w-[4rem] text-center text-lg font-semibold bg-gray-50 text-gray-900">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:bg-orange-100 transition-colors text-gray-700 hover:text-orange-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleAddToCart}
          className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
            addedToCart
              ? 'bg-green-500 text-white scale-105 shadow-lg'
              : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          <ShoppingCart className="h-6 w-6" />
          <span>
            {addedToCart ? '✓ Добавлено в корзину!' : 'Добавить в корзину'}
          </span>
        </button>
      </div>
    </>
  )
}
