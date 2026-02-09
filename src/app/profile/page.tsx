'use client'

import { useSession, getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, Fragment } from 'react'
import Link from 'next/link'
import {
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Edit,
  Trash2,
  LogOut,
} from 'lucide-react'
import EditProfileModal from '@/components/EditProfileModal'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import { formatPrice } from '@/utils/priceUtils'

interface Order {
  id: string
  status: string
  paymentStatus?: string | null
  paymentMethod?: string
  total: number
  createdAt: string
  itemCount?: number
  firstItemName?: string | null
  items?: Array<{
    product: { name: string; image: string }
    quantity: number
    price: number
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: session?.user?.name || null,
    email: session?.user?.email || null,
    phone: null as string | null,
    address: null as string | null
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    fetchOrders()
    fetchUserProfile()
  }, [session, status, router])

  useEffect(() => {
    if (session?.user) {
      setUserProfile(prev => ({
        ...prev,
        name: session.user?.name || null,
        email: session.user?.email || null
      }))
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?page=1&pageSize=20')
      if (response.ok) {
        const data = await response.json()
        const list = Array.isArray(data?.items) ? data.items : []
        setOrders(list)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(prev => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          address: data.address
        }))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSaveProfile = async (data: { name: string; phone: string; address: string }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserProfile(prev => ({
          ...prev,
          name: updatedProfile.name,
          phone: updatedProfile.phone,
          address: updatedProfile.address
        }))
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    
    try {
      console.log('🔄 Starting account deletion...')
      
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        console.log('✅ Account deleted successfully')
        
        // Выходим из системы и перенаправляем на страницу подтверждения
        const { signOut } = await import('next-auth/react')
        
        // Выходим из системы с перенаправлением на страницу подтверждения
        await signOut({ callbackUrl: '/account-deleted' })
        
        // Принудительно обновляем сессию после выхода
        await getSession()
        
        // Перенаправляем на страницу подтверждения
        window.location.href = '/account-deleted'
        
        console.log('✅ Signed out successfully')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('❌ Error deleting account:', error)
      setIsDeletingAccount(false)
      throw error
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Սպասում է հաստատման', color: 'text-yellow-600', bg: 'bg-yellow-100' }
      case 'CONFIRMED':
        return { text: 'Պատվերն ընդունված է', color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'PREPARING':
        return { text: 'Մշակվում է', color: 'text-[#f3d98c]', bg: 'bg-[#f3d98c]/10' }
      case 'READY':
        return { text: 'Պատրաստ է հանձնման', color: 'text-purple-600', bg: 'bg-purple-100' }
      case 'DELIVERED':
        return { text: 'Առաքված', color: 'text-green-600', bg: 'bg-green-100' }
      case 'CANCELLED':
        return { text: 'Չեղարկված', color: 'text-red-600', bg: 'bg-red-100' }
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const getPaymentStatusInfo = (order: Order) => {
    const isOnline = order.paymentMethod === 'idram' || order.paymentMethod === 'ameriabank'
    const ps = order.paymentStatus ?? 'PENDING'
    if (!isOnline) {
      return { text: 'Սպասում ենք վճարման', color: 'text-amber-700', bg: 'bg-amber-100' }
    }
    switch (ps) {
      case 'PENDING':
        return { text: 'Սպասում է վճարման', color: 'text-amber-700', bg: 'bg-amber-100' }
      case 'SUCCESS':
        return { text: 'Վճարված', color: 'text-green-700', bg: 'bg-green-100' }
      case 'FAILED':
        return { text: 'Վճարումը ձախողվել', color: 'text-red-600', bg: 'bg-red-100' }
      default:
        return { text: ps, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'CONFIRMED':
      case 'PREPARING':
      case 'READY':
        return <Package className="h-4 w-4" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#f3d98c', borderTopColor: 'transparent' }}
          />
          <p className="text-gray-600">Բեռնվում է...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Fragment>
      <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-6">
            {/* Profile card */}
            <section id="profile" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#f3d98c' }}
                    >
                      <User className="h-8 w-8" style={{ color: '#002c45' }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{userProfile.name || 'Օգտատեր'}</h2>
                      <p className="text-sm text-gray-600">{userProfile.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-gray-900 transition-colors shrink-0"
                    style={{ backgroundColor: '#f3d98c' }}
                  >
                    <Edit className="h-5 w-5" />
                    Խմբագրել
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500">Հեռախոս</p>
                      <p className="font-medium text-gray-900">{userProfile.phone || 'Չի նշված'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-500">Հասցե</p>
                      <p className="font-medium text-gray-900 truncate">{userProfile.address || 'Չի նշված'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Orders */}
            <section id="orders" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Պատվերների պատմություն</h2>
              </div>
              <div className="p-4 md:p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#f3d98c' }}>
                      <Package className="h-7 w-7" style={{ color: '#002c45' }} />
                    </div>
                    <p className="mb-4">Դուք դեռ պատվերներ չունեք</p>
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-gray-900 transition-colors"
                      style={{ backgroundColor: '#f3d98c' }}
                    >
                      Պատվիրել
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isCashOrCard =
                        order.paymentMethod !== 'idram' &&
                        order.paymentMethod !== 'ameriabank'
                      const displayStatus =
                        isCashOrCard && order.status === 'PENDING'
                          ? 'CONFIRMED'
                          : order.status
                      const statusInfo = getStatusInfo(displayStatus)
                      return (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-xl p-4 bg-gray-50/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">Պատվեր #{order.id.slice(-8)}</h3>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('hy-AM', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)} ֏</p>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                              >
                                {getStatusIcon(displayStatus)}
                                {statusInfo.text}
                              </span>
                              {(() => {
                                const payInfo = getPaymentStatusInfo(order)
                                const isPaid = order.paymentStatus === 'SUCCESS'
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${payInfo.bg} ${payInfo.color}`}
                                  >
                                    {isPaid ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                    {payInfo.text}
                                  </span>
                                )
                              })()}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {Array.isArray(order.items) && order.items.length > 0 ? (
                              order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 py-2 border-t border-gray-200/80 first:border-t-0"
                                >
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                                    style={{ backgroundColor: '#f3d98c' + '40' }}
                                  >
                                    {item.product?.image ? (
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-5 w-5" style={{ color: '#002c45' }} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} հատ × {formatPrice(item.price)} ֏
                                  </p>
                                </div>
                                <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                                  {formatPrice(item.quantity * item.price)} ֏
                                </p>
                              </div>
                            ))
                            ) : (
                              <div className="flex items-center gap-3 py-2">
                                <Package className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <p className="text-gray-600 text-sm">
                                  {order.firstItemName || 'Պատվեր'}
                                  {(order.itemCount ?? 0) > 1 ? ` +${(order.itemCount ?? 0) - 1}` : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

        {/* Account actions */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Ելք հաշվից
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Ջնջել հաշիվը
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userProfile}
        onSave={handleSaveProfile}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
      />
    </Fragment>
  )
}
