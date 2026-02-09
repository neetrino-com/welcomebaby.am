'use client'

import Link from 'next/link'
import { SearchResult } from '@/hooks/useInstantSearch'
import { Search, Loader2, ChevronRight } from 'lucide-react'
import { memo, useMemo } from 'react'
import { formatPrice } from '@/utils/priceUtils'

interface SearchDropdownProps {
  results: SearchResult[]
  loading: boolean
  error: string | null
  isOpen: boolean
  selectedIndex: number
  onResultClick: (result: SearchResult) => void
  onClose: () => void
  query?: string
  className?: string
}

export const SearchDropdown = memo(function SearchDropdown({
  results,
  loading,
  error,
  isOpen,
  selectedIndex,
  onResultClick,
  onClose,
  query = '',
  className = ''
}: SearchDropdownProps) {
  // Мемоизируем состояние для оптимизации
  const hasResults = useMemo(() => results.length > 0, [results.length])
  const showEmptyState = useMemo(() => !loading && !error && !hasResults, [loading, error, hasResults])
  const showResults = useMemo(() => !loading && !error && hasResults, [loading, error, hasResults])
  const hasQuery = Boolean(query.trim())
  const viewAllHref = hasQuery ? `/products?search=${encodeURIComponent(query.trim())}` : ''

  if (!isOpen) return null

  return (
    <div 
      id="search-results"
      className={`absolute top-full left-0 z-[1000] w-[480px] max-w-[520px] max-h-[420px] flex flex-col bg-white border border-black/10 rounded-2xl shadow-xl sm:w-[min(90vw,520px)] ${className}`}
      role="listbox"
      aria-label="Որոնման արդյունքներ"
    >
      {/* Scrollable content */}
      <div className={`flex-1 overflow-auto p-2 min-h-0 ${!hasQuery ? 'rounded-b-2xl' : ''}`}>
        <div className="py-2">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-[#f3d98c]" />
              <span className="ml-2 text-gray-600 text-sm">Փնտրում...</span>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 text-center text-red-600 text-xs">
              {error}
            </div>
          )}

          {showEmptyState && (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              <Search className="h-6 w-6 mx-auto mb-1 text-gray-300" />
              <p>Արտադրանք չի գտնվել</p>
              <p className="text-xs mt-1">Փորձեք փոխել որոնման հարցումը</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-1">
              {results.map((result, index) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  isSelected={index === selectedIndex}
                  onClick={() => onResultClick(result)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer: "Տեսնել բոլորը" — только при введённом запросе (все связанные товары) */}
      {hasQuery && (
        <div className="flex-shrink-0 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
          <Link
            href={viewAllHref}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full py-3 px-4 text-sm font-semibold text-[#002c45] hover:bg-[#f3d98c]/20 transition-colors rounded-b-2xl"
          >
            Տեսնել բոլորը
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
})

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
}

const SearchResultItem = memo(function SearchResultItem({
  result,
  isSelected,
  onClick
}: SearchResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={`grid grid-cols-[56px_1fr] gap-3 items-center px-3 py-2 rounded-xl hover:bg-black/5 text-left transition-colors w-full ${
        isSelected ? 'bg-[#f3d98c]/10 border-r-2 border-[#f3d98c]' : ''
      }`}
      role="option"
      aria-selected={isSelected}
    >
      {/* Product Image */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {result.image ? (
          <img
            src={result.image}
            alt={result.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
              if (nextElement) {
                nextElement.style.display = 'flex'
              }
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center text-gray-400"
          style={{ display: result.image ? 'none' : 'flex' }}
        >
          <Search className="h-5 w-5" />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold line-clamp-2 text-gray-900">
          {result.name}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
          {result.description}
        </p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {result.salePrice ? (
              <>
                <span className="text-xs text-green-600 font-medium">
                  {formatPrice(result.salePrice)} ֏
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(result.price)} ֏
                </span>
              </>
            ) : (
              <span className="text-xs text-red-500 font-medium">
                {formatPrice(result.price)} ֏
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {result.category}
          </span>
        </div>
      </div>
    </button>
  )
})
