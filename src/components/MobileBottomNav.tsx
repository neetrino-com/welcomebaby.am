'use client'

import Link from 'next/link'
import { Home, ShoppingCart, User, Grid3x3, LogIn, Heart } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import { useHydration } from '@/hooks/useHydration'
import { useState, useEffect } from 'react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const isHydrated = useHydration()
  const { getTotalItems } = useCart()
  const { data: session, status } = useSession()
  const [wishlistCount, setWishlistCount] = useState(0)
  
  // Принудительное обновление при изменении сессии
  const navKey = session ? `nav-authenticated-${session.user?.id}` : 'nav-unauthenticated'

  // Загрузка количества товаров в wishlist
  useEffect(() => {
    if (session?.user?.id) {
      fetchWishlistCount()
    } else {
      setWishlistCount(0)
    }
  }, [session])

  // Обновление счётчика при добавлении/удалении из wishlist (событие из WishlistButton)
  useEffect(() => {
    const onWishlistChanged = () => {
      if (session?.user?.id) fetchWishlistCount()
    }
    window.addEventListener('wishlist-changed', onWishlistChanged)
    return () => window.removeEventListener('wishlist-changed', onWishlistChanged)
  }, [session?.user?.id])

  const fetchWishlistCount = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  // Навигационные элементы в зависимости от состояния авторизации
  const navItems = session ? [
    { href: '/', label: 'Գլխավոր', icon: Home },
    { href: '/products', label: 'Կատալոգ', icon: Grid3x3 },
    { href: '/wishlist', label: 'Նախընտրած', icon: Heart, showBadge: true, badgeCount: wishlistCount },
    { href: '/cart', label: 'Զամբյուղ', icon: ShoppingCart, showBadge: true },
    { href: '/profile', label: 'Պրոֆիլ', icon: User },
  ] : [
    { href: '/', label: 'Գլխավոր', icon: Home },
    { href: '/products', label: 'Կատալոգ', icon: Grid3x3 },
    { href: '/cart', label: 'Զամբյուղ', icon: ShoppingCart, showBadge: true },
    { href: '/login', label: 'Մուտք', icon: LogIn },
  ]

  return (
    <>
      <nav key={navKey} className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-200 z-40 shadow-2xl">
        <div className="flex justify-around items-center py-3">
          {status === 'loading' ? (
            // Показываем загрузку для всех кнопок (5 для авторизованных, 4 для неавторизованных)
            Array.from({ length: session ? 5 : 4 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center justify-center py-3 px-4 rounded-2xl">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-12 h-3 bg-gray-200 rounded mt-1 animate-pulse"></div>
              </div>
            ))
          ) : (
            navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-2 sm:py-3 sm:px-4 rounded-2xl transition-all duration-300 relative flex-1 min-w-0 ${
                  active
                    ? 'text-[#f3d98c] bg-[#f3d98c]/10'
                    : 'text-gray-600 hover:text-[#f3d98c] hover:bg-[#f3d98c]/10'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
                  {item.showBadge && isHydrated && (
                    item.badgeCount !== undefined ? (
                      item.badgeCount > 0 && (
                        <span className="absolute -top-2 -right-2 text-white text-[10px] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-lg" style={{ backgroundColor: '#ffdd84' }}>
                          {item.badgeCount}
                        </span>
                      )
                    ) : (
                      getTotalItems() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-[10px] font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-lg" style={{ color: '#002c45' }}>
                          {getTotalItems()}
                        </span>
                      )
                    )
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold mt-1 transition-all duration-300 ${active ? 'text-[#f3d98c]' : ''} truncate w-full text-center`}>{item.label}</span>
                
                {/* Active indicator */}
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-b-full shadow-lg" style={{ backgroundColor: '#ffdd84' }}></div>
                )}
              </Link>
            )
          })
          )}
        </div>
      </nav>
    </>
  )
}
