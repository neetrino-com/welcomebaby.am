'use client'

import { memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { WishlistButton } from './WishlistButton'
import { isValidImagePath } from '@/utils/imageUtils'
import { formatPrice } from '@/utils/priceUtils'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  variant?: 'default' | 'compact'
  addedToCart?: Set<string>
  isSelected?: boolean
}

const ProductCard = memo(({ product, onAddToCart, variant = 'default', addedToCart, isSelected = false }: ProductCardProps) => {
  const router = useRouter()
  const isCompact = variant === 'compact'
  const isAdded = addedToCart?.has(product.id) || false

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${product.id}`)
  }

  return (
    <Link 
      href={`/products/${product.id}`}
      className={`relative block bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden group hover:shadow-xl hover:bg-gray-50 transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      {/* Контейнер изображения */}
      <div className={`relative bg-gray-100 ${isCompact ? 'h-48' : 'h-64'}`}>
        {/* Изображение товара */}
        {isValidImagePath(product.image) ? (
          <>
            <Image 
            src={product.image!} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-contain group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            onError={(e) => {
              // Тихо обрабатываем ошибку загрузки изображения
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
            {/* Fallback placeholder (скрыто по умолчанию) */}
            <div className="w-full h-full flex items-center justify-center bg-gray-200" style={{ display: 'none' }}>
              <span className="text-4xl opacity-50">🥟</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-4xl opacity-50">🥟</span>
          </div>
        )}

        {/* Метки */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {/* Скидка */}
          {product.salePrice && (
            <span className="hidden md:block bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
              ԶԵՂՉ
            </span>
          )}
          
          {/* Статус товара */}
          {product.status === 'HIT' && (
            <span className="bg-[#f3d98c] text-gray-900 px-2 py-1 rounded text-xs font-bold">
              ՀԻԹ
            </span>
          )}
          
          {product.status === 'NEW' && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
              ՆՈՐ
            </span>
          )}
        </div>

        {/* Ярлык скидки справа сверху для мобильной версии */}
        {product.salePrice && (
          <div className="absolute top-2 right-2 z-10 pointer-events-none md:hidden">
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{Math.round((1 - product.salePrice / product.price) * 100)}%
            </span>
          </div>
        )}

        {/* Quick actions (появляются при hover) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 z-10">
          <div onClick={(e) => e.stopPropagation()}>
            <WishlistButton 
              productId={product.id}
              size="md"
              variant="default"
            />
          </div>
          <button
            type="button"
            onClick={handleQuickView}
            className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Быстрый просмотр"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Статус наличия */}
        {!product.stock || product.stock <= 0 ? (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 px-4 py-2 rounded text-sm font-medium text-white border border-gray-600">
              Չկա պահեստում
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Контент карточки */}
      <div className="p-4">
        {/* Название товара */}
        <h3 className={`font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors ${
          isCompact ? 'text-sm mb-2' : 'text-base mb-2'
        }`}>
          {product.name}
        </h3>
        
        {/* Краткое описание (только для полного варианта) */}
        {!isCompact && product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-1">
            {product.description}
          </p>
        )}
        
        {/* Цена */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="text-lg font-bold text-green-600">{formatPrice(product.salePrice)} ֏</span>
                <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)} ֏</span>
                <span className="hidden md:block bg-green-500 text-white text-xs px-1 py-0.5 rounded font-bold">
                  -{Math.round((1 - product.salePrice / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)} ֏</span>
            )}
          </div>
        </div>
        
        {/* CTA кнопка */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddToCart(product)
          }}
          disabled={!product.stock || product.stock <= 0}
          className={`w-full h-10 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 relative z-10 ${
            isAdded
              ? 'bg-green-500 text-white hover:bg-green-600'
              : product.stock && product.stock > 0
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAdded ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Զամբյուղում
            </>
          ) : product.stock && product.stock > 0 ? (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Զամբյուղում
            </>
          ) : (
            'Չկա պահեստում'
          )}
        </button>
      </div>
    </Link>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
