'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Truck,
  Settings,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Դաշնբորդ', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Ապրանքներ', icon: Package },
  { href: '/admin/categories', label: 'Կատեգորիաներ', icon: Tag },
  { href: '/admin/orders', label: 'Պատվերներ', icon: ShoppingCart },
  { href: '/admin/delivery-types', label: 'Առաքման տեսակներ', icon: Truck },
  { href: '/admin/settings', label: 'Կարգավորումներ', icon: Settings }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Overlay on mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Left sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 flex-shrink-0 flex flex-col
          bg-white border-r border-neutral-200 shadow-sm
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-200">
          <span className="font-semibold text-neutral-900">Ադմին</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100"
            aria-label="Փակել մենյու"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? 'bg-primary-500/10 text-primary-500' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-neutral-200">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 flex-shrink-0" />
            Վերադառնալ կայք
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center h-14 px-4 bg-white border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            aria-label="Բացել մենյու"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
