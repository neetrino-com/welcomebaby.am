'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { formatPrice } from '@/utils/priceUtils'
import OrderDetailsModal from '@/components/OrderDetailsModal'
import type { OrderSummary, OrdersListResponse } from '@/types'

const PAGE_SIZE = 10

const ORDER_STATUS_CONFIG: Record<
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

/** Для онлайн-оплаты при FAILED/PENDING показываем статус оплаты (как в Bank-integration-shop) */
const PAYMENT_STATUS_CONFIG: Record<
  string,
  { text: string; className: string; icon: typeof Clock }
> = {
  PENDING: {
    text: 'Սպասում է վճարման',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  FAILED: {
    text: 'Վճարումը ձախողվել',
    className: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
  },
}

export default function ProfileOrdersPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<OrdersListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [modalOrderId, setModalOrderId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(
        `/api/orders?page=${page}&pageSize=${PAGE_SIZE}`
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Բեռնումը ձախողվեց')
      }
      const json: OrdersListResponse = await res.json()
      setData(json)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : 'Սխալ է տեղի ունեցել')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const openOrderModal = (orderId: string) => {
    setModalOrderId(orderId)
    setModalOpen(true)
  }

  const closeOrderModal = () => {
    setModalOpen(false)
    setModalOrderId(null)
  }

  if (!session) return null

  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 0
  const totalCount = data?.totalCount ?? 0
  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">
          Պատվերների պատմություն
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Ձեր բոլոր պատվերները մեկ տեղում
        </p>
      </div>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-16">
          <div
            className="w-10 h-10 rounded-full border-2 border-amber-200 border-t-[#002c45] animate-spin"
            aria-hidden
          />
          <p className="mt-4 text-sm text-neutral-500">Բեռնվում է...</p>
        </div>
      )}

      {error && !loading && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-neutral-700 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl font-medium text-white bg-[#002c45] hover:opacity-90"
          >
            Կրկին փորձել
          </button>
        </div>
      )}

      {!loading && !error && data && items.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-neutral-400" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Դեռ պատվերներ չունեք
          </h2>
          <p className="mt-2 text-neutral-500 text-sm max-w-sm mx-auto">
            Խանութում ընտրեք ապրանքներ և ձևակերպեք առաջին պատվերը։
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-2.5 rounded-xl font-medium text-[#002c45] bg-[#f3d98c] hover:bg-[#f3d98c]/90 transition-colors"
          >
            Դիտել կատալոգ
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <p className="text-sm text-neutral-500 mb-4">
            Ցուցադրվում է {from}–{to} / {totalCount}
          </p>
          <ul className="space-y-4">
            {items.map((order: OrderSummary) => {
              const isOnlinePayment =
                order.paymentMethod === 'idram' ||
                order.paymentMethod === 'ameriabank'
              const paymentStatus = order.paymentStatus ?? 'PENDING'
              const usePaymentLabel =
                isOnlinePayment &&
                (paymentStatus === 'FAILED' || paymentStatus === 'PENDING')
              const config = usePaymentLabel
                ? PAYMENT_STATUS_CONFIG[paymentStatus] ??
                  ORDER_STATUS_CONFIG[order.status] ?? {
                    text: order.status,
                    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
                    icon: Clock,
                  }
                : ORDER_STATUS_CONFIG[order.status] ?? {
                    text: order.status,
                    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
                    icon: Clock,
                  }
              const StatusIcon = config.icon
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => openOrderModal(order.id)}
                    className="w-full text-left rounded-xl border border-neutral-200 bg-neutral-50/50 overflow-hidden hover:border-[#f3d98c] hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-neutral-200 bg-white">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          Պատվեր #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('hy-AM', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1 truncate max-w-xs">
                          {order.itemCount} ապրանք
                          {order.firstItemName ? ` · ${order.firstItemName}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <p className="text-lg font-bold text-neutral-900">
                          {formatPrice(order.total)} ֏
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.text}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          {totalPages > 1 && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Նախորդ
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true
                    if (p === 1 || p === totalPages) return true
                    if (Math.abs(p - page) <= 1) return true
                    return false
                  })
                  .reduce<number[]>((acc, p, i, arr) => {
                    if (i > 0 && arr[i - 1] !== p - 1) acc.push(-1)
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === -1 ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-neutral-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`min-w-[2.25rem] py-2 rounded-lg border text-sm font-medium transition-colors ${
                          page === p
                            ? 'border-[#002c45] bg-[#002c45] text-white'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                Հաջորդ
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}

          <OrderDetailsModal
            isOpen={modalOpen}
            onClose={closeOrderModal}
            orderId={modalOrderId}
          />
        </>
      )}
    </div>
  )
}
