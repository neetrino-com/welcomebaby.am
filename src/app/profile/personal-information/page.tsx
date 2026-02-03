'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react'
import EditProfileModal from '@/components/EditProfileModal'

export default function ProfilePersonalInformationPage() {
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState({
    name: session?.user?.name || null,
    email: session?.user?.email || null,
    phone: null as string | null,
    address: null as string | null,
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setUserProfile((prev) => ({
        ...prev,
        name: session.user?.name || null,
        email: session.user?.email || null,
      }))
    }
  }, [session])

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user/profile')
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) =>
          setUserProfile((prev) => ({
            ...prev,
            name: data.name ?? prev.name,
            phone: data.phone ?? prev.phone,
            address: data.address ?? prev.address,
          }))
        )
        .catch(() => {})
    }
  }, [session?.user?.id])

  const handleSaveProfile = async (data: {
    name: string
    phone: string
    address: string
  }) => {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update profile')
    const updated = await response.json()
    setUserProfile((prev) => ({
      ...prev,
      name: updated.name,
      phone: updated.phone,
      address: updated.address,
    }))
  }

  if (!session) return null

  const fields = [
    {
      icon: User,
      label: 'Անուն',
      value: userProfile.name || '—',
    },
    {
      icon: Mail,
      label: 'Էլ. փոստ',
      value: userProfile.email || '—',
    },
    {
      icon: Phone,
      label: 'Հեռախոս',
      value: userProfile.phone || '—',
    },
    {
      icon: MapPin,
      label: 'Հասցե',
      value: userProfile.address || '—',
    },
  ]

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Անձնական տվյալներ
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Ձեր կոնտակտային տեղեկությունները
          </p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-[#002c45] bg-[#f3d98c] hover:bg-[#f3d98c]/90 transition-colors shrink-0"
        >
          <Edit className="h-4 w-4" />
          Խմբագրել
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
        {fields.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-start gap-4 p-4 bg-white hover:bg-neutral-50/50 transition-colors"
          >
            <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Icon className="h-5 w-5 text-neutral-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                {label}
              </p>
              <p className="mt-1 font-medium text-neutral-900 break-words">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userProfile}
        onSave={handleSaveProfile}
      />
    </div>
  )
}
