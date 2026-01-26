'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react'

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
            <Link
              href="/admin/categories/new"
              className="flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить категорию
            </Link>
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
                {category.image && !category.image.startsWith('/images/') ? (
                  // Используем обычный img для blob URLs (Next.js Image не работает с query параметрами в blob URLs)
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-white/20 flex items-center justify-center text-4xl"
                  style={{ display: (category.image && !category.image.startsWith('/images/')) ? 'none' : 'flex' }}
                >
                  🎯
                </div>
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
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Редактировать
                </Link>
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
    </div>
  )
}