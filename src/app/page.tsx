'use client'

import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, Clock, ShoppingCart, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import ProductSection from "@/components/ProductSection";
import HorizontalCategorySlider from "@/components/HorizontalCategorySlider";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import TwinklingStars from "@/components/TwinklingStars";
// getFallbackImage больше не используется - используем null для отсутствующих изображений
import { formatPrice } from "@/utils/priceUtils";
import { isValidImagePath } from "@/utils/imageUtils";

import Footer from '@/components/Footer'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [comboProducts, setComboProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [newToys, setNewToys] = useState<Product[]>([])
  const [bannerProduct, setBannerProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())
  const [addedToCartHits, setAddedToCartHits] = useState<Set<string>>(new Set())
  const { addItem } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/home', { cache: 'default' })
      if (!res.ok) throw new Error(`Home API error: ${res.status}`)
      const data = await res.json()
      setProducts(data.products || [])
      setComboProducts(data.comboProducts || [])
      setFeaturedProducts(data.featuredProducts || [])
      setNewProducts(data.newProducts || [])
      setSaleProducts(data.saleProducts || [])
      setNewToys(data.newToysProducts || [])
      setBannerProduct(data.bannerProduct ?? null)
    } catch (error) {
      console.error('Error fetching home data:', error)
      setProducts([])
      setComboProducts([])
      setFeaturedProducts([])
      setNewProducts([])
      setSaleProducts([])
      setNewToys([])
      setBannerProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    setAddedToCart(prev => new Set(prev).add(product.id))
    
    // Убираем подсветку через 2 секунды
    setTimeout(() => {
      setAddedToCart(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 2000)
  }

  const handleAddToCartHits = (product: Product) => {
    addItem(product, 1)
    setAddedToCartHits(prev => new Set(prev).add(product.id))
    
    // Убираем подсветку через 2 секунды
    setTimeout(() => {
      setAddedToCartHits(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIT':
        return { text: 'ՀԻԹ', color: 'bg-red-500' }
      case 'NEW':
        return { text: 'ՆՈՐ', color: 'bg-green-500' }
      case 'CLASSIC':
        return { text: 'ԴԱՍԻԿ', color: 'bg-primary-500' }
      case 'BANNER':
        return { text: 'ԲԱՆՆԵՐ', color: 'bg-purple-500' }
      default:
        return { text: 'ՀԱՅՏՆԻ', color: 'bg-orange-500' }
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ backgroundColor: '#002c45' }}>
      {/* Отступ для fixed хедера с фоном и звездочками */}
      <div className="lg:hidden h-20 relative" style={{ backgroundColor: '#002c45' }}>
        <TwinklingStars count={50} imageStarRatio={0.4} className="z-10" />
      </div>
      <div className="hidden lg:block h-28 relative" style={{ backgroundColor: '#002c45' }}>
        <TwinklingStars count={50} imageStarRatio={0.4} className="z-10" />
      </div>

      {/* Hero Section - Compact for Mobile */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: '#002c45' }}>
        <TwinklingStars count={100} imageStarRatio={0.4} className="z-20" />
        
        {/* Mobile Compact Version - App Style */}
        <div className="md:hidden relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            {/* Top content - title and description */}
            <div className="text-center">
              <h1 className="font-bold mb-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(32px, 8vw, 48px)', lineHeight: '1.1' }}>
                <span className="block text-white">Մանկական <span style={{ color: '#f3d98c' }}>Աշխարհ</span></span>
              </h1>
              <p className="text-primary-100 mb-4 px-2" style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(14px, 4vw, 18px)', lineHeight: '1.4', fontWeight: 400 }}>
                Որակյալ Արտադրանք Ձեր Երեխաների Համար
              </p>
            </div>
            
            {/* Bottom content - product showcase */}
            <div className="relative flex justify-center">
              {bannerProduct ? (
                <div className="relative bg-white/25 backdrop-blur-xl rounded-2xl p-3 text-center border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                  {/* Product Image Container */}
                  <div className="relative w-28 h-28 mx-auto mb-2 rounded-xl flex items-center justify-center overflow-hidden bg-gray-200">
                    {bannerProduct.image && bannerProduct.image !== 'no-image' && isValidImagePath(bannerProduct.image) ? (
                      <img 
                        src={bannerProduct.image} 
                        alt={bannerProduct.name}
                        className="relative w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center text-4xl"
                      style={{ display: (bannerProduct.image && bannerProduct.image !== 'no-image' && isValidImagePath(bannerProduct.image)) ? 'none' : 'flex' }}
                    >
                      🧸
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <h3 className="text-sm font-bold mb-1 text-white line-clamp-1">{bannerProduct.name}</h3>
                  <p className="text-xs text-orange-100/90 mb-2 line-clamp-1">{bannerProduct.description}</p>
                  
                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(bannerProduct);
                    }}
                    className="w-full text-white py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#ffdd84' }}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      Ավելացնել
                    </span>
                  </button>
                </div>
              ) : (
                <div className="relative bg-white/15 backdrop-blur-lg rounded-2xl p-3 text-center border border-white/20">
                  <div className="relative w-24 h-24 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🧸</span>
                  </div>
                  <h3 className="text-sm font-bold mb-1 text-white">Մանկական <span style={{ color: '#f3d98c' }}>Աշխարհ</span></h3>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tablet Version - Medium Size */}
        <div className="hidden md:block lg:hidden relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            {/* Left content - tablet optimized */}
            <div className="flex-1 pr-8">
              <h1 className="font-bold mb-4" style={{ fontFamily: 'var(--font-inter)', fontSize: '60px', lineHeight: '60px' }}>
                <span className="block text-white">Մանկական <span style={{ color: '#f3d98c' }}>Աշխարհ</span></span>
              </h1>
              <p className="text-primary-100 mb-6" style={{ fontFamily: 'var(--font-inter)', fontSize: '30px', lineHeight: '36px', fontWeight: 400 }}>
                Որակյալ Արտադրանք Ձեր Երեխաների Համար
              </p>
            </div>
            
            {/* Right content - product showcase for tablet */}
            <div className="relative flex-shrink-0">
              {bannerProduct ? (
                <div className="relative bg-white/25 backdrop-blur-xl rounded-3xl p-4 text-center border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                  {/* Product Image Container */}
                  <div className="relative w-36 h-36 mx-auto mb-3 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-200">
                    {bannerProduct.image && bannerProduct.image !== 'no-image' && isValidImagePath(bannerProduct.image) ? (
                      <img 
                        src={bannerProduct.image} 
                        alt={bannerProduct.name}
                        className="relative w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center text-5xl"
                      style={{ display: (bannerProduct.image && bannerProduct.image !== 'no-image' && isValidImagePath(bannerProduct.image)) ? 'none' : 'flex' }}
                    >
                      🧸
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <h3 className="text-base font-bold mb-2 text-white line-clamp-1">{bannerProduct.name}</h3>
                  <p className="text-sm text-orange-100/90 mb-3 line-clamp-1">{bannerProduct.description}</p>
                  
                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(bannerProduct);
                    }}
                    className="w-full text-white py-2 px-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#ffdd84' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Ավելացնել
                    </span>
                  </button>
                </div>
              ) : (
                <div className="relative bg-white/15 backdrop-blur-lg rounded-3xl p-4 text-center border border-white/20">
                  <div className="relative w-32 h-32 mx-auto mb-3 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">🧸</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 text-white">Մանկական <span style={{ color: '#f3d98c' }}>Աշխարհ</span></h3>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Full Version */}
        <div className="hidden lg:block relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className="space-y-6">
              {/* Main heading */}
              <h1 className="font-bold" style={{ fontFamily: 'var(--font-inter)', fontSize: '60px', lineHeight: '60px' }}>
                <span className="block text-white">Մանկական <span style={{ color: '#f3d98c' }}>Աշխարհ</span></span>
                <span className="block text-primary-100 mt-3" style={{ fontFamily: 'var(--font-inter)', fontSize: '30px', lineHeight: '36px', fontWeight: 400 }}>
                  Որակյալ Արտադրանք Ձեր Երեխաների Համար
                </span>
              </h1>
              
              {/* Description - Empty space */}
              <div className="h-8"></div>
              
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/products"
                  className="group bg-white text-primary-500 px-6 py-3 rounded-xl font-bold text-base hover:bg-primary-50 hover:scale-105 transition-all duration-300 text-center shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                  Դիտել արտադրանքը
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
                <Link 
                  href="/contact"
                  className="group border-2 border-white text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-white hover:text-primary-500 hover:scale-105 transition-all duration-300 text-center backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center">
                    <Phone className="mr-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Կապ մեզ հետ
                  </span>
                </Link>
              </div>
            </div>
            
            {/* Right content - Product showcase */}
            <div className="relative flex justify-end">
              
              {/* Main product card - Banner Design 450x680px */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl group"
                style={{ 
                  width: '450px', 
                  height: '680px',
                  backgroundColor: '#002c45'
                }}
              >
                {bannerProduct ? (
                  <>
                    {/* Product Image - узкая карточка для вертикальных изображений */}
                    <div className="relative w-full h-[400px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
                      {bannerProduct.image && bannerProduct.image !== 'no-image' && isValidImagePath(bannerProduct.image) ? (
                        <img 
                          src={bannerProduct.image} 
                          alt={bannerProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{ objectPosition: 'center calc(100% + 60px)' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      {/* Placeholder: плюшевый мишка, когда нет изображения баннера */}
                      <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50" style={{ display: (bannerProduct.image && bannerProduct.image !== 'no-image' && isValidImagePath(bannerProduct.image)) ? 'none' : 'flex' }} aria-hidden="true">
                        🧸
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6 h-[280px] flex flex-col justify-between" style={{ backgroundColor: '#002c45' }}>
                      {/* Product Info */}
                      <div className="flex-1">
                        {/* Product Name */}
                        <h3 className="text-2xl font-bold mb-3" style={{ color: '#f3d98c' }}>
                          {bannerProduct.name}
                        </h3>
                        
                        {/* Product Description */}
                        <p className="text-white/90 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {bannerProduct.description}
                        </p>
                        
                        {/* Price */}
                        <div className="flex items-center gap-3 mb-4">
                          {bannerProduct.salePrice ? (
                            <>
                              <span className="text-3xl font-bold" style={{ color: '#f3d98c' }}>
                                {formatPrice(bannerProduct.salePrice)} ֏
                              </span>
                              <span className="text-lg text-white/60 line-through">
                                {formatPrice(bannerProduct.price)} ֏
                              </span>
                            </>
                          ) : (
                            <span className="text-3xl font-bold" style={{ color: '#f3d98c' }}>
                              {formatPrice(bannerProduct.price)} ֏
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Order Button */}
                      <button
                        onClick={() => handleAddToCart(bannerProduct)}
                        className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        style={{ 
                          backgroundColor: '#f3d98c',
                          color: '#002c45'
                        }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Արագ պատվեր
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <div className="text-6xl mb-4">🧸</div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: '#f3d98c' }}>
                      Մանկական Աշխարհ
                    </h3>
                    <Link 
                      href="/products"
                      className="px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
                      style={{ 
                        backgroundColor: '#f3d98c',
                        color: '#002c45'
                      }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Դիտել արտադրանքը
                    </Link>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-8 lg:py-12" style={{ backgroundColor: '#ffffff' }}>
        <HorizontalCategorySlider 
          title="Կատեգորիաներ"
          subtitle="Ընտրեք ձեր սիրելի կատեգորիան"
          showAllCategories={true}
        />
      </section>

      {/* Sale Products Section */}
      <div className="relative" style={{ backgroundColor: '#ffffff' }}>
        <ProductSection
          title="Զեղչված Արտադրանք"
          subtitle="Շահավետ առաջարկություններ սիրելի արտադրանքի համար"
          products={saleProducts}
          onAddToCart={handleAddToCart}
          addedToCart={addedToCart}
          variant="compact"
        />
      </div>

      {/* Features Section - Hidden on mobile and tablet */}
      <section className="hidden lg:block py-20 relative" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-inter)', fontSize: '36px', lineHeight: '40px' }}>
              Ինչու՞ Են Ընտրում Մեզ
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Մենք ստեղծել ենք անվտանգության, որակի եվ ուրախության իդեալական համադրություն ձեր երեխաների համար
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Safety */}
            <div className="group bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Անվտանգություն</h3>
              <div className="text-center">
                <span className="inline-block bg-green-500/20 text-black px-3 py-1 rounded-full text-sm font-semibold border border-green-400/30">
                  Անվտանգ
                </span>
              </div>
            </div>

            {/* Delivery */}
            <div className="group bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Առաքում</h3>
              <div className="text-center">
                <span className="inline-block bg-primary-500/20 text-black px-3 py-1 rounded-full text-sm font-semibold border border-primary-400/30">
                  30 րոպե
                </span>
              </div>
            </div>

            {/* Development */}
            <div className="group bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Զարգացում</h3>
              <div className="text-center">
                <span className="inline-block bg-purple-500/20 text-black px-3 py-1 rounded-full text-sm font-semibold border border-purple-400/30">
                  Զարգացնող
                </span>
              </div>
            </div>

            {/* Support */}
            <div className="group bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Աջակցություն</h3>
              <div className="text-center">
                <span className="inline-block bg-pink-500/20 text-black px-3 py-1 rounded-full text-sm font-semibold border border-pink-400/30">
                  24/7
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* New Products Section */}
      <div className="relative" style={{ backgroundColor: '#ffffff' }}>
        <ProductSection
          title="Նոր Արտադրանք"
          subtitle=""
          products={newProducts}
          onAddToCart={handleAddToCart}
          addedToCart={addedToCart}
          variant="compact"
        />
      </div>

      {/* Statistics Section */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-inter)', fontSize: '36px', lineHeight: '40px' }}>
              Մեր Առավելությունները
            </h2>
            <p className="text-lg text-gray-600 whitespace-nowrap">
              Տարիների փորձը եվ հազարավոր գոհ հաճախորդները մեր հպարտությունն են
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Years of Experience */}
            <div className="text-center group">
              <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                  <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <AnimatedCounter 
                    end={10} 
                    suffix="+"
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900"
                    duration={2500}
                  />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                    Տարվա Փորձ
                  </div>
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="text-center group">
              <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                  <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <AnimatedCounter 
                    end={50} 
                    suffix="+"
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900"
                    duration={2000}
                  />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                    Գործընկեր
                  </div>
                </div>
              </div>
            </div>

            {/* Happy Customers */}
            <div className="text-center group">
              <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                  <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <AnimatedCounter 
                    end={80000} 
                    suffix="+"
                    className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900"
                    duration={3000}
                  />
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                    Գոհ Հաճախորդ
                  </div>
                </div>
              </div>
            </div>

            {/* Products Sold */}
            <div className="text-center group">
              <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                  <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <AnimatedCounter 
                    end={100000} 
                    suffix="+"
                    className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900"
                    duration={3500}
                  />
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-tight">
                    Վաճառված Ապրանք
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Toys Section */}
      <ProductSection
        title="Նոր Խաղալիքներ"
        subtitle="Նոր խաղալիքներ զվարճալի խաղերի համար"
        products={newToys}
        onAddToCart={handleAddToCart}
        addedToCart={addedToCart}
        variant="compact"
      />

      {/* CTA Section - Hidden on mobile and tablet */}
      <section className="hidden lg:block py-20 text-gray-900 relative" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold mb-6" style={{ fontFamily: 'var(--font-inter)', fontSize: '36px', lineHeight: '40px' }}>
            Պատրա՞ստ Եք Ուրախացնել Երեխաներին
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Պատվիրեք հիմա եվ ստացեք 15% զեղչ առաջին պատվերի համար
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="bg-primary-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-600 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Պատվիրել հիմա
            </Link>
            <Link 
              href="/contact"
              className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-500 hover:text-white hover:scale-105 transition-all duration-300"
            >
              Իմանալ ավելին
            </Link>
          </div>
        </div>
      </section>

      

      {/* Footer - Hidden on mobile and tablet */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      
      {/* Add bottom padding for mobile and tablet nav */}
      <div className="lg:hidden h-16"></div>
    </div>
  );
}