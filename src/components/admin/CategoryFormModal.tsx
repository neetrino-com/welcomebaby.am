'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Save } from 'lucide-react'
import BaseModal from '@/components/ui/BaseModal'
import ImageSelector from '@/components/ImageSelector'

export interface CategoryFormData {
  name: string
  description: string
  image: string
  sortOrder: number
  showInMainPage: boolean
  isActive: boolean
}

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
  image: '',
  sortOrder: 0,
  showInMainPage: false,
  isActive: true
}

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mode: 'add' | 'edit'
  editCategory?: {
    id: string
    name: string
    description?: string | null
    image?: string | null
    sortOrder: number
    showInMainPage: boolean
    isActive: boolean
  } | null
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  editCategory
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setError('')
    if (mode === 'edit' && editCategory) {
      setFormData({
        name: editCategory.name || '',
        description: editCategory.description || '',
        image: editCategory.image || '',
        sortOrder: editCategory.sortOrder ?? 0,
        showInMainPage: editCategory.showInMainPage ?? false,
        isActive: editCategory.isActive ?? true
      })
    } else {
      setFormData({ ...emptyForm })
    }
  }, [isOpen, mode, editCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = mode === 'add' ? '/api/admin/categories' : `/api/admin/categories/${editCategory!.id}`
      const method = mode === 'add' ? 'POST' : 'PUT'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const err = await response.json().catch(() => ({}))
        setError(err.error || 'Սխալ')
      }
    } catch (err) {
      console.error(err)
      setError('Սխալ է տեղի ունեցել')
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'add' ? 'Ավելացնել կատեգորիա' : 'Խմբագրել կատեգորիան'
  const titleId = 'category-form-modal-title'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!saving}
      ariaLabelledBy={titleId}
      contentClassName="max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 id={titleId} className="text-xl font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 disabled:opacity-50"
            aria-label="Փակել"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">Անուն *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">Դասավորության կարգ</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Նկարագրություն</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Նկար</label>
              <ImageSelector
                value={formData.image}
                onChange={(imagePath) => setFormData((prev) => ({ ...prev, image: imagePath }))}
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showInMainPage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showInMainPage: e.target.checked }))}
                  className="mr-2 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Ցուցադրել գլխավոր էջում</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Ակտիվ</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-neutral-700 disabled:opacity-50"
              >
                Չեղարկել
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'add' ? 'Ստեղծվում է...' : 'Պահպանվում է...'}
                  </>
                ) : mode === 'add' ? (
                  <>
                    <Plus className="h-4 w-4" />
                    Ստեղծել
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Պահպանել
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </BaseModal>
  )
}
