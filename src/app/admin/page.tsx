'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Package,
  Users,
  DollarSign,
  CheckCircle,
  Tag,
} from 'lucide-react'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  totalDeliveryTypes: number
  totalCategories: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalDeliveryTypes: 0,
    totalCategories: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    // Временно отключаем проверку авторизации для тестирования
    // if (!session || session.user?.role !== 'ADMIN') {
    //   router.push('/login')
    //   return
    // }

    // Загружаем статистику
    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Временно отключаем проверку авторизации для тестирования
  // if (!session || session.user?.role !== 'ADMIN') {
  //   return null
  // }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Գլխավոր</h2>
        <p className="text-gray-600 text-sm">Կառավարեք կատալոգը, պատվերները և կարգավորումները</p>
      </div>

      {/* Stats row - our colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Օգտատերեր</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3d98c' }}>
              <Users className="h-5 w-5" style={{ color: '#002c45' }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Եկամուտ</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} ֏</p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3d98c' }}>
              <DollarSign className="h-5 w-5" style={{ color: '#002c45' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity - our colors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Վերջին գործողություններ</h2>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3d98c' }}>
                <CheckCircle className="h-4 w-4" style={{ color: '#002c45' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Նոր պատվեր</p>
                <p className="text-xs text-gray-500">Վերջին պատվերները կարող եք դիտել Պատվերներ բաժնում</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3d98c' }}>
                <Package className="h-4 w-4" style={{ color: '#002c45' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Ապրանքներ</p>
                <p className="text-xs text-gray-500">Ավելացրեք և խմբագրեք ապրանքները Ապրանքներ բաժնում</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3d98c' }}>
                <Tag className="h-4 w-4" style={{ color: '#002c45' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Կատեգորիաներ</p>
                <p className="text-xs text-gray-500">Կարգավորեք կատեգորիաները Կատեգորիաներ բաժնում</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}