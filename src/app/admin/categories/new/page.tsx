'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import ImageSelector from '@/components/ImageSelector'

export default function NewCategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    showInMainPage: false,
    isActive: true
  })

  // Проверяем права доступа
  useEffect(() => {
    if (status === 'loading') return

    // Временно отключаем проверку авторизации для тестирования
    // if (!session || session.user?.role !== 'ADMIN') {
    //   router.push('/login')
    //   return
    // }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/categories')
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Ошибка при создании категории')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      setError('Ошибка при создании категории')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#002c45', borderTopColor: 'transparent' }}></div>
          <p className="text-[#002c45]">Բեռնվում է...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
        
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/categories"
              className="mr-4 p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
              style={{ color: '#002c45' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: '#002c45' }}>Ավելացնել կատեգորիա</h1>
          </div>
          <p className="opacity-80" style={{ color: '#002c45' }}>Նոր ապրանքային կատեգորիայի ստեղծում</p>
        </div>

        {/* Форма */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Первая строка: Название и Порядок сортировки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Название */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#002c45' }}>
                  Անուն *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c45]"
                  required
                />
              </div>

              {/* Порядок сортировки */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#002c45' }}>
                  Դասավորության կարգ
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c45]"
                />
              </div>
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#002c45' }}>
                Նկարագրություն
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c45]"
                rows={4}
              />
            </div>

            {/* Изображение */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#002c45' }}>
                Նկար
              </label>
              <ImageSelector
                value={formData.image}
                onChange={(imagePath) => setFormData(prev => ({ ...prev, image: imagePath }))}
              />
            </div>

            {/* Чекбоксы */}
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showInMainPage}
                  onChange={(e) => setFormData(prev => ({ ...prev, showInMainPage: e.target.checked }))}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm" style={{ color: '#002c45' }}>Ցուցադրել գլխավոր էջում</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm" style={{ color: '#002c45' }}>Ակտիվ</span>
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link
                href="/admin/categories"
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-neutral-50 transition-colors font-medium text-center"
                style={{ borderColor: '#002c45', color: '#002c45' }}
              >
                Չեղարկել
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: '#002c45' }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Ստեղծվում է...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ստեղծել
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
