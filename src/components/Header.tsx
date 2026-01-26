'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  
  // Убеждаемся, что компонент смонтирован на клиенте
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Показываем заглушку пока компонент не смонтирован или сессия загружается
  if (!mounted || status === 'loading') {
    return (
      <>
        <div className="lg:hidden">
          <div className="h-20 bg-[#002c45]" />
        </div>
        <div className="hidden lg:block">
          <div className="h-28 bg-[#002c45]" />
        </div>
      </>
    )
  }
  
  // Принудительное обновление Header при изменении сессии
  const headerKey = session?.user?.id ? `authenticated-${session.user.id}` : 'unauthenticated'

  return (
    <>
      {/* Mobile Header - показывается на мобильных устройствах и планшетах */}
      <div className="lg:hidden" key={`mobile-${headerKey}`}>
        <MobileHeader />
      </div>
      
      {/* Desktop Header - показывается только на десктопе */}
      <div className="hidden lg:block" key={`desktop-${headerKey}`}>
        <DesktopHeader />
      </div>
    </>
  )
}