'use client'

import { useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  isLoading?: boolean
}

/**
 * Reusable confirmation modal for destructive or critical actions.
 * Armenian labels by default. ESC to close, click outside to close.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Հաստատել',
  cancelLabel = 'Չեղարկել',
  variant = 'danger',
  isLoading = false
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 id="confirm-modal-title" className="text-lg font-semibold text-neutral-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100"
            aria-label="Փակել"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-neutral-600 text-sm">{message}</p>
        </div>
        <div className="flex gap-3 p-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-xl font-medium text-white disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary-500 hover:bg-primary-600'
            }`}
          >
            {isLoading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
