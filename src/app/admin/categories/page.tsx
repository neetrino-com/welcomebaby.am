'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react'
import ImageSelector from '@/components/ImageSelector'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  sortOrder: number
  showInMainPage: boolean
  isActive: boolean
  createdAt: string
  _count: {
    products: number
  }
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    showInMainPage: false,
    isActive: true
  })

  useEffect(() => {
    if (status === 'loading') return

    // Временно отключаем проверку авторизации для тестирования
    // if (!session || session.user?.role !== 'ADMIN') {
    //   router.push('/login')
    //   return
    // }

    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCategories()
        setShowModal(false)
        setEditingCategory(null)
        setFormData({
          name: '',
          description: '',
          image: '',
          sortOrder: 0,
          showInMainPage: false,
          isActive: true
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при сохранении категории')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Ошибка при сохранении категории')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      sortOrder: category.sortOrder,
      showInMainPage: category.showInMainPage,
      isActive: category.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCategories()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при удалении категории')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Ошибка при удалении категории')
    }
  }


  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = showInactive || category.isActive
    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#002c45' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#f3d98c', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Загружается...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#002c45' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin"
              className="mr-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Управление категориями</h1>
          </div>
          <p className="text-gray-300">Создание и редактирование категорий товаров</p>
        </div>

        {/* Панель управления */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Поиск */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск категорий..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Фильтр */}
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showInactive 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showInactive ? 'Скрыть неактивные' : 'Показать неактивные'}
              </button>
            </div>

            {/* Кнопка добавления */}
            <button
              onClick={() => {
                setEditingCategory(null)
                setFormData({
                  name: '',
                  description: '',
                  image: '',
                  sortOrder: 0,
                  showInMainPage: false,
                  isActive: true
                })
                setShowModal(true)
              }}
              className="flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить категорию
            </button>
          </div>
        </div>

        {/* Список категорий */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              {/* Изображение категории */}
              <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-4xl">
                    🎯
                  </div>
                )}
              </div>

              {/* Информация о категории */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{category.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Товаров: {category._count.products}</span>
                  <span>Порядок: {category.sortOrder}</span>
                </div>
              </div>

              {/* Статусы */}
              <div className="flex flex-wrap gap-2 mb-4">
                {category.showInMainPage && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-400/30">
                    На главной
                  </span>
                )}
                {category.isActive ? (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-400/30">
                    Активна
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-400/30">
                    Неактивна
                  </span>
                )}
              </div>

              {/* Действия */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/30"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-white mb-2">Категории не найдены</h3>
            <p className="text-gray-300">Попробуйте изменить параметры поиска или добавьте новую категорию</p>
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Название */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>

              {/* Изображение */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Изображение
                </label>
                <ImageSelector
                  value={formData.image}
                  onChange={(imagePath) => setFormData(prev => ({ ...prev, image: imagePath }))}
                />
              </div>

              {/* Порядок сортировки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Порядок сортировки
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Чекбоксы */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showInMainPage}
                    onChange={(e) => setFormData(prev => ({ ...prev, showInMainPage: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Показывать на главной странице</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Активна</span>
                </label>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}