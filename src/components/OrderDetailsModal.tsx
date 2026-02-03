'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Package, Clock, CheckCircle, XCircle, MapPin, Phone, User, CreditCard, Truck, Loader2, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/utils/priceUtils'
import type { OrderDetails } from '@/types'

const STATUS_CONFIG: Record<
  string,
  { text: string; className: string; icon: typeof Clock }
> = {
  PENDING: {
    text: 'Սպասում է հաստատման',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  CONFIRMED: {
    text: 'Հաստատված',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Package,
  },
  PREPARING: {
    text: 'Պատրաստվում է',
    className: 'bg-[#f3d98c]/20 text-[#002c45] border-[#f3d98c]/40',
    icon: Package,
  },
  READY: {
    text: 'Պատրաստ է հանձնման',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: Package,
  },
  DELIVERED: {
    text: 'Առաքված',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  CANCELLED: {
    text: 'Չեղարկված',
    className: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
  },
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Կանխիկ',
  card: 'Քարտ',
  idram: 'Idram',
  arca: 'ArCa',
  ameriabank: 'Ameriabank',
}

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Պատվերը չի գտնվել')
      }
      const data: OrderDetails = await res.json()
      setOrder(data)
    } catch (e) {
      setOrder(null)
      setError(e instanceof Error ? e.message : 'Սխալ է տեղի ունեցել')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrder()
    } else {
      setOrder(null)
      setError(null)
    }
  }, [isOpen, orderId, fetchOrder])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  const statusCfg = order
    ? STATUS_CONFIG[order.status] ?? {
        text: order.status,
        className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
        icon: Clock,
      }
    : null
  const StatusIcon = statusCfg?.icon ?? Clock

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
          <h2 id="order-details-title" className="text-lg font-bold text-neutral-900">
            Պատվերի մանրամասներ
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Փակել"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 text-[#002c45] animate-spin" />
              <p className="mt-3 text-sm text-neutral-500">Բեռնվում է...</p>
            </div>
          )}

          {error && !loading && (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-neutral-700 mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchOrder}
                className="px-4 py-2 rounded-xl font-medium text-white bg-[#002c45] hover:opacity-90"
              >
                Կրկին փորձել
              </button>
            </div>
          )}

          {order && !loading && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-neutral-900">
                  Պատվեր #{order.id.slice(-8).toUpperCase()}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusCfg?.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusCfg?.text}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                {new Date(order.createdAt).toLocaleDateString('hy-AM', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              <section>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ապրանքներ
                </h3>
                <ul className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 bg-white">
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {item.quantity} × {formatPrice(item.price)} ֏
                        </p>
                      </div>
                      <p className="font-semibold text-neutral-900 flex-shrink-0">
                        {formatPrice(item.quantity * item.price)} ֏
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-end">
                  <p className="text-base font-bold text-neutral-900">
                    Ընդամենը: {formatPrice(order.total)} ֏
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Առաքում (Երևան)
                </h3>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-neutral-900">
                    <User className="h-4 w-4 text-neutral-500" />
                    {order.name}
                  </p>
                  <p className="flex items-center gap-2 text-neutral-900">
                    <Phone className="h-4 w-4 text-neutral-500" />
                    {order.phone}
                  </p>
                  <p className="flex items-start gap-2 text-neutral-900">
                    <MapPin className="h-4 w-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <span>{order.address}</span>
                  </p>
                  {order.deliveryTime && (
                    <p className="text-neutral-600">
                      Առաքման ժամանակ: {order.deliveryTime}
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-neutral-600 pt-1 border-t border-neutral-200">
                      Նշումներ: {order.notes}
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Վճարում
                </h3>
                <p className="text-neutral-900">
                  {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
