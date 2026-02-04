'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState, type ReactNode, type ComponentType } from 'react'

export type SidebarNavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

type SidebarLayoutProps = {
  sidebarTitle: string
  headerTitle: string
  navItems: SidebarNavItem[]
  getIsActive?: (href: string) => boolean
  sidebarHeader?: ReactNode
  sidebarFooter: ReactNode
  children: ReactNode
  mainClassName?: string
}

export default function SidebarLayout({
  sidebarTitle,
  headerTitle,
  navItems,
  getIsActive,
  sidebarHeader,
  sidebarFooter,
  children,
  mainClassName = '',
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: '#f1f5f9' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col
          transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:flex-shrink-0 lg:self-start
          lg:border-r lg:border-white/10 lg:shadow-lg
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: '#002c45' }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 flex-shrink-0">
          <span className="text-lg font-bold text-white">{sidebarTitle}</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Փակել մենյու"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sidebarHeader && <div className="border-b border-white/10 flex-shrink-0">{sidebarHeader}</div>}

        <nav className="flex-1 overflow-y-auto py-4 px-3 min-h-0">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = getIsActive?.(item.href) ?? false
              const isAnchor = item.href.startsWith('#')
              const linkClass = `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                ${isActive ? 'text-[#002c45] bg-[#f3d98c] shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'}
              `
              return (
                <li key={item.href}>
                  {isAnchor ? (
                    <a
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={linkClass}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={linkClass}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/10 flex-shrink-0">{sidebarFooter}</div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-30 flex items-center gap-4 h-14 px-4 border-b border-gray-200 shadow-sm lg:px-8 flex-shrink-0"
          style={{ backgroundColor: '#ffffff' }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Բացել մենյու"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{headerTitle}</h1>
        </header>

        <main className={`flex-1 p-4 lg:p-8 ${mainClassName}`}>{children}</main>
      </div>
    </div>
  )
}
