'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Order, OrderItem, User } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Search,
  Eye,
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  Calendar
} from 'lucide-react'
import Pagination from '@/components/Pagination'
import AdminTabs from '@/components/admin/Tabs'
import BulkActionsBar from '@/components/admin/BulkActionsBar'
import ConfirmModal from '@/components/admin/ConfirmModal'
import AdminOrderDetailsModal from '@/components/admin/AdminOrderDetailsModal'

interface OrderWithDetails extends Order {
  user: User
  items: (OrderItem & {
    product: {
      id: string
      name: string
      price: number
      image: string
    }
  })[]
  totalAmount: number
}

interface OrdersResponse {
  orders: OrderWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusBackgroundColors = {
  PENDING: 'bg-yellow-100',
  CONFIRMED: 'bg-blue-100',
  PREPARING: 'bg-orange-100',
  READY: 'bg-green-100',
  DELIVERED: 'bg-emerald-100',
  CANCELLED: 'bg-red-100'
}

const statusBorderColors = {
  PENDING: 'border-yellow-300',
  CONFIRMED: 'border-blue-300',
  PREPARING: 'border-orange-300',
  READY: 'border-green-300',
  DELIVERED: 'border-emerald-300',
  CANCELLED: 'border-red-300'
}

const statusLabels: Record<string, string> = {
  PENDING: 'Սպասում',
  CONFIRMED: 'Հաստատված',
  PREPARING: 'Պատրաստվում',
  READY: 'Պատրաստ',
  DELIVERED: 'Առաքված',
  CANCELLED: 'Չեղարկված'
}

const ORDER_TABS = [
  { value: '', label: 'Բոլորը' },
  { value: 'PENDING', label: 'Սպասում' },
  { value: 'CONFIRMED', label: 'Հաստատված' },
  { value: 'PREPARING', label: 'Պատրաստվում' },
  { value: 'READY', label: 'Պատրաստ' },
  { value: 'DELIVERED', label: 'Առաքված' },
  { value: 'CANCELLED', label: 'Չեղարկված' }
]

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Проверяем права доступа
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Загружаем заказы
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      if (dateFrom) {
        params.append('dateFrom', new Date(dateFrom).toISOString())
      }
      if (dateTo) {
        params.append('dateTo', new Date(dateTo).toISOString())
      }

      const response = await fetch(`/api/admin/orders?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data: OrdersResponse = await response.json()
      setOrders(data.orders)
      setPagination(data.pagination)
      
      // Рассчитываем статистику
      const totalRevenue = data.orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const pendingOrders = data.orders.filter(order => order.status === 'PENDING').length
      const completedOrders = data.orders.filter(order => order.status === 'DELIVERED').length
      
      setStats({
        totalOrders: data.pagination.total,
        pendingOrders,
        completedOrders,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Открываем модальное окно с деталями заказа
  const openOrderDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedOrder(null)
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, dateFrom, dateTo])

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkDeleting(true)
    try {
      const response = await fetch('/api/admin/orders/bulk-delete', {
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
        fetchOrders()
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
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)))
    }
  }

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  // Изменяем статус заказа
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Обновляем локальное состояние
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      )

      // Обновляем выбранный заказ в модальном окне
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  // Фильтруем заказы по поисковому запросу
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      (order.user?.name?.toLowerCase().includes(searchLower)) ||
      (order.user?.email?.toLowerCase().includes(searchLower)) ||
      (order.user?.phone?.toLowerCase().includes(searchLower)) ||
      order.name.toLowerCase().includes(searchLower) ||
      order.phone.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    )
  })

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
        <p className="ml-3 text-neutral-600">Բեռնվում է...</p>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  const allSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length
  const someSelected = selectedIds.size > 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Պատվերներ</h1>
        <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Թարմացնել
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Բոլոր պատվերները</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalOrders}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Սպասող</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.pendingOrders}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Ավարտված</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.completedOrders}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Եկամուտ</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalRevenue.toLocaleString()} ֏</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Search className="inline h-4 w-4 mr-1" />
              Փնտրել
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Անուն, email, հեռախոս կամ ID..."
            />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Սկզբից
              </label>
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Մինչև</label>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-neutral-900"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(1) }}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Մաքրել ժամանակահատվածը
              </button>
            )}
          </div>
        </div>
      </div>

      <AdminTabs
        tabs={ORDER_TABS}
        activeValue={statusFilter}
        onChange={(v) => { setStatusFilter(v); setCurrentPage(1); setSelectedIds(new Set()) }}
        className="mb-4"
      />

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Պատվերներ ({pagination.total})</h2>
          {pagination.pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={(p) => { setCurrentPage(p); setSelectedIds(new Set()) }}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
              itemsLabel="պատվերից"
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
          <table className="w-full min-w-[900px]">
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
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Պատվերի №</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase min-w-[140px]">Անուն</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Հեռախոս</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase min-w-[120px]">Հասցե</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Գումար</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Ապրանքներ</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Ամսաթիվ</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Կարգավիճակ</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-neutral-600 uppercase">Գործողություններ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-neutral-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                    <p className="text-lg">Պատվերներ չեն գտնվել</p>
                    <p className="text-sm mt-2">
                      {searchTerm || statusFilter ? 'Փոխեք ֆիլտրերը' : 'Դեռ պատվերներ չկան'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelectOne(order.id)}
                        className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        aria-label={`Ընտրել պատվեր ${order.id.slice(-8)}`}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-neutral-900">#{order.id.slice(-8)}</td>
                    <td className="px-3 py-2 text-sm text-neutral-900">{order.user?.name || order.name || 'Հյուր'}</td>
                    <td className="px-3 py-2 text-sm text-neutral-700">{order.user?.phone || order.phone || '—'}</td>
                    <td className="px-3 py-2 text-sm text-neutral-600 max-w-[180px] truncate" title={order.address}>{order.address || '—'}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-primary-600">{order.totalAmount.toLocaleString()} ֏</td>
                    <td className="px-3 py-2 text-sm text-neutral-600">{order.items.length}</td>
                    <td className="px-3 py-2 text-sm text-neutral-600">
                      {new Date(order.createdAt).toLocaleDateString('hy-AM', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(order.createdAt).toLocaleTimeString('hy-AM', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg border-0 text-xs font-medium cursor-pointer ${statusColors[order.status] || 'bg-neutral-100 text-neutral-700'}`}
                      >
                        {ORDER_TABS.filter((t) => t.value).map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button onClick={() => openOrderDetails(order)} variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Մանրամասներ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-neutral-200">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={(p) => { setCurrentPage(p); setSelectedIds(new Set()) }}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
              itemsLabel="պատվերից"
            />
          </div>
        )}

        {showModal && selectedOrder && (
          <AdminOrderDetailsModal
            isOpen={showModal}
            onClose={closeModal}
            order={selectedOrder}
            onStatusUpdate={updateOrderStatus}
          />
        )}

        <ConfirmModal
          isOpen={bulkConfirmOpen}
          onClose={() => !bulkDeleting && setBulkConfirmOpen(false)}
          onConfirm={handleBulkDelete}
          title="Խմբային ջնջում"
          message={`Հեռացնել ${selectedIds.size} պատվեր(ներ)։ Գործողությունը հնարավոր չէ հետարկել։`}
          confirmLabel="Ջնջել"
          cancelLabel="Չեղարկել"
          variant="danger"
          isLoading={bulkDeleting}
        />
      </div>
    </div>
  )
}

