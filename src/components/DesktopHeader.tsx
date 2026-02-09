'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, LogOut, Search, Heart } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import { useHydration } from '@/hooks/useHydration'
import { useInstantSearch } from '@/hooks/useInstantSearch'
import { SearchDropdown } from '@/components/SearchDropdown'
import { useSettings } from '@/hooks/useSettings'

export default function DesktopHeader() {
  const isHydrated = useHydration()
  const { getTotalItems } = useCart()
  const { data: session, status } = useSession()
  const { settings } = useSettings()
  const pathname = usePathname()
  const router = useRouter()
  const [wishlistCount, setWishlistCount] = useState(0)
  
  // Instant search hook (search-as-you-type)
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    clearSearch
  } = useInstantSearch({
    debounceMs: 200,
    minQueryLength: 1, // Поиск работает с первого символа
    maxResults: 5
  })

  const searchRef = useRef<HTMLDivElement>(null)

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

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  // Обработка клика по результату поиска
  const handleResultClick = (result: any) => {
    window.location.href = `/products/${result.id}`
    setIsOpen(false)
    clearSearch()
  }

  // Функция для определения активной ссылки
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  // Навигационные ссылки
  const navLinks = [
    { href: '/', label: 'Գլխավոր' },
    { href: '/products', label: 'Կատալոգ' },
    { href: '/about', label: 'Մեր մասին' },
    { href: '/contact', label: 'Կապ' },
  ]

  return (
    <header className="shadow-sm fixed top-0 left-0 right-0 z-[60]" style={{ position: 'fixed', backgroundColor: '#002c45' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-0.5">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image 
              src={settings.logo || "/logo.png"} 
              alt={settings.siteName || "WelcomeBaby Logo"} 
              width={333}
              height={125}
              className="h-[112px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 group capitalize whitespace-nowrap
                  ${isActive(link.href)
                    ? 'text-white bg-white/20 shadow-md'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="flex items-center">
                  <span>{link.label}</span>
                </span>
                
                {/* Активный индикатор */}
                {isActive(link.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                )}
                
                {/* Hover эффект */}
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Compact with Instant Search */}
          <div className="max-w-xs relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#ffdd84' }} />
              <input
                type="search"
                placeholder="Փնտրել..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    e.preventDefault()
                    router.push(`/products?search=${encodeURIComponent(query.trim())}`)
                    setIsOpen(false)
                    return
                  }
                  handleKeyDown(e)
                }}
                onFocus={() => {
                  // Открываем dropdown если есть результаты поиска (search-as-you-type)
                  if (query.length >= 1 && results.length > 0) {
                    setIsOpen(true)
                  }
                }}
                // Search as you type - поиск при вводе
                onInput={(e) => {
                  // Автоматически открываем dropdown при вводе
                  if (query.length >= 1) {
                    setIsOpen(true)
                  }
                }}
                className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-lg focus:ring-1 focus:ring-white/50 focus:border-white/50 text-sm text-white placeholder-white/70 bg-white/10 transition-all duration-300 hover:bg-white/20 focus:bg-white/20"
                aria-controls="search-results"
                aria-expanded={isOpen}
                aria-autocomplete="list"
              />
              
              {/* Clear button */}
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <svg className="h-3 w-3" style={{ color: '#ffdd84' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            <SearchDropdown
              results={results}
              loading={loading}
              error={error}
              isOpen={isOpen}
              selectedIndex={selectedIndex}
              onResultClick={handleResultClick}
              onClose={() => setIsOpen(false)}
              query={query}
              className="w-[480px] max-w-[520px] sm:w-[min(90vw,520px)]"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link 
              href="/cart" 
              className={`
                relative p-3 rounded-xl transition-all duration-300 group
                ${isActive('/cart')
                  ? 'text-white bg-white/20 shadow-md'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <ShoppingCart className="h-6 w-6" />
              {isHydrated && getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-sm" style={{ color: '#002c45' }}>
                  {getTotalItems()}
                </span>
              )}
              
              {/* Активный индикатор для корзины */}
              {isActive('/cart') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
              )}
            </Link>

            {/* Wishlist - только для авторизованных пользователей */}
            {session && (
              <Link 
                href="/wishlist" 
                className={`
                  relative p-3 rounded-xl transition-all duration-300 group
                  ${isActive('/wishlist')
                    ? 'text-white bg-white/20 shadow-md'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                  }
                `}
                title="Նախընտրած"
              >
                <Heart className="h-6 w-6" />
                {isHydrated && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
                
                {/* Активный индикатор для wishlist */}
                {isActive('/wishlist') && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
                )}
              </Link>
            )}

            {/* Auth Buttons */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-2">
                {/* User Profile */}
                <Link 
                  href="/profile" 
                  className={`
                    relative flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 group mt-1
                    ${isActive('/profile')
                      ? 'text-white bg-white/20 shadow-md'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block font-medium">{session.user?.name}</span>
                  
                  {/* Активный индикатор для профиля */}
                  {isActive('/profile') && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
                
                {/* Admin Link */}
                {session.user?.role === 'ADMIN' && (
                  <Link 
                    href="/admin" 
                    className={`
                      relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group
                      ${isActive('/admin')
                        ? 'text-white bg-white/20 shadow-md'
                        : 'bg-white/10 text-white hover:bg-white/20'
                      }
                    `}
                  >
                    Ադմին
                    
                    {/* Активный индикатор для админки */}
                    {isActive('/admin') && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
                    )}
                  </Link>
                )}
                
                {/* Logout */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 text-white/90 hover:text-white transition-colors"
                  title="Ելք"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className={`
                    relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group
                    ${isActive('/login')
                      ? 'text-white bg-white/20 shadow-md'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  Մուտք
                  
                  {/* Активный индикатор для входа */}
                  {isActive('/login') && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/register" 
                  className={`
                    relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 group
                    ${isActive('/register')
                      ? 'text-white bg-white/20 shadow-md'
                      : 'bg-white/20 text-white hover:bg-white/30'
                    }
                  `}
                >
                  Գրանցում
                  
                  {/* Активный индикатор для регистрации */}
                  {isActive('/register') && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
