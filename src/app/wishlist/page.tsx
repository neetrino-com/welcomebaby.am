'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { Product } from '@/types'

interface WishlistItem {
  id: string
  productId: string
  createdAt: string
  product: Product & {
    category: {
      id: string
      name: string
    }
  }
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<WishlistLoading />}>
      <WishlistContent />
    </Suspense>
  )
}

function WishlistLoading() {
  return (
    <div className="min-h-screen relative bg-white pt-20 lg:pt-28 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-gray-300" style={{ borderTopColor: '#002c45' }}></div>
          <p className="text-gray-700 text-lg">Բեռնվում է...</p>
        </div>
      </div>
    </div>
  )
}

function WishlistContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  // Редирект на страницу входа, если пользователь не авторизован
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchWishlist()
  }, [session, status, router])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.data || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch wishlist:', errorData.error)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    setIsRemoving(productId)
    
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId))
        window.dispatchEvent(new CustomEvent('wishlist-changed'))
      } else {
        console.error('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setIsRemoving(null)
    }
  }

  const addToCart = async (product: Product) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })

      if (response.ok) {
        // Можно добавить уведомление об успешном добавлении
        console.log('Product added to cart')
      } else {
        console.error('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return <WishlistLoading />
  }

  if (!session) {
    return null // Редирект уже произошел
  }

  return (
    <div className="min-h-screen relative bg-white pt-20 lg:pt-28 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Նախընտրած</h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'արտադրանք' : 'արտադրանք'} նախընտրածում
            </p>
          </div>
        </div>

        {/* Список товаров */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ձեր նախընտրած ցանկը դատարկ է
            </h2>
            <p className="text-gray-600 mb-6">
              Ավելացրեք արտադրանք նախընտրածում, որպեսզի չկորցնեք դրանք
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 text-gray-900 rounded-lg transition-colors"
              style={{ backgroundColor: '#f3d98c' }}
            >
              Գնալ արտադրանքին
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow duration-200">
                {/* Изображение */}
                <div className="relative h-64 bg-gray-100">
                  <Link href={`/products/${item.product.id}`}>
                    {item.product.image && item.product.image !== 'no-image' ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        quality={85}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-6xl">
                        🧸
                      </div>
                    )}
                  </Link>

                  {/* Кнопка удаления из избранного */}
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    disabled={isRemoving === item.product.id}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full shadow-sm flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                    title="Удалить из избранного"
                  >
                    {isRemoving === item.product.id ? (
                      <div className="w-4 h-4 animate-spin border-2 border-gray-300 border-t-red-500 rounded-full" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    )}
                  </button>

                  {/* Метки */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.product.salePrice && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        ԶԵՂՉ
                      </span>
                    )}
                    {item.product.status === 'HIT' && (
                      <span className="text-gray-900 px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: '#f3d98c' }}
                      >
                        ՀԻԹ
                      </span>
                    )}
                    {item.product.status === 'NEW' && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        ՆՈՐ
                      </span>
                    )}
                  </div>
                </div>

                {/* Контент */}
                <div className="p-4">
                  {/* Название */}
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-[#002c45] transition-colors mb-2">
                      {item.product.name}
                    </h3>
                  </Link>

                  {/* Категория */}
                  <p className="text-sm text-gray-600 mb-2">
                    {item.product.category.name}
                  </p>

                  {/* Цена */}
                  <div className="flex items-center gap-2 mb-4">
                    {item.product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          {item.product.salePrice} ֏
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {item.product.price} ֏
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {item.product.price} ֏
                      </span>
                    )}
                  </div>

                  {/* Кнопка добавления в корзину */}
                  <button
                    onClick={() => addToCart(item.product)}
                    disabled={!item.product.stock || item.product.stock <= 0}
                    className={`w-full h-10 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 ${
                      item.product.stock && item.product.stock > 0
                        ? 'text-gray-900 hover:opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={item.product.stock && item.product.stock > 0 ? { backgroundColor: '#f3d98c' } : {}}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {item.product.stock && item.product.stock > 0 ? 'Զամբյուղում' : 'Չկա պահեստում'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
