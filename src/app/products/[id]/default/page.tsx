'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { Product } from '@/types'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductCarousel from '@/components/ProductCarousel'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/priceUtils'
import { isValidImagePath } from '@/utils/imageUtils'

export default function DefaultProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [addedToCartSimilar, setAddedToCartSimilar] = useState<Set<string>>(new Set())
  const [isInWishlist, setIsInWishlist] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/products/${id}/details`, { cache: 'default' })
      if (!res.ok) {
        if (res.status === 404) notFound()
        throw new Error('Failed to load product')
      }
      const { product: productData, relatedProducts: similarData } = await res.json()
      setProduct(productData)
      setSimilarProducts(similarData || [])
    } catch (error) {
      console.error('Error fetching product:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#002c45', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Բեռնվում է արտադրանքը...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 h-16">
          <Link 
            href="/products"
            className="flex items-center text-gray-600 transition-colors"
            style={{ '--hover-color': '#002c45' } as React.CSSProperties & { '--hover-color': string }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#002c45'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full transition-colors ${
                isInWishlist ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Отступ для fixed хедера */}
      <div className="lg:hidden h-20"></div>
      <div className="hidden lg:block h-28"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="hidden lg:flex items-center space-x-2 text-sm mb-8">
          <Link 
            href="/" 
            className="text-gray-500 transition-colors"
            style={{ '--hover-color': '#002c45' } as React.CSSProperties & { '--hover-color': string }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#002c45'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            Գլխավոր
          </Link>
          <span className="text-gray-400">/</span>
          <Link 
            href="/products" 
            className="text-gray-500 transition-colors"
            style={{ '--hover-color': '#002c45' } as React.CSSProperties & { '--hover-color': string }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#002c45'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            Արտադրանք
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Back Button - Desktop */}
        <Link 
          href="/products"
          className="hidden lg:inline-flex items-center text-gray-600 mb-8 group transition-colors"
          style={{ '--hover-color': '#002c45' } as React.CSSProperties & { '--hover-color': string }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#002c45'}
          onMouseLeave={(e) => e.currentTarget.style.color = ''}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Վերադառնալ կատալոգ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group relative">
              <div className="relative h-80 lg:h-96">
                {product.image && product.image !== 'no-image' && isValidImagePath(product.image) ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-6xl">
                    🧸
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.status === 'HIT' && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ՀԻԹ
                    </span>
                  )}
                  {product.status === 'NEW' && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ՆՈՐ
                    </span>
                  )}
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="text-white px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#002c45' }}>
                      ԶԵՂՉ
                    </span>
                  )}
                </div>

                {/* Wishlist Button - Desktop */}
                <button
                  onClick={handleToggleWishlist}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                    isInWishlist ? 'text-red-500 bg-white shadow-lg' : 'text-gray-400 bg-white/80 hover:text-red-500 hover:bg-white'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Additional Images Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.image && product.image !== 'no-image' && isValidImagePath(product.image) ? (
                    <Image
                      src={product.image}
                      alt={`${product.name} ${i}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🧸
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">{(product as Product & { category?: { name: string } }).category?.name || 'Без категории'}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {product.description && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4 mb-6">
              {product.salePrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-green-600">{formatPrice(product.salePrice)} ֏</span>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)} ֏</span>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-medium">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold" style={{ color: '#002c45' }}>{formatPrice(product.price)} ֏</span>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-900">Քանակ:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 transition-colors text-gray-700"
                    style={{ 
                      '--hover-bg': '#002c4533',
                      '--hover-text': '#002c45'
                    } as React.CSSProperties & { '--hover-bg': string; '--hover-text': string }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#002c4533'
                      e.currentTarget.style.color = '#002c45'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.color = ''
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-3 min-w-[3rem] text-center font-semibold bg-gray-50 text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 transition-colors text-gray-700"
                    style={{ 
                      '--hover-bg': '#002c4533',
                      '--hover-text': '#002c45'
                    } as React.CSSProperties & { '--hover-bg': string; '--hover-text': string }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#002c4533'
                      e.currentTarget.style.color = '#002c45'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.color = ''
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                  addedToCart
                    ? 'bg-green-500 text-white scale-105 shadow-lg'
                    : 'text-white hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
                style={addedToCart ? {} : { backgroundColor: '#002c45' } as React.CSSProperties}
                onMouseEnter={(e) => {
                  if (!addedToCart) {
                    e.currentTarget.style.backgroundColor = '#003d5c'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!addedToCart) {
                    e.currentTarget.style.backgroundColor = '#002c45'
                  }
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>
                  {addedToCart ? '✓ Ավելացվել է զամբյուղում!' : 'Զամբյուղում ավելացնել'}
                </span>
              </button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5" style={{ color: '#002c45' }} />
                  <div>
                    <div className="font-semibold text-gray-900">Արագ առաքում</div>
                    <div className="text-sm text-gray-600">1-2 օր</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5" style={{ color: '#002c45' }} />
                  <div>
                    <div className="font-semibold text-gray-900">Որակի երաշխիք</div>
                    <div className="text-sm text-gray-600">30 օր</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <RotateCcw className="h-5 w-5" style={{ color: '#002c45' }} />
                  <div>
                    <div className="font-semibold text-gray-900">Վերադարձ</div>
                    <div className="text-sm text-gray-600">14 օր</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Carousel */}
        {!loading && similarProducts.length > 0 && (
          <div className="mt-16">
            <ProductCarousel
              products={similarProducts}
              title="Նմանատիպ ապրանքներ"
              onAddToCart={(product) => {
                addItem(product, 1)
                setAddedToCartSimilar(prev => new Set(prev).add(product.id))
              }}
              addedToCart={addedToCartSimilar}
            />
          </div>
        )}
      </div>

      {/* Hide Footer on Mobile and Tablet */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}
