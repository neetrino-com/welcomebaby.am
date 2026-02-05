'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '@/hooks/useScrollLock'

const Z_MODAL = 10000 // Выше ChatButton (z-9999)

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  /** Закрывать по клику на overlay. По умолчанию true. */
  closeOnOverlayClick?: boolean
  /** variant center — flex items-center; top — items-start (для OrderDetailsModal). */
  variant?: 'center' | 'top'
  /** aria-labelledby для доступности */
  ariaLabelledBy?: string
  /** Дополнительные классы для контейнера контента (карточки), например max-w-lg, max-w-4xl */
  contentClassName?: string
  /** Дополнительные классы для wrapper (например pt для отступа сверху) */
  wrapperClassName?: string
  children: React.ReactNode
}

/**
 * BaseModal — единая база для всех модалок.
 * - Portal в document.body (изоляция от overflow-hidden/transform родителей)
 * - Overlay + центрирование по viewport
 * - Scroll lock с ref counting
 * - Esc, overlay click
 * - role="dialog", aria-modal
 */
export default function BaseModal({
  isOpen,
  onClose,
  closeOnOverlayClick = true,
  variant = 'center',
  ariaLabelledBy,
  contentClassName = '',
  wrapperClassName = '',
  children,
}: BaseModalProps) {
  useScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const alignClass = variant === 'top' ? 'items-start pt-20 lg:pt-28' : 'items-center'
  const maxHClass = variant === 'top' ? 'max-h-[calc(100vh-6rem)]' : 'max-h-[calc(100vh-2rem)]'
  const myClass = variant === 'center' ? 'my-auto' : ''

  const modalNode = (
    <div
      className={`fixed inset-0 overflow-y-auto overflow-x-hidden p-4 pb-8 bg-black/50 backdrop-blur-sm ${alignClass} flex min-h-full justify-center ${wrapperClassName}`}
      style={{ zIndex: Z_MODAL }}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto ${maxHClass} ${myClass} ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalNode, document.body)
}
