'use client'

import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminLayout>{children}</AdminLayout>
    </div>
  )
}
