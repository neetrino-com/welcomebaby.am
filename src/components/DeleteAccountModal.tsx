'use client'

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import BaseModal from '@/components/ui/BaseModal'

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
    if (confirmText !== 'ՋՆՋԵԼ') {
      setError('Խնդրում ենք մուտքագրել «ՋՆՋԵԼ» հաստատելու համար')
      return
    }

    setError('')

    try {
      await onConfirm()
    } catch (error) {
      setError('Սխալ է տեղի ունեցել հաշիվը ջնջելիս։ Կրկին փորձեք։')
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      ariaLabelledBy="delete-account-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h2 id="delete-account-title" className="text-xl font-bold text-gray-900">Հաշվի ջնջում</h2>
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
              <h3 className="font-semibold text-red-800 mb-2">Ուշադրություն! Այս գործողությունը անդառնալի է</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Ձեր հաշիվը կջնջվի ընդմիշտ</li>
                <li>• Պատվերների պատմությունը կմնա համակարգում (անանուն)</li>
                <li>• Հնարավոր չի լինի վերականգնել հաշիվը</li>
                <li>• Բոլոր անձնական տվյալները կջնջվեն</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-gray-700">
            Եթե վստահ եք, որ ցանկանում եք ջնջել հաշիվը, մուտքագրեք <strong>&quot;ՋՆՋԵԼ&quot;</strong> ստորև.
          </p>

          <div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Մուտքագրեք ՋՆՋԵԼ"
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
          Չեղարկել
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading || confirmText !== 'ՋՆՋԵԼ'}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Ջնջվում է...</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              <span>Ջնջել հաշիվը</span>
            </>
          )}
        </button>
      </div>
    </BaseModal>
  )
}
