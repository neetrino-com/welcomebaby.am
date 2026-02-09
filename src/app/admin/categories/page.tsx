'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Search, Filter, Tag } from 'lucide-react'
import Pagination from '@/components/Pagination'
import BulkActionsBar from '@/components/admin/BulkActionsBar'
import ConfirmModal from '@/components/admin/ConfirmModal'
import CategoryFormModal from '@/components/admin/CategoryFormModal'

const PAGE_SIZE = 10

interface Category {
  id: string
  name: string
  description?: string | null
  image?: string | null
  sortOrder: number
  showInMainPage: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { products: number }
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [singleDeleting, setSingleDeleting] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      } else {
        setError('Բեռնումը ձախողվեց')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Սխալ է տեղի ունեցել')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchStatus = showInactive || cat.isActive
      return matchSearch && matchStatus
    })
  }, [categories, searchTerm, showInactive])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE))
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCategories.slice(start, start + PAGE_SIZE)
  }, [filteredCategories, currentPage])

  const handleSingleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    setSingleDeleting(true)
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete}`, { method: 'DELETE' })
      if (response.ok) {
        setCategoryToDelete(null)
        await fetchCategories()
      } else {
        const err = await response.json().catch(() => ({}))
        alert(err.error || 'Ջնջելիս սխալ')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      alert('Ջնջելիս սխալ')
    } finally {
      setSingleDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkDeleting(true)
    try {
      const response = await fetch('/api/admin/categories/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        if ((data.failed || []).length > 0) {
          alert(`Ջնջվել է ${data.deleted}. Չհաջողված՝ ${data.failed.length} (օր. ապրանքներով կատեգորիա)։`)
        }
        setSelectedIds(new Set())
        setBulkConfirmOpen(false)
        fetchCategories()
      } else {
        alert(data.error || 'Սխալ')
      }
    } catch {
      alert('Սխալ')
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedCategories.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedCategories.map((c) => c.id)))
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

  if (status === 'loading' || (loading && categories.length === 0)) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Բեռնվում է...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') return null

  const allSelected = paginatedCategories.length > 0 && selectedIds.size === paginatedCategories.length
  const someSelected = selectedIds.size > 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Կատեգորիաներ</h1>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
        >
          <Plus className="h-5 w-5" />
          Ավելացնել կատեգորիա
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Փնտրել կատեգորիաներ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowInactive(!showInactive)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showInactive ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'}`}
          >
            <Filter className="h-4 w-4" />
            {showInactive ? 'Թաքցնել ոչ ակտիվ' : 'Ցուցադրել ոչ ակտիվ'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchCategories}
            className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium"
          >
            Կրկին փորձել
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Կատեգորիաներ ({filteredCategories.length})
          </h2>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={PAGE_SIZE}
              totalItems={filteredCategories.length}
              itemsLabel="կատեգորիայից"
            />
          )}
        </div>

        {someSelected && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onBulkDelete={() => setBulkConfirmOpen(true)}
            deleteLabel="Խմբային ջնջում"
            isLoading={bulkDeleting}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
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
                <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-600 uppercase min-w-[160px]">Անուն</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Ապրանքներ</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-neutral-600 uppercase">Գործողություններ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(category.id)}
                      onChange={() => toggleSelectOne(category.id)}
                      className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                      aria-label={`Ընտրել ${category.name}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        {category.image && category.image.trim() !== '' ? (
                          <img src={category.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-neutral-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{category.description}</div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {category.showInMainPage && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Գլխավոր</span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'}`}>
                            {category.isActive ? 'Ակտիվ' : 'Ոչ ակտիվ'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-neutral-900">{category._count?.products ?? 0}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Խմբագրել"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Ջնջել"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-12 text-neutral-500">
            <Tag className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
            <p className="text-lg font-medium">Կատեգորիաներ չեն գտնվել</p>
            <p className="text-sm mt-1">Փոխեք փնտրումը կամ ավելացրեք նոր կատեգորիա</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={PAGE_SIZE}
              totalItems={filteredCategories.length}
              itemsLabel="կատեգորիայից"
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={bulkConfirmOpen}
        onClose={() => !bulkDeleting && setBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Խմբային ջնջում"
        message={`Հեռացնել ${selectedIds.size} կատեգորիա։ Կատեգորիաներ, որոնց մեջ ապրանքներ կան, չեն ջնջվի։ Գործողությունը հնարավոր չէ հետարկել։`}
        confirmLabel="Ջնջել"
        cancelLabel="Չեղարկել"
        variant="danger"
        isLoading={bulkDeleting}
      />

      <ConfirmModal
        isOpen={categoryToDelete !== null}
        onClose={() => !singleDeleting && setCategoryToDelete(null)}
        onConfirm={handleSingleDeleteConfirm}
        title="Ջնջել կատեգորիան"
        message="Կատեգորիան կհեռացվի։ Եթե դրանում ապրանքներ կան, ջնջումը չի կատարվի։ Գործողությունը հնարավոր չէ հետարկել։"
        confirmLabel="Ջնջել"
        cancelLabel="Չեղարկել"
        variant="danger"
        isLoading={singleDeleting}
      />

      <CategoryFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchCategories}
        mode="add"
      />

      <CategoryFormModal
        isOpen={editCategory !== null}
        onClose={() => setEditCategory(null)}
        onSuccess={fetchCategories}
        mode="edit"
        editCategory={editCategory}
      />
    </div>
  )
}
