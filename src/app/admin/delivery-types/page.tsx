'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Pagination from '@/components/Pagination'
import BulkActionsBar from '@/components/admin/BulkActionsBar'
import ConfirmModal from '@/components/admin/ConfirmModal'

const PAGE_SIZE = 10

interface DeliveryType {
  id: string
  name: string
  deliveryTime: string
  description: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function DeliveryTypesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<DeliveryType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    deliveryTime: '',
    description: '',
    price: 0,
    isActive: true
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchDeliveryTypes()
  }, [session, status, router])

  const fetchDeliveryTypes = async () => {
    try {
      const response = await fetch('/api/delivery-types')
      if (response.ok) {
        const result = await response.json()
        setDeliveryTypes(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching delivery types:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(deliveryTypes.length / PAGE_SIZE))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return deliveryTypes.slice(start, start + PAGE_SIZE)
  }, [deliveryTypes, currentPage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingType ? `/api/delivery-types/${editingType.id}` : '/api/delivery-types'
      const method = editingType ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        await fetchDeliveryTypes()
        setIsModalOpen(false)
        setEditingType(null)
        setFormData({ name: '', deliveryTime: '', description: '', price: 0, isActive: true })
      } else {
        const err = await response.json().catch(() => ({}))
        alert(err.error || 'Պահպանելիս սխալ')
      }
    } catch (error) {
      alert('Պահպանելիս սխալ')
    }
  }

  const handleEdit = (type: DeliveryType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      deliveryTime: type.deliveryTime,
      description: type.description,
      price: type.price,
      isActive: type.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Հեռացնել այս առաքման տեսակը?')) return
    try {
      const response = await fetch(`/api/delivery-types/${id}`, { method: 'DELETE' })
      if (response.ok) await fetchDeliveryTypes()
      else {
        const err = await response.json()
        alert(err.error || 'Ջնջելիս սխալ')
      }
    } catch (error) {
      alert('Ջնջելիս սխալ')
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkDeleting(true)
    try {
      const response = await fetch('/api/admin/delivery-types/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        if ((data.failed || []).length > 0) {
          alert(`Ջնջվել է ${data.deleted}. Չհաջողված՝ ${data.failed.length}.`)
        }
        setSelectedIds(new Set())
        setBulkConfirmOpen(false)
        fetchDeliveryTypes()
      } else {
        alert(data.error || 'Սխալ')
      }
    } catch (error) {
      alert('Սխալ')
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginated.map((t) => t.id)))
  }

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleNew = () => {
    setEditingType(null)
    setFormData({ name: '', deliveryTime: '', description: '', price: 0, isActive: true })
    setIsModalOpen(true)
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

  const allSelected = paginated.length > 0 && selectedIds.size === paginated.length
  const someSelected = selectedIds.size > 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Առաքման տեսակներ</h1>
          <p className="text-neutral-600 text-sm mt-1">Առաքման եղանակների կառավարում</p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
        >
          <Plus className="h-5 w-5" />
          Ավելացնել տեսակ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Բոլոր տեսակները ({deliveryTypes.length})</h2>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => { setCurrentPage(p); setSelectedIds(new Set()) }}
              itemsPerPage={PAGE_SIZE}
              totalItems={deliveryTypes.length}
              itemsLabel="տեսակից"
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

        <div className="p-4">
          {deliveryTypes.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="rounded border-neutral-300 text-primary-500"
                aria-label="Ընտրել բոլորը"
              />
              <span className="text-sm text-neutral-600">Ընտրել բոլորը (էջում)</span>
            </div>
          )}
          {deliveryTypes.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Truck className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Տեսակներ չկան</h3>
              <p className="text-sm mb-4">Ավելացրեք առաջին առաքման տեսակը</p>
              <button onClick={handleNew} className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600">
                Ավելացնել
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((type) => (
                <div key={type.id} className="border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(type.id)}
                      onChange={() => toggleSelectOne(type.id)}
                      className="mt-1 rounded border-neutral-300 text-primary-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary-500" />
                          <h3 className="font-semibold text-neutral-900">{type.name}</h3>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${type.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {type.isActive ? 'Ակտիվ' : 'Ոչ ակտիվ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Clock className="h-4 w-4" />
                        {type.deliveryTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 mt-1">
                        <DollarSign className="h-4 w-4" />
                        {type.price.toFixed(0)} ֏
                      </div>
                      <p className="text-sm text-neutral-500 line-clamp-2 mt-2">{type.description}</p>
                      <div className="flex gap-2 mt-3">
                        <button type="button" onClick={() => handleEdit(type)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-sm">
                          <Edit className="h-3.5 w-3.5" /> Խմբագրել
                        </button>
                        <button type="button" onClick={() => handleDelete(type.id)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                          <Trash2 className="h-3.5 w-3.5" /> Ջնջել
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => { setCurrentPage(p); setSelectedIds(new Set()) }}
              itemsPerPage={PAGE_SIZE}
              totalItems={deliveryTypes.length}
              itemsLabel="տեսակից"
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                {editingType ? 'Խմբագրել առաքման տեսակ' : 'Նոր առաքման տեսակ'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Անուն *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Օր. Կուրիերային առաքում"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Առաքման ժամանակ *</label>
                  <input
                    type="text"
                    required
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Օր. 1-2 օր"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Նկարագրություն *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Նկարագրություն"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Գին (֏) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700">Ակտիվ</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50">
                    Չեղարկել
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                    {editingType ? 'Պահպանել' : 'Ստեղծել'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={bulkConfirmOpen}
        onClose={() => !bulkDeleting && setBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Խմբային ջնջում"
        message={`Հեռացնել ${selectedIds.size} առաքման տեսակ(ներ)։`}
        confirmLabel="Ջնջել"
        cancelLabel="Չեղարկել"
        variant="danger"
        isLoading={bulkDeleting}
      />
    </div>
  )
}
