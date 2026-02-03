'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { LayoutDashboard, Package, User, Settings, ChevronLeft } from 'lucide-react'
import Footer from '@/components/Footer'

const navItems = [
  { href: '/profile', label: 'Գլխավոր', icon: LayoutDashboard },
  { href: '/profile/orders', label: 'Պատվերներ', icon: Package },
  { href: '/profile/personal-information', label: 'Տվյալներ', icon: User },
  { href: '/profile/settings', label: 'Կարգավորումներ', icon: Settings },
]

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div
          className="w-10 h-10 rounded-full border-2 border-[#f3d98c] border-t-transparent animate-spin"
          aria-hidden
        />
      </div>
    )
  }

  if (!session) return null

  const isActive = (href: string) =>
    href === '/profile' ? pathname === '/profile' : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="h-20 lg:h-28 flex-shrink-0" aria-hidden />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-10">
        {/* Mobile: back link + horizontal nav */}
        <div className="lg:hidden mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-[#002c45] mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Դեպի կայք
          </Link>
          <div className="flex gap-1 p-1 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${active ? 'bg-[#002c45] text-white' : 'text-neutral-600 hover:bg-neutral-100'}
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Desktop: sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-28 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-100">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-neutral-500 hover:text-[#002c45]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Դեպի կայք
                </Link>
              </div>
              <div className="p-3 border-b border-neutral-100 bg-neutral-50/50">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider px-2 mb-1">
                  Հաշիվ
                </p>
                <p className="font-semibold text-neutral-900 truncate px-2">
                  {session.user?.name || session.user?.email || 'Օգտատեր'}
                </p>
              </div>
              <nav className="p-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${active ? 'bg-[#f3d98c] text-[#002c45]' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}
                      `}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 opacity-80" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm min-h-[320px] overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}
