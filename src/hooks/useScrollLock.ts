'use client'

import { useEffect } from 'react'

/**
 * useScrollLock — блокировка скролла body при открытых модалках.
 * Reference counting для вложенных/параллельных модалок.
 * Компенсация scrollbar для предотвращения "прыжка" layout.
 * SSR-safe: все операции в useEffect, проверка document.
 */
let lockCount = 0
let savedStyles: { overflow: string; paddingRight: string } | null = null

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return

    const isFirst = lockCount === 0
    lockCount += 1

    if (isFirst) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      savedStyles = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      }
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0 && savedStyles) {
        document.body.style.overflow = savedStyles.overflow
        document.body.style.paddingRight = savedStyles.paddingRight
        savedStyles = null
      }
    }
  }, [active])
}
