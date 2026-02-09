'use client'

import {
  Calendar,
  User as UserIcon,
  Phone,
  CreditCard,
  Package,
  Clock,
  X,
  CheckCircle,
  AlertCircle,
  Truck,
  CheckSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import BaseModal from '@/components/ui/BaseModal'
import type { Order, OrderItem, User } from '@/types'

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

const statusBackgroundColors: Record<string, string> = {
  PENDING: 'bg-yellow-100',
  CONFIRMED: 'bg-blue-100',
  PREPARING: 'bg-orange-100',
  READY: 'bg-green-100',
  DELIVERED: 'bg-emerald-100',
  CANCELLED: 'bg-red-100',
}

const statusBorderColors: Record<string, string> = {
  PENDING: 'border-yellow-300',
  CONFIRMED: 'border-blue-300',
  PREPARING: 'border-orange-300',
  READY: 'border-green-300',
  DELIVERED: 'border-emerald-300',
  CANCELLED: 'border-red-300',
}

const ORDER_TABS = [
  { value: 'PENDING', label: 'Սպասում' },
  { value: 'CONFIRMED', label: 'Հաստատված' },
  { value: 'PREPARING', label: 'Պատրաստվում' },
  { value: 'READY', label: 'Պատրաստ' },
  { value: 'DELIVERED', label: 'Առաքված' },
  { value: 'CANCELLED', label: 'Չեղարկված' },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'PENDING': return <Clock className="h-4 w-4" />
    case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
    case 'PREPARING': return <Package className="h-4 w-4" />
    case 'READY': return <CheckSquare className="h-4 w-4" />
    case 'DELIVERED': return <Truck className="h-4 w-4" />
    case 'CANCELLED': return <X className="h-4 w-4" />
    default: return <AlertCircle className="h-4 w-4" />
  }
}

interface AdminOrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderWithDetails | null
  onStatusUpdate: (orderId: string, newStatus: string) => void
}

export default function AdminOrderDetailsModal({
  isOpen,
  onClose,
  order,
  onStatusUpdate,
}: AdminOrderDetailsModalProps) {
  if (!isOpen || !order) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      ariaLabelledBy="order-details-title"
      contentClassName="!w-full sm:!w-[50%] max-w-[95vw] sm:max-w-none flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden"
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200 rounded-t-2xl bg-white">
          <h2 id="order-details-title" className="text-xl font-semibold text-neutral-900">
            Պատվեր #{order.id.slice(-8)}
          </h2>
          <Button onClick={onClose} variant="outline" size="sm" className="gap-2" aria-label="Փակել">
            <X className="h-4 w-4" />
            Փակել
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${statusBackgroundColors[order.status] || 'bg-neutral-100'} ${statusBorderColors[order.status] || 'border-neutral-300'} border rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-3">
                {getStatusIcon(order.status)}
                <span className="font-medium text-neutral-900">Կարգավիճակ</span>
              </div>
              <select
                value={order.status}
                onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                className={`w-full px-3 py-2 bg-white border-2 ${statusBorderColors[order.status] || 'border-neutral-300'} rounded-xl focus:ring-2 focus:ring-primary-500 text-neutral-900 font-medium`}
              >
                {ORDER_TABS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-neutral-900">Պատվերի ժամանակ</span>
              </div>
              <div className="text-sm font-medium text-neutral-900">
                {new Date(order.createdAt).toLocaleString('hy-AM')}
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span className="font-medium text-neutral-900">Գումար</span>
              </div>
              <div className="text-lg font-semibold text-orange-600">
                {order.totalAmount.toLocaleString()} ֏
              </div>
              <div className="text-sm font-medium text-neutral-700">{order.paymentMethod}</div>
            </div>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary-500" />
              Հաճախորդ և առաքում
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Անուն</p>
                <p className="font-medium text-neutral-900">{order.user?.name ?? order.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Email</p>
                <p className="font-medium text-neutral-900">{order.user?.email ?? '—'}</p>
              </div>
              {(order.user?.phone || order.phone) && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Հեռախոս</p>
                  <p className="font-medium text-neutral-900 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {order.user?.phone || order.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-neutral-600 mb-1">Հասցե</p>
                <p className="font-medium text-neutral-900">{order.address || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Առաքման ժամանակ</p>
                <p className="font-medium text-neutral-900">{order.deliveryTime ?? '—'}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-500" />
              Ապրանքներ
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-3">
                    {item.product.image && item.product.image !== 'no-image' ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span className="text-lg">🧸</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm text-neutral-900">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-600">
                          {item.product.price.toLocaleString()} ֏
                        </span>
                        <span className="text-neutral-400">×</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">
                          {item.quantity} հատ
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-neutral-900">
                      {(item.product.price * item.quantity).toLocaleString()} ֏
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.quantity} × {item.product.price.toLocaleString()} ֏
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
