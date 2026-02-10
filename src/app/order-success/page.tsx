'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Phone, ArrowRight, XCircle } from 'lucide-react'
import Footer from '@/components/Footer'
import { useCart } from '@/hooks/useCart'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [cartCleared, setCartCleared] = useState(false)
  const markFailedSent = useRef(false)

  const error = searchParams.get('error')
  const orderIdFromUrl = searchParams.get('orderId') ?? searchParams.get('EDP_BILL_NO') ?? ''
  const clearCartParam = searchParams.get('clearCart')
  const hasError = !!error

  // orderId: из URL или из sessionStorage (сохраняем перед редиректом на Idram, если Idram не добавил в FAIL_URL)
  const [orderId, setOrderId] = useState(orderIdFromUrl)
  useEffect(() => {
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl)
      return
    }
    if (typeof window !== 'undefined' && hasError) {
      const fromStorage = window.sessionStorage.getItem('idram_pending_order_id')
      if (fromStorage) setOrderId(fromStorage)
    }
  }, [orderIdFromUrl, hasError])

  // При возврате с Idram по FAIL_URL помечаем заказ как «оплата не прошла»
  useEffect(() => {
    if (!hasError || !orderId || markFailedSent.current) return
    markFailedSent.current = true
    fetch(`/api/orders/${encodeURIComponent(orderId)}/mark-payment-failed`, {
      method: 'POST',
    }).catch(() => {})
    if (typeof window !== 'undefined') window.sessionStorage.removeItem('idram_pending_order_id')
  }, [hasError, orderId])

  // При успешном возврате с Idram убираем сохранённый orderId
  useEffect(() => {
    if (!hasError && typeof window !== 'undefined') window.sessionStorage.removeItem('idram_pending_order_id')
  }, [hasError])

  // Очищаем корзину только при успешном заказе: наличные/карта (редирект без error) или возврат с Idram по SUCCESS_URL (clearCart=true, без error). При fail/pending не очищаем.
  useEffect(() => {
    if (cartCleared) return
    if (!hasError && clearCartParam === 'true') {
      clearCart()
      setCartCleared(true)
    }
  }, [hasError, clearCartParam, cartCleared, clearCart])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="h-20 lg:h-28" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {hasError ? (
            <>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Վճարումը չի կատարվել
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                Պատվերը ձևակերպվել է, սակայն վճարումը չի ավարտվել։ Կարող եք կրկին փորձել կամ ընտրել այլ եղանակ։
              </p>
              {orderId && (
                <p className="text-gray-500 mb-8">Պատվեր #{orderId.slice(-8)}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/checkout"
                  className="inline-flex items-center bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors text-lg"
                >
                  Կրկին փորձել
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-colors text-lg"
                >
                  Գլխավոր էջ
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Պատվերը հաջողությամբ ձևակերպվեց
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Շնորհակալություն պատվերի համար։ Մենք ստացել ենք ձեր պատվերը և շուտով կապ կհաստատենք հաստատման համար։
              </p>
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ի՞նչ հաջորդում է</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-primary-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 mb-1">Պատվերի հաստատում</h3>
                      <p className="text-gray-600">Մենք ձեզ կզանգենք 5 րոպեի ընթացքում պատվերի մանրամասները հաստատելու համար</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 mb-1">Պատրաստում</h3>
                      <p className="text-gray-600">Ձեր պատվերը կպատրաստվի 15-20 րոպեի ընթացքում</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 mb-1">Առաքում</h3>
                      <p className="text-gray-600">Կուրիերը կառաքի պատվերը նշված հասցեով ընտրված ժամին</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Օգնությա՞ն կարիք ունեք</h3>
                <p className="text-gray-600 mb-4">Եթե հարցեր ունեք պատվերի վերաբերյալ, զանգահարեք մեզ՝</p>
                <a href="tel:+37495044888" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg">
                  <Phone className="h-5 w-5 mr-2" />
                  +374 95-044-888
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products" className="inline-flex items-center bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors text-lg">
                  Կատարել ևս պատվեր
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                <Link href="/" className="inline-flex items-center border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-colors text-lg">
                  Գլխավոր էջ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="h-20 lg:h-28" />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-600">Բեռնվում է...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
