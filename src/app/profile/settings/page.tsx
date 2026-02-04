'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { LogOut, Trash2, AlertTriangle } from 'lucide-react'
import DeleteAccountModal from '@/components/DeleteAccountModal'

export default function ProfileSettingsPage() {
  const { data: session } = useSession()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const { signOut: doSignOut } = await import('next-auth/react')
        await doSignOut({ callbackUrl: '/account-deleted' })
        window.location.href = '/account-deleted'
      } else {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      setIsDeletingAccount(false)
      throw error
    }
  }

  if (!session) return null

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">
          Կարգավորումներ
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Ելք հաշվից և հաշվի ջնջում
        </p>
      </div>

      <div className="space-y-6 max-w-md">
        <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-sm font-semibold text-neutral-700">
              Հաշիվ
            </h2>
          </div>
          <div className="p-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              <LogOut className="h-5 w-5 text-neutral-500" />
              Ելք հաշվից
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-red-800">
              Վտանգավոր գործողություն
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-red-700/90 mb-4">
              Հաշվի ջնջումը անշարժելի է։ Բոլոր տվյալները և պատվերների պատմությունը կվերանան։
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-medium bg-white hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              Ջնջել հաշիվը
            </button>
          </div>
        </section>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
      />
    </div>
  )
}
