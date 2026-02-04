'use client'

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, isLoading = false }: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (confirmText !== 'УДАЛИТЬ') {
      setError('Пожалуйста, введите "УДАЛИТЬ" для подтверждения')
      return
    }

    setError('')

    try {
      await onConfirm()
      // Не закрываем модальное окно здесь, так как происходит перенаправление
    } catch (error) {
      setError('Произошла ошибка при удалении аккаунта. Попробуйте еще раз.')
      console.error('Delete account error:', error)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
      <div className="relative flex min-h-full items-center justify-center p-4" onClick={handleClose}>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto my-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Удаление аккаунта</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Внимание! Это действие необратимо</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Ваш аккаунт будет удален навсегда</li>
                  <li>• История заказов останется в системе (анонимно)</li>
                  <li>• Вы не сможете восстановить аккаунт</li>
                  <li>• Все персональные данные будут удалены</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-700">
              Если вы уверены, что хотите удалить свой аккаунт, введите <strong>"УДАЛИТЬ"</strong> в поле ниже:
            </p>
            
            <div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Введите УДАЛИТЬ"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || confirmText !== 'УДАЛИТЬ'}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Удаление...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Удалить аккаунт</span>
              </>
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
