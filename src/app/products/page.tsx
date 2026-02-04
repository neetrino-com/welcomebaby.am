'use client'

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useInstantSearch } from '@/hooks/useInstantSearch'
import { Product, Category } from '@/types'
import ProductCard from '@/components/ProductCard'
import HorizontalCategorySlider from '@/components/HorizontalCategorySlider'

import Footer from '@/components/Footer'

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Բոլորը')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('name-asc')
  const { addItem } = useCart()
  const selectedProductRef = useRef<HTMLDivElement>(null)

  // Для поддержки URL ?search= и сообщения «ничего не найдено»
  const { query, setQuery, clearSearch } = useInstantSearch({
    debounceMs: 200,
    minQueryLength: 2,
    maxResults: 8
  })

  // Константы пагинации
  const ITEMS_PER_PAGE = 24

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error(`Products API error: ${response.status}`)
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error(`Categories API error: ${response.status}`)
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  // Функция для получения актуальной цены товара (salePrice если есть, иначе price)
  const getActualPrice = useCallback((product: Product): number => {
    return product.salePrice ?? product.price
  }, [])

  // Оптимизированная функция сортировки
  const sortProducts = useCallback((products: Product[], sortBy: string): Product[] => {
    const sorted = [...products]
    
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru'))
      case 'price-asc':
        return sorted.sort((a, b) => getActualPrice(a) - getActualPrice(b))
      case 'price-desc':
        return sorted.sort((a, b) => getActualPrice(b) - getActualPrice(a))
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      default:
        return sorted
    }
  }, [getActualPrice])

  // Оптимизированная функция фильтрации
  const filterProducts = useCallback(() => {
    let filtered = products
    
    // Фильтр по категории - показываем все товары если выбрана "Բոլորը"
    if (selectedCategory !== 'Բոլորը' && selectedCategoryId) {
      filtered = filtered.filter(product => product.categoryId === selectedCategoryId)
    }
    
    // Применяем сортировку
    filtered = sortProducts(filtered, sortBy)
    
    setFilteredProducts(filtered)
    setCurrentPage(1) // Сбрасываем на первую страницу
  }, [products, selectedCategory, selectedCategoryId, sortBy, sortProducts])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ])
    }
    loadData()
  }, [])

  // Обработка URL параметров
  useEffect(() => {
    const searchParam = searchParams.get('search')
    const selectedParam = searchParams.get('selected')
    const categoryParam = searchParams.get('category')
    
    if (searchParam) {
      setQuery(searchParam)
      setSelectedCategory('Բոլորը')
      setSelectedCategoryId(null)
    }
    
    if (selectedParam) {
      setSelectedProductId(selectedParam)
    }
    
    // Обработка параметра category из URL (ожидается имя или id категории; в API передаём только id)
    if (categoryParam && categories.length > 0) {
      const decoded = decodeURIComponent(categoryParam)
      const foundCategory =
        categories.find((cat) => cat.id === decoded) ||
        categories.find((cat) => cat.name === decoded)
      if (foundCategory) {
        setSelectedCategory(foundCategory.name)
        setSelectedCategoryId(foundCategory.id)
      }
    }
  }, [searchParams, setQuery, categories])

  // Прокрутка к выбранному товару
  useEffect(() => {
    if (selectedProductId && selectedProductRef.current) {
      setTimeout(() => {
        selectedProductRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }
  }, [selectedProductId, filteredProducts])

  useEffect(() => {
    filterProducts()
  }, [filterProducts])

  // Дополнительная проверка: если категория установлена из URL, но товары еще не отфильтрованы
  useEffect(() => {
    if (selectedCategoryId && products.length > 0 && filteredProducts.length === products.length && selectedCategory !== 'Բոլորը') {
      filterProducts()
    }
  }, [selectedCategoryId, products.length, filteredProducts.length, selectedCategory, filterProducts])

  const handleAddToCart = useCallback((product: Product) => {
    addItem(product, 1)
    setAddedToCart(prev => new Set(prev).add(product.id))
    
    setTimeout(() => {
      setAddedToCart(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 2000)
  }, [addItem])

  // Пагинация
  const paginationData = useMemo(() => {
    const totalItems = filteredProducts.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    return {
      totalItems,
      totalPages,
      paginatedProducts,
      startIndex,
      endIndex
    }
  }, [filteredProducts, currentPage, ITEMS_PER_PAGE])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded mx-auto mb-4 w-64 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto w-96 animate-pulse"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="flex flex-wrap gap-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-12 w-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    <div className="h-12 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <Footer />
        </div>
        <div className="lg:hidden h-16"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ backgroundColor: '#ffffff' }}>
      
      {/* Отступ для fixed хедера */}
      <div className="lg:hidden h-20"></div>
      <div className="hidden lg:block h-28"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-lg">Արտադրանքի Կատալոգ</h1>
        </div>

        {/* Categories Block - без заголовка и подзаголовка */}
        <div className="mb-6">
          <HorizontalCategorySlider 
            showTitle={false}
            showSubtitle={false}
            showAllCategories={true}
          />
        </div>

        {/* Sort and Results Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Տեսակավորում:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
              >
                <option value="name-asc" className="text-gray-900">Անվանումով (Ա-Զ)</option>
                <option value="name-desc" className="text-gray-900">Անվանումով (Զ-Ա)</option>
                <option value="price-asc" className="text-gray-900">Գնով (աճման կարգով)</option>
                <option value="price-desc" className="text-gray-900">Գնով (նվազման կարգով)</option>
                <option value="newest" className="text-gray-900">Նորերը նախ</option>
                <option value="oldest" className="text-gray-900">Հիները նախ</option>
              </select>
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Ցուցադրված {paginationData.totalItems} արտադրանք
            </div>
          </div>
        </div>

        {/* Products Display */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8 md:gap-6">
          {paginationData.paginatedProducts.map((product) => (
            <div
              key={product.id}
              ref={selectedProductId === product.id ? selectedProductRef : null}
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                variant="compact"
                addedToCart={addedToCart}
                isSelected={selectedProductId === product.id}
              />
            </div>
          ))}
        </div>

        {/* Enhanced Pagination */}
        {paginationData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8 sm:mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 sm:px-6 sm:py-3 text-xs sm:text-base bg-white text-gray-700 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              Նախորդ
            </button>
            
            <div className="flex gap-1 sm:gap-2">
              {(() => {
                const totalPages = paginationData.totalPages;
                const current = currentPage;
                const pages = [];
                
                // Определяем диапазон страниц для отображения
                let startPage = Math.max(1, current - 2);
                let endPage = Math.min(totalPages, current + 2);
                
                // Если мы близко к началу, показываем больше страниц справа
                if (current <= 3) {
                  endPage = Math.min(totalPages, 5);
                }
                
                // Если мы близко к концу, показываем больше страниц слева
                if (current >= totalPages - 2) {
                  startPage = Math.max(1, totalPages - 4);
                }
                
                // Добавляем первую страницу и многоточие если нужно
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-2 py-1.5 sm:px-4 sm:py-3 text-xs sm:text-base rounded-lg sm:rounded-xl font-semibold transition-all duration-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                    >
                      1
                    </button>
                  );
                  
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-1 sm:px-2 py-1.5 sm:py-3 text-xs sm:text-base text-gray-400">
                        ...
                      </span>
                    );
                  }
                }
                
                // Добавляем страницы в диапазоне
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-2 py-1.5 sm:px-4 sm:py-3 text-xs sm:text-base rounded-lg sm:rounded-xl font-semibold transition-all duration-200 ${
                        currentPage === i
                          ? 'bg-white text-gray-900 shadow-lg border-2 border-gray-300 scale-105'
                          : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Добавляем многоточие и последнюю страницу если нужно
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-1 sm:px-2 py-1.5 sm:py-3 text-xs sm:text-base text-gray-400">
                        ...
                      </span>
                    );
                  }
                  
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="px-2 py-1.5 sm:px-4 sm:py-3 text-xs sm:text-base rounded-lg sm:rounded-xl font-semibold transition-all duration-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationData.totalPages}
              className="px-3 py-1.5 sm:px-6 sm:py-3 text-xs sm:text-base bg-white text-gray-700 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              Հաջորդ
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            {query ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  "{query}" հարցման համար ոչինչ չի գտնվել
                </h3>
                <p className="text-gray-600 mb-6">
                  Փնտրումը կատարվել է ամբողջ մենյուում: Փորձեք փոխել որոնման հարցումը կամ ընտրել կատեգորիա
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setQuery('')
                      clearSearch()
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Մաքրել որոնումը
                  </button>
                  <button
                    onClick={() => setSelectedCategory('Բոլորը')}
                    className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Ցուցադրել բոլոր արտադրանքը
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-lg">"{selectedCategory}" կատեգորիայում արտադրանք չի գտնվել</p>
                <p className="text-gray-400">Փորձեք ընտրել այլ կատեգորիա</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Footer - Hidden on mobile and tablet */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      
      {/* Add bottom padding for mobile and tablet nav */}
      <div className="lg:hidden h-16"></div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded mx-auto mb-4 w-64 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    <div className="h-12 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <Footer />
        </div>
        <div className="lg:hidden h-16"></div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}