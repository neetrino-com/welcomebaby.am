'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface WishlistButtonProps {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal'
}

export function WishlistButton({ 
  productId, 
  className = '', 
  size = 'md',
  variant = 'default'
}: WishlistButtonProps) {
  const { data: session } = useSession()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Размеры иконки
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  // Размеры кнопки
  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  // Проверяем статус товара в wishlist при загрузке
  useEffect(() => {
    if (session?.user?.id) {
      checkWishlistStatus()
    } else {
      setIsChecking(false)
    }
  }, [session, productId])

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setIsInWishlist(data.inWishlist)
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user?.id) {
      // Можно добавить редирект на страницу входа
      return
    }

    setIsLoading(true)

    try {
      if (isInWishlist) {
        // Удаляем из wishlist
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setIsInWishlist(false)
          window.dispatchEvent(new CustomEvent('wishlist-changed'))
        } else {
          console.error('Failed to remove from wishlist')
        }
      } else {
        // Добавляем в wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        })
        
        if (response.ok) {
          setIsInWishlist(true)
          window.dispatchEvent(new CustomEvent('wishlist-changed'))
        } else {
          console.error('Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Не показываем кнопку, если пользователь не авторизован
  if (!session?.user?.id) {
    return null
  }

  // Показываем загрузку при проверке статуса
  if (isChecking) {
    return (
      <button 
        className={`${buttonSizes[size]} bg-white rounded-full shadow-sm flex items-center justify-center ${className}`}
        disabled
      >
        <div className={`${iconSizes[size]} animate-pulse bg-gray-300 rounded`} />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`${buttonSizes[size]} ${
        variant === 'minimal' 
          ? 'bg-transparent hover:bg-gray-100' 
          : 'bg-white shadow-sm hover:bg-gray-50'
      } rounded-full flex items-center justify-center transition-all duration-200 ${
        isInWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Heart 
        className={`${iconSizes[size]} ${
          isInWishlist ? 'fill-current' : ''
        } transition-all duration-200`} 
      />
    </button>
  )
}
