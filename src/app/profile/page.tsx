'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Package, Settings, ArrowRight } from 'lucide-react'

export default function ProfileDashboardPage() {
  const { data: session } = useSession()
  const [ordersCount, setOrdersCount] = useState<number | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/orders?page=1&pageSize=1')
        .then((res) => (res.ok ? res.json() : {}))
        .then((data: { totalCount?: number }) => setOrdersCount(data.totalCount ?? 0))
        .catch(() => setOrdersCount(0))
    }
  }, [session])

  if (!session) return null

  const cards = [
    {
      href: '/profile/orders',
      label: 'Պատվերներ',
      description: ordersCount !== null ? `${ordersCount} պատվեր` : 'Բեռնվում է...',
      icon: Package,
      accent: 'bg-amber-100 text-[#002c45]',
    },
    {
      href: '/profile/personal-information',
      label: 'Անձնական տվյալներ',
      description: 'Անուն, հեռախոս, հասցե',
      icon: User,
      accent: 'bg-amber-100 text-[#002c45]',
    },
    {
      href: '/profile/settings',
      label: 'Կարգավորումներ',
      description: 'Ելք, ջնջել հաշիվ',
      icon: Settings,
      accent: 'bg-neutral-100 text-neutral-700',
    },
  ]

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <p className="text-sm text-neutral-500 mb-1">Իմ հաշիվ</p>
        <h1 className="text-2xl font-bold text-neutral-900">
          Բարի գալուստ, {session.user?.name || 'Օգտատեր'}
        </h1>
        <p className="mt-2 text-neutral-600">
          Կառավարեք ձեր պատվերները և անձնական տվյալները։
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-4 p-5 rounded-xl border border-neutral-200 bg-white hover:border-amber-200 hover:shadow-md transition-all duration-200"
            >
              <span
                className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${item.accent}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-neutral-900 group-hover:text-[#002c45]">
                  {item.label}
                </span>
                <p className="text-sm text-neutral-500 mt-0.5">{item.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-300 group-hover:text-[#002c45] flex-shrink-0 mt-0.5" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
