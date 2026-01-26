'use client'

import Image from 'next/image'
import { Clock, Users, Heart, Award, ChefHat } from 'lucide-react'
import { AnimatedCounter } from "@/components/AnimatedCounter"
import Footer from "@/components/Footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#ffffff' }}>
      
      {/* Отступ для fixed хедера */}
      <div className="lg:hidden h-20"></div>
      <div className="hidden lg:block h-28"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Մեր պատմությունը</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content - Left */}
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Welcome Baby ընկերությունը ստեղծվել է 2015 թվականին՝ Անահիտ և Լուսինե Անդրյանների ջանքերի շնորհիվ։ Նորածնային կահույք և անկողնային պարագաներ արտադրող ընկերություն, որն ունի իր 2 խանութ սրահները՝ Երևանում և Գյումրիում։
              </p>
              <p>
                Շուրջ 10 տարիների ընթացքում ունենք 80.000 գոհ պատվիրատուներ, ավելի քան 50 գործընկերներ և 100.000ից ավել միավոր ապրանքի արտադրություն։
              </p>
              <p>
                Ունենք առաքում Երևանում, Հայաստանի բոլոր մարզերում նաև արտերկիր հայ փոստի միջոցով։
              </p>
              <p>
                Ամենակարևոր առավելություններից է անհատական պատվերների ընդունումը և պատվերների սեղմ ժամկետները։
              </p>
            </div>
            
            {/* Image - Right */}
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/quyrikneri-nkar.webp"
                alt="Welcome Baby թիմը"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Մեր արժեքները</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#f3d98c' }}>
                <Heart className="h-10 w-10" style={{ color: '#002c45' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Սեր գործի հանդեպ</h3>
              <p className="text-gray-700 leading-relaxed">
                Յուրաքանչյուր ուտեստ պատրաստվում է հոգով և մանրամասների նկատմամբ ուշադրությամբ
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#f3d98c' }}>
                <Award className="h-10 w-10" style={{ color: '#002c45' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Որակ</h3>
              <p className="text-gray-700 leading-relaxed">
                Օգտագործում ենք միայն լավագույն բաղադրիչներ և ստուգված բաղադրատոմսեր
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#f3d98c' }}>
                <Clock className="h-10 w-10" style={{ color: '#002c45' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Արագություն</h3>
              <p className="text-gray-700 leading-relaxed">
                Պատրաստում ենք արագ, բայց ոչ որակի և համի հաշվին
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Մեր թիմը</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: '#f3d98c' }}>
                <ChefHat className="h-16 w-16" style={{ color: '#002c45' }} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Գլխավոր խոհարար</h3>
              <p className="text-gray-700 leading-relaxed">
                15 տարվա փորձով Երևանու լավագույն ռեստորաններում: 
                Գիտի կատարյալ խմորի և լցոնման գաղտնիքները:
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: '#f3d98c' }}>
                <Users className="h-16 w-16" style={{ color: '#002c45' }} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Մենեջեր</h3>
              <p className="text-gray-700 leading-relaxed">
                Ապահովում է գերազանց սպասարկում և սպասարկման որակ: 
                Միշտ կօգնի ընտրության հարցում և կպատասխանի հարցերին:
              </p>
            </div>
            
          </div>
        </div>


        {/* Statistics Section */}
        <section className="py-16 lg:py-20" style={{ backgroundColor: '#ffffff' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Մեր Առավելությունները
              </h2>
              <p className="text-lg text-gray-600 whitespace-nowrap">
                Տարիների փորձը եվ հազարավոր գոհ հաճախորդները մեր հպարտությունն են
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {/* Years of Experience */}
              <div className="text-center group">
                <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                    <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter 
                      end={10} 
                      suffix="+"
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900"
                      duration={2500}
                    />
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                      Տարվա Փորձ
                    </div>
                  </div>
                </div>
              </div>

              {/* Partners */}
              <div className="text-center group">
                <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                    <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter 
                      end={50} 
                      suffix="+"
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900"
                      duration={2000}
                    />
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                      Գործընկեր
                    </div>
                  </div>
                </div>
              </div>

              {/* Happy Customers */}
              <div className="text-center group">
                <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                    <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter 
                      end={80000} 
                      suffix="+"
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900"
                      duration={3000}
                    />
                    <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                      Գոհ Հաճախորդ
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Sold */}
              <div className="text-center group">
                <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 min-h-[320px] flex flex-col justify-center items-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f3d98c' }}>
                    <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter 
                      end={100000} 
                      suffix="+"
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900"
                      duration={3500}
                    />
                    <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-tight">
                      Վաճառված Ապրանք
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <div className="bg-white rounded-3xl p-16 shadow-lg mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Մեր ծառայությունները</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f3d98c' }}>
                <span className="text-2xl font-bold" style={{ color: '#002c45' }}>1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Արտադրություն</h3>
              <p className="text-gray-700">Նորածնային կահույք և անկողնային պարագաներ</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f3d98c' }}>
                <span className="text-2xl font-bold" style={{ color: '#002c45' }}>2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Առաքում</h3>
              <p className="text-gray-700">Առաքում Երևանում, Հայաստանի բոլոր մարզերում</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f3d98c' }}>
                <span className="text-2xl font-bold" style={{ color: '#002c45' }}>3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Անհատական պատվերներ</h3>
              <p className="text-gray-700">Ընդունում ենք անհատական պատվերներ</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f3d98c' }}>
                <span className="text-2xl font-bold" style={{ color: '#002c45' }}>4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Արտերկիր առաքում</h3>
              <p className="text-gray-700">Առաքում արտերկիր հայ փոստի միջոցով</p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Hide Footer on Mobile and Tablet */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}