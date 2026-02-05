'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Truck,
  ChevronLeft,
} from 'lucide-react'
import SidebarLayout, { type SidebarNavItem } from '@/components/SidebarLayout'

const adminNavItems: SidebarNavItem[] = [
  { href: '/admin', label: 'Գլխավոր', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Ապրանքներ', icon: Package },
  { href: '/admin/categories', label: 'Կատեգորիաներ', icon: Tag },
  { href: '/admin/orders', label: 'Պատվերներ', icon: ShoppingCart },
  { href: '/admin/delivery-types', label: 'Առաքում', icon: Truck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getIsActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <SidebarLayout
      sidebarTitle="Admin"
      headerTitle="Ադմին-պանել"
      navItems={adminNavItems}
      getIsActive={getIsActive}
      sidebarFooter={
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
          Դեպի կայք
        </Link>
      }
    >
      {children}
    </SidebarLayout>
  )
}
