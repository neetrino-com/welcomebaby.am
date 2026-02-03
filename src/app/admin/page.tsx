'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  CheckCircle,
  Settings,
  Tag,
  Truck
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
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Բեռնվում է...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  const adminSections = [
    { title: 'Ապրանքներ', description: 'Ապրանքների և կատալոգի կառավարում', href: '/admin/products', icon: Package, color: 'bg-blue-500', stats: `${stats.totalProducts} ապրանք` },
    { title: 'Կատեգորիաներ', description: 'Կատեգորիաների կառավարում', href: '/admin/categories', icon: Tag, color: 'bg-green-500', stats: `${stats.totalCategories} կատեգորիա` },
    { title: 'Պատվերներ', description: 'Պատվերների դիտում և մշակում', href: '/admin/orders', icon: ShoppingCart, color: 'bg-orange-500', stats: `${stats.totalOrders} պատվեր` },
    { title: 'Առաքման տեսակներ', description: 'Առաքման եղանակների կառավարում', href: '/admin/delivery-types', icon: Truck, color: 'bg-indigo-500', stats: `${stats.totalDeliveryTypes} տեսակ` },
    { title: 'Կարգավորումներ', description: 'Համակարգի կարգավորում', href: '/admin/settings', icon: Settings, color: 'bg-purple-500', stats: 'Կարգավորում' }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Դաշնբորդ</h1>
        <p className="text-neutral-600 text-sm mt-1">Կառավարեք խանութը</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {adminSections.map((section) => {
          const IconComponent = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-neutral-200 hover:border-primary-500/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${section.color} text-white`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-neutral-500">{section.stats}</span>
              </div>
              <h3 className="font-semibold text-neutral-900 group-hover:text-primary-500">{section.title}</h3>
              <p className="text-neutral-500 text-sm mt-0.5">{section.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Բոլոր ապրանքները</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Պատվերներ</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Օգտատերեր</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Եկամուտ</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalRevenue.toLocaleString()} ֏</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Վերջին գործողություններ</h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Նոր պատվեր</p>
              <p className="text-xs text-neutral-500">Վերջին պատվերները կարող եք դիտել Պատվերներ բաժնում</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Ապրանքներ</p>
              <p className="text-xs text-neutral-500">Ավելացրեք և խմբագրեք ապրանքները</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Tag className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Կատեգորիաներ</p>
              <p className="text-xs text-neutral-500">Կառավարեք կատեգորիաները</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
