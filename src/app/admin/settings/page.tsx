'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Settings, Save, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

interface SiteSettings {
  logo?: string
  siteName?: string
  siteDescription?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
}

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [logoVersion, setLogoVersion] = useState(Date.now())

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // Сохраняем каждую настройку отдельно
      const promises = Object.entries(settings).map(([key, value]) =>
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, value }),
        })
      )

      await Promise.all(promises)
      setMessage({ type: 'success', text: 'Կարգավորումները պահպանվել են։' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Պահպանելիս սխալ է տեղի ունեցել' })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateLogo = () => {
    // Логотип обновляется автоматически через API
    setMessage({ type: 'success', text: 'Логотип успешно обновлен!' })
    // Обновляем страницу через 1 секунду, чтобы показать новый логотип
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="ml-3 text-neutral-600">Բեռնվում է...</p>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary-500" />
          Կայքի կարգավորումներ
        </h1>
        <p className="text-neutral-600 text-sm mt-1">Լոգո և հիմնական կարգավորումներ</p>
      </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary-500" />
              Կայքի լոգո
            </h2>
            <p className="text-neutral-600 text-sm mb-4">
              Բեռնեք նոր լոգո։ Խորհուրդ է տրվում 180×60px
            </p>
            <div className="mb-4">
              <p className="text-sm font-medium text-neutral-700 mb-2">Ընթացիկ լոգո</p>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <img 
                    src={`${settings.logo || '/logo.png'}?v=${logoVersion}`}
                    alt="Current Logo" 
                    className="h-16 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>

              <ImageUpload
                currentImage={`${settings.logo || '/logo.png'}`}
                onImageChange={async (url) => {
                  console.log('Logo uploaded, URL:', url)
                  try {
                    // сохраняем новое значение логотипа в настройках
                    const response = await fetch('/api/admin/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ key: 'logo', value: url })
                    })
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}`)
                    }
                    
                    console.log('Logo setting saved successfully')
                    setSettings(prev => ({ ...prev, logo: url }))
                    setLogoVersion(Date.now()) // Обновляем версию для обхода кэша
                    setMessage({ type: 'success', text: 'Լոգոն թարմացվել է։' })
                  } catch (err) {
                    console.error('Failed to save logo setting', err)
                    setMessage({ type: 'error', text: 'Լոգոն պահպանելիս սխալ' })
                  }
                }}
                onImageRemove={() => {
                  // Можно добавить функцию сброса к дефолтному логотипу
                  console.log('Reset to default logo')
                }}
                maxSize={2}
                className="max-w-md"
              />
            </div>

          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Կայքի տեղեկություն</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Կայքի անուն</label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="WelcomeBaby"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Հեռախոս</label>
                <input
                  type="tel"
                  value={settings.contactPhone || ''}
                  onChange={(e) => updateSetting('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+374 XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="info@example.am"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Հասցե</label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Երևան, Հայաստան"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Կայքի նկարագրություն</label>
              <textarea
                value={settings.siteDescription || ''}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Նկարագրություն..."
              />
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {isSaving ? 'Պահպանվում է...' : 'Պահպանել'}
          </button>
        </div>
      </div>
    </div>
  )
}

