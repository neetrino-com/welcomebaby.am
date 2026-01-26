'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'

export default function Footer() {
  const { settings } = useSettings()
  
  return (
    <footer className="text-white py-12" style={{ backgroundColor: '#002c45' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6 -mt-4">
              <Image 
                src={settings.logo || "/logo.png"} 
                alt={settings.siteName || "WelcomeBaby Logo"} 
                width={160} 
                height={60}
                className="h-16 w-auto"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/welcome_baby_armenia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors" 
                style={{ color: '#ffffff' }} 
                onMouseEnter={(e) => e.target.style.color = '#f3d98c'} 
                onMouseLeave={(e) => e.target.style.color = '#ffffff'}
              >
                <Instagram className="h-5 w-5" style={{ color: '#ffffff' }} />
              </a>
              <a 
                href="https://www.facebook.com/welcomebaby.yerevan?utm_source=neetrino.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors" 
                style={{ color: '#ffffff' }} 
                onMouseEnter={(e) => e.target.style.color = '#f3d98c'} 
                onMouseLeave={(e) => e.target.style.color = '#ffffff'}
              >
                <Facebook className="h-5 w-5" style={{ color: '#ffffff' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ marginLeft: '60px' }}>
            <h4 className="text-lg font-semibold mb-4 mt-6">Մենյու</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  Կատալոգ
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  Մեր մասին
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  Կապ
                </Link>
              </li>
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 mt-6">Կարևոր Հղումներ</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  Գաղտնիության Քաղաքականություն
                </Link>
              </li>
              <li>
                <Link href="/delivery-terms" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  Առաքման և Մատակարարման Պայմաններ
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  Վերադարձի և Փոխանակման Քաղաքականություն
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  Օգտագործման Պայմաններ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 mt-6">Կապ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" style={{ color: '#ffffff' }} />
                <a href="tel:+37477792929" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  +374 77 79 29 29
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" style={{ color: '#ffffff' }} />
                <a href="tel:+37444792929" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  +374 44 79 29 29
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" style={{ color: '#ffffff' }} />
                <a href="mailto:info@welcomebaby.am" className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                  info@welcomebaby.am
                </a>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" style={{ color: '#ffffff' }} />
                  <a 
                    href="https://maps.google.com/?q=14,+Արցախի+պողոտա,+Երևան,+Հայաստան"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
                  >
                    14, Արցախի պողոտա, Երևան
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" style={{ color: '#ffffff' }} />
                  <a 
                    href="https://maps.google.com/?q=42,+Պուշկինի+փողոց,+Գյումրի,+Հայաստան"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors" style={{ color: '#ffffff' }} onMouseEnter={(e) => e.target.style.color = '#f3d98c'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
                  >
                    42, Պուշկինի փողոց, Գյումրի
                  </a>
                </div>
              </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" style={{ color: '#ffffff' }} />
                  <div style={{ color: '#ffffff' }}>
                    <div>Աշխատում ենք ամեն օր</div>
                    <div className="text-sm">Ժամը՝ 11։00 - 20։00</div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm font-light tracking-wide" style={{ color: '#ffffff' }}>
              Copyright © 2025. All Rights Reserved. Created by{' '}
              <a 
                href="https://neetrino.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors font-normal"
                style={{ color: '#f3d98c' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#f3d98c'}
              >
                Neetrino IT Company
              </a>
            </p>
            <div className="flex items-center">
              <Image 
                src="/images/Group 465918.png" 
                alt="Payment Methods"
                width={100}
                height={20}
                className="h-5 w-auto opacity-90 hover:opacity-100 transition-opacity"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
