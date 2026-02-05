'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BaseModal from '@/components/ui/BaseModal'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
  }
  onSave: (data: { name: string; phone: string; address: string }) => Promise<void>
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      })
      setErrors({})
    }
  }, [isOpen, user])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Անունը պարտադիր է'
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Մուտքագրեք ճիշտ հեռախոսահամար'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      ariaLabelledBy="edit-profile-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-300/50 bg-white/80 backdrop-blur-sm">
        <h2 id="edit-profile-title" className="text-xl font-semibold text-gray-900">Խմբագրել պրոֆիլը</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white/60 backdrop-blur-sm">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2" />
            Անուն *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Մուտքագրեք ձեր անունը"
            className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </label>
          <Input
            type="email"
            value={user.email || ''}
            disabled
            className="bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">Էլ․փոստը հնարավոր չէ փոխել</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 inline mr-2" />
            Հեռախոս
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+374 XX XXX XXX"
            className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-2" />
            Հասցե
          </label>
          <Input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Մուտքագրեք ձեր հասցեն"
            disabled={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Չեղարկել
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Պահպանվում է...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Պահպանել
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}
