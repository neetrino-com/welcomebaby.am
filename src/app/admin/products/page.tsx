'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  Filter,
  Check,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import Pagination from '@/components/Pagination'
import BulkActionsBar from '@/components/admin/BulkActionsBar'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { Product, ProductStatus, Category } from '@/types'

export default function AdminProducts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [visibility, setVisibility] = useState('') // '' | 'active' | 'draft'
  const [sortBy, setSortBy] = useState<'' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'stock_asc' | 'stock_desc'>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [singleDeleting, setSingleDeleting] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState<'active' | 'draft' | null>(null)
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  })
  const prevFiltersRef = useRef({ selectedCategory: '', selectedStatus: '', visibility: '', sortBy: '' })
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchCategories()
  }, [session, status, router])

  // Загрузка с сервера только при смене страницы/фильтров (без search — поиск локальный)
  useEffect(() => {
    if (status === 'loading' || !session || session.user?.role !== 'ADMIN') return
    const filtersChanged =
      prevFiltersRef.current.selectedCategory !== selectedCategory ||
      prevFiltersRef.current.selectedStatus !== selectedStatus ||
      prevFiltersRef.current.visibility !== visibility ||
      prevFiltersRef.current.sortBy !== sortBy
    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1)
      return
    }
    prevFiltersRef.current = { selectedCategory, selectedStatus, visibility, sortBy }
    const controller = new AbortController()
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = controller
    const pageToFetch = filtersChanged ? 1 : currentPage
    fetchProducts(controller.signal, pageToFetch)
    return () => {
      controller.abort()
    }
  }, [session, status, router, currentPage, selectedCategory, selectedStatus, visibility, sortBy])

  // Мгновенная фильтрация по загруженной странице (как в /admin/orders)
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return products
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase()
      const desc = (p.description || '').toLowerCase()
      const id = (p.id || '').toLowerCase()
      const catName = ((p as Product & { category?: { name: string } }).category?.name || '').toLowerCase()
      return name.includes(term) || desc.includes(term) || id.includes(term) || catName.includes(term)
    })
  }, [products, searchTerm])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async (signal?: AbortSignal, pageOverride?: number) => {
    const page = pageOverride ?? currentPage
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)
      if (visibility) params.append('visibility', visibility)
      if (sortBy) params.append('sortBy', sortBy)
      const response = await fetch(`/api/admin/products?${params.toString()}`, {
        signal,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
      })
      if (signal?.aborted) return
      if (response.ok) {
        const data = await response.json()
        if (signal?.aborted) return
        setProducts(data.products || [])
        setPagination({
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0,
          itemsPerPage: data.pagination?.itemsPerPage || 20
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Error fetching products:', error)
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }

  const handleSingleDeleteConfirm = async () => {
    if (!productToDelete) return
    setSingleDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${productToDelete}`, { method: 'DELETE' })
      if (response.ok) {
        setProductToDelete(null)
        fetchProducts()
      } else {
        const data = await response.json().catch(() => ({}))
        alert(data.error || 'Ջնջելիս սխալ է տեղի ունեցել')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ջնջելիս սխալ է տեղի ունեցել')
    } finally {
      setSingleDeleting(false)
    }
  }

  const handleStatusToggle = async (productId: string, currentPublished: boolean) => {
    setStatusUpdatingId(productId)
    try {
      const newStatus = currentPublished ? 'draft' : 'active'
      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) fetchProducts()
      else alert('Կարգավիճակը թարմացնելիս սխալ')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Կարգավիճակը թարմացնելիս սխալ')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleBulkStatus = async (status: 'active' | 'draft') => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkStatusLoading(true)
    try {
      const response = await fetch('/api/admin/products/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status })
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setBulkStatusConfirm(null)
        setSelectedIds(new Set())
        fetchProducts()
      } else {
        alert(data.error || 'Սխալ')
      }
    } catch (error) {
      console.error('Bulk status error:', error)
      alert('Սխալ է տեղի ունեցել')
    } finally {
      setBulkStatusLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkDeleting(true)
    try {
      const response = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        const failed = data.failed || []
        if (failed.length > 0) {
          alert(`Ջնջվել է ${data.deleted}. Չհաջողված՝ ${failed.length}.`)
        }
        setSelectedIds(new Set())
        setBulkDeleteConfirmOpen(false)
        fetchProducts()
      } else {
        alert(data.error || 'Սխալ')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Սխալ է տեղի ունեցել')
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)))
    }
  }

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedIds(new Set())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const statusStats = {
    total: pagination.totalItems,
    regular: filteredProducts.filter((p) => p.status === 'REGULAR').length,
    hit: filteredProducts.filter((p) => p.status === 'HIT').length,
    new: filteredProducts.filter((p) => p.status === 'NEW').length,
    classic: filteredProducts.filter((p) => p.status === 'CLASSIC').length,
    banner: filteredProducts.filter((p) => p.status === 'BANNER').length
  }

  const getStatusBadge = (productStatus: ProductStatus) => {
    switch (productStatus) {
      case 'HIT':
        return { text: 'ՀԻՏ', className: 'bg-red-100 text-red-800 border-red-200' }
      case 'NEW':
        return { text: 'ՆՈՐ', className: 'bg-green-100 text-green-800 border-green-200' }
      case 'CLASSIC':
        return { text: 'ԿԼԱՍԻԿ', className: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'BANNER':
        return { text: 'ԲԱՆՆԵՐ', className: 'bg-purple-100 text-purple-800 border-purple-200' }
      default:
        return null
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="ml-3 text-neutral-600">Բեռնվում է...</p>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') return null

  const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length
  const someSelected = selectedIds.size > 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Ապրանքներ</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
        >
          <Plus className="h-5 w-5" />
          Ավելացնել ապրանք
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              <Search className="inline h-4 w-4 mr-1" />
              Փնտրել
            </label>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Անուն, նկարագրություն, ID, կատեգորիա..."
              aria-label="Փնտրել ապրանքներ"
            />
            {searchTerm.trim() && (
              <p className="mt-1 text-xs text-neutral-500">
                Փնտրում ըստ ընթացիկ էջի ({filteredProducts.length} արդյունք)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              <Filter className="inline h-4 w-4 mr-1" />
              Կատեգորիա
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-neutral-900 bg-white"
            >
              <option value="">Բոլոր կատեգորիաները</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              <Filter className="inline h-4 w-4 mr-1" />
              Լեյբլ
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-neutral-900 bg-white"
            >
              <option value="">Բոլորը</option>
              <option value="REGULAR">Սովորական</option>
              <option value="HIT">ՀԻՏ</option>
              <option value="NEW">ՆՈՐ</option>
              <option value="CLASSIC">ԿԼԱՍԻԿ</option>
              <option value="BANNER">ԲԱՆՆԵՐ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              <Filter className="inline h-4 w-4 mr-1" />
              Կարգավիճակ
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-neutral-900 bg-white"
            >
              <option value="">Բոլորը</option>
              <option value="active">Ակտիվ</option>
              <option value="draft">Սևագիր</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Ապրանքներ ({searchTerm.trim() ? filteredProducts.length : pagination.totalItems}
            {searchTerm.trim() ? ` ընթացիկ էջում` : ''})
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Ընդամենը: {statusStats.total}</span>
            {statusStats.hit > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">Հիթ: {statusStats.hit}</span>}
            {statusStats.new > 0 && <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Նոր: {statusStats.new}</span>}
            {statusStats.classic > 0 && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">Կլասիկ: {statusStats.classic}</span>}
            {statusStats.banner > 0 && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">Բաններ: {statusStats.banner}</span>}
          </div>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-b border-neutral-200">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
              itemsLabel="արտադրանքից"
            />
          </div>
        )}

        {someSelected && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
            deleteLabel="Խմբային ջնջում"
            isLoading={bulkDeleting}
            onBulkSetActive={() => setBulkStatusConfirm('active')}
            onBulkSetDraft={() => setBulkStatusConfirm('draft')}
            bulkStatusLoading={bulkStatusLoading}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    aria-label="Ընտրել բոլորը"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Նկար</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-600 uppercase min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => setSortBy((s) => (s === '' || !s.startsWith('name_') ? 'name_asc' : s === 'name_asc' ? 'name_desc' : ''))}
                    className="inline-flex items-center gap-1 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    title={sortBy === 'name_asc' ? 'Ա-Ֆ' : sortBy === 'name_desc' ? 'Ֆ-Ա' : 'Սորտավորել ըստ անուն'}
                  >
                    Անուն
                    <span className="inline-flex flex-col leading-none text-[10px]">
                      {sortBy === 'name_asc' && <ArrowUp className="h-3 w-3 text-primary-500" />}
                      {sortBy === 'name_desc' && <ArrowDown className="h-3 w-3 text-primary-500" />}
                      {sortBy !== 'name_asc' && sortBy !== 'name_desc' && <ArrowUpDown className="h-3 w-3 text-neutral-400" />}
                    </span>
                  </button>
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Կատեգորիա</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">
                  <button
                    type="button"
                    onClick={() => setSortBy((s) => (s === '' || !s.startsWith('price_') ? 'price_asc' : s === 'price_asc' ? 'price_desc' : ''))}
                    className="inline-flex items-center gap-1 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    title={sortBy === 'price_asc' ? 'Նվազման կարգով' : sortBy === 'price_desc' ? 'Չեղարկել սորտավորում' : 'Աճման կարգով'}
                  >
                    Գին
                    <span className="inline-flex flex-col leading-none text-[10px]">
                      {sortBy === 'price_asc' && <ArrowUp className="h-3 w-3 text-primary-500" />}
                      {sortBy === 'price_desc' && <ArrowDown className="h-3 w-3 text-primary-500" />}
                      {sortBy !== 'price_asc' && sortBy !== 'price_desc' && <ArrowUpDown className="h-3 w-3 text-neutral-400" />}
                    </span>
                  </button>
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">
                  <button
                    type="button"
                    onClick={() => setSortBy((s) => (s === '' || !s.startsWith('stock_') ? 'stock_asc' : s === 'stock_asc' ? 'stock_desc' : ''))}
                    className="inline-flex items-center gap-1 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    title={sortBy === 'stock_asc' ? 'Աճում' : sortBy === 'stock_desc' ? 'Նվազում' : 'Սորտավորել ըստ մնացորդ'}
                  >
                    Մնացորդ
                    <span className="inline-flex flex-col leading-none text-[10px]">
                      {sortBy === 'stock_asc' && <ArrowUp className="h-3 w-3 text-primary-500" />}
                      {sortBy === 'stock_desc' && <ArrowDown className="h-3 w-3 text-primary-500" />}
                      {sortBy !== 'stock_asc' && sortBy !== 'stock_desc' && <ArrowUpDown className="h-3 w-3 text-neutral-400" />}
                    </span>
                  </button>
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Առկայություն</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Լեյբլ</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-neutral-600 uppercase">Գործողություններ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.map((product) => {
                const statusBadge = getStatusBadge(product.status)
                const catName = (product as Product & { category?: { name: string } }).category?.name || product.categoryId || '—'
                const published = (product as Product & { published?: boolean }).published !== false
                const isUpdatingStatus = statusUpdatingId === product.id
                return (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelectOne(product.id)}
                        className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        aria-label={`Ընտրել ${product.name}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="w-14 h-14 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {product.image && product.image !== 'no-image' ? (
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-neutral-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                        <div className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-neutral-900">{catName}</td>
                    <td className="px-3 py-2 text-sm">
                      {product.salePrice ? (
                        <div>
                          <span className="text-green-600 font-semibold">{product.salePrice} ֏</span>
                          <span className="ml-1 text-xs text-neutral-400 line-through">{product.price} ֏</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-neutral-900">{product.price} ֏</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium">{(product.stock || 0)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isAvailable ? 'Առկա' : 'Սպառված'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {statusBadge ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusBadge.className}`}>{statusBadge.text}</span>
                      ) : (
                        <span className="text-xs text-neutral-300 tracking-widest">________</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleStatusToggle(product.id, published)}
                          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 ${published ? 'bg-green-500' : 'bg-red-500'}`}
                          aria-label={published ? 'Ակտիվ' : 'Սևագիր'}
                          title={published ? 'Ակտիվ (սեղմեք՝ սևագիր)' : 'Սևագիր (սեղմեք՝ ակտիվ)'}
                        >
                          <span
                            className={`pointer-events-none absolute top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-all duration-200 ${published ? 'left-[calc(100%-26px)]' : 'left-0.5'}`}
                          >
                            {published ? (
                              <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} />
                            ) : (
                              <X className="h-3.5 w-3.5 text-red-600" strokeWidth={2.5} />
                            )}
                          </span>
                          {isUpdatingStatus && (
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
                              <span className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </span>
                          )}
                        </button>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Խմբագրել"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setProductToDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Ջնջել"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12 text-neutral-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
            <p>{searchTerm.trim() ? 'Որոնման արդյունքներ չեն գտնվել այս էջում' : 'Ապրանքներ չեն գտնվել'}</p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
              itemsLabel="արտադրանքից"
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => !bulkDeleting && setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Խմբային ջնջում"
        message={`Հեռացնել ${selectedIds.size} ապրանք(ներ)։ Գործողությունը հնարավոր չէ հետարկել։`}
        confirmLabel="Ջնջել"
        cancelLabel="Չեղարկել"
        variant="danger"
        isLoading={bulkDeleting}
      />

      <ConfirmModal
        isOpen={productToDelete !== null}
        onClose={() => !singleDeleting && setProductToDelete(null)}
        onConfirm={handleSingleDeleteConfirm}
        title="Ջնջել ապրանքը"
        message="Ապրանքը կհեռացվի ընդմիշտ։ Գործողությունը հնարավոր չէ հետարկել։"
        confirmLabel="Ջնջել"
        cancelLabel="Չեղարկել"
        variant="danger"
        isLoading={singleDeleting}
      />

      <ConfirmModal
        isOpen={bulkStatusConfirm === 'active'}
        onClose={() => !bulkStatusLoading && setBulkStatusConfirm(null)}
        onConfirm={() => handleBulkStatus('active')}
        title="Դնել ակտիվ"
        message={`Ընտրված ${selectedIds.size} ապրանք(ներ) կդրվեն ակտիվ (տեսանելի հաճախորդների համար)։`}
        confirmLabel="Հաստատել"
        cancelLabel="Չեղարկել"
        variant="default"
        isLoading={bulkStatusLoading}
      />

      <ConfirmModal
        isOpen={bulkStatusConfirm === 'draft'}
        onClose={() => !bulkStatusLoading && setBulkStatusConfirm(null)}
        onConfirm={() => handleBulkStatus('draft')}
        title="Դնել սևագիր"
        message={`Ընտրված ${selectedIds.size} ապրանք(ներ) կդրվեն սևագրի (թաքնված հաճախորդներից)։`}
        confirmLabel="Հաստատել"
        cancelLabel="Չեղարկել"
        variant="default"
        isLoading={bulkStatusLoading}
      />
    </div>
  )
}
