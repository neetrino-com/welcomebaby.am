'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

/** Рендерит Header только вне админ-панели (/admin). В админке хедер скрыт. */
export default function ConditionalHeader() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <Header />
}
