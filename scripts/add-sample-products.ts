/**
 * Скрипт для добавления тестовых товаров в каждую категорию
 * 
 * Запуск: npx tsx scripts/add-sample-products.ts
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { assertNeonDatabaseUrl } from '../src/lib/db-config'

// Загружаем переменные окружения из .env файла вручную
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const envFile = readFileSync(envPath, 'utf-8')
    const lines = envFile.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key.trim()] = value.trim()
        }
      }
    }
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL не найден в .env файле!')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке .env файла:', error)
    throw error
  }
}

// Загружаем переменные окружения
loadEnv()
// Запрет локальной БД: только Neon
assertNeonDatabaseUrl()

const prisma = new PrismaClient()

// Тестовые товары для каждой категории
const sampleProducts = [
  {
    categoryName: 'Օրորոցներ',
    products: [
      { name: 'Օրորոց Classic', description: 'Բարձրորակ փայտե օրորոց', price: 45000, image: '/images/Օրորոցներ.JPG' },
      { name: 'Օրորոց Premium', description: 'Նորաձև օրորոց մոդեռն դիզայնով', price: 65000, image: '/images/Օրորոցներ.JPG' }
    ]
  },
  {
    categoryName: 'Պահարաններ',
    products: [
      { name: 'Պահարան 3 դարակ', description: 'Պահարան 3 դարակով մանկական սենյակի համար', price: 35000, image: '/images/Պահարաններ.JPG' },
      { name: 'Պահարան 5 դարակ', description: 'Խոշոր պահարան 5 դարակով', price: 55000, image: '/images/Պահարաններ.JPG' }
    ]
  },
  {
    categoryName: 'Օրթոպեդ ներքնակներ',
    products: [
      { name: 'Օրթոպեդ ներքնակ Standard', description: 'Առողջ քնի համար նախատեսված ներքնակ', price: 25000, image: '/images/Օրթոպեդ ներքնակներ.JPG' }
    ]
  },
  {
    categoryName: 'Անկողնային պարագաներ',
    products: [
      { name: 'Անկողնային հավաքածու', description: 'Լրիվ հավաքածու անկողնային պարագաներով', price: 15000, image: '/images/Անկողնային պարագաներ.JPG' }
    ]
  },
  {
    categoryName: 'Հավաքածուներ',
    products: [
      { name: 'Նորածինների հավաքածու', description: 'Ամբողջական հավաքածու նորածինների համար', price: 85000, image: '/images/Հավաքածուներ.JPG' }
    ]
  },
  {
    categoryName: 'Երաժշտական խաղալիքներ',
    products: [
      { name: 'Երաժշտական մոբիլ', description: 'Երաժշտական մոբիլ մանկական մահճակալի համար', price: 12000, image: '/images/Երաժշտական խաղալիքներ.JPG' }
    ]
  },
  {
    categoryName: 'Մանկասայլակի հավաքածուներ',
    products: [
      { name: 'Մանկասայլակի հավաքածու', description: 'Լրիվ հավաքածու մանկասայլակի համար', price: 45000, image: '/images/Մանկասայլակի հավաքածուներ.JPG' }
    ]
  },
  {
    categoryName: 'Սենյակի դեկորներ',
    products: [
      { name: 'Դեկորատիվ լամպ', description: 'Դեկորատիվ լամպ մանկական սենյակի համար', price: 8000, image: '/images/Սենյակի դեկորներ.JPG' }
    ]
  },
  {
    categoryName: 'Գործած զամբյուղներ',
    products: [
      { name: 'Զամբյուղ պահեստային', description: 'Գործած զամբյուղ պահեստային իրերի համար', price: 5000, image: '/images/Գործած զամբյուղներ.JPG' }
    ]
  },
  {
    categoryName: 'Լոգանքի պարագաներ',
    products: [
      { name: 'Լոգանքի հավաքածու', description: 'Լրիվ հավաքածու լոգանքի պարագաներով', price: 18000, image: '/images/Լոգանքի պարագաներ.JPG' }
    ]
  },
  {
    categoryName: 'Գործած ադիալներ',
    products: [
      { name: 'Ադիալ պարագաներ', description: 'Գործած ադիալ պարագաներ', price: 6000, image: '/images/Գործած ադիալներ.JPG' }
    ]
  },
  {
    categoryName: 'Կերակրման բարձեր',
    products: [
      { name: 'Կերակրման բարձ', description: 'Հարմարավետ բարձ կերակրման համար', price: 10000, image: '/images/Կերակրման բարձեր.JPG' }
    ]
  },
  {
    categoryName: 'Քողեր',
    products: [
      { name: 'Քող մանկական', description: 'Գեղեցիկ քող մանկական սենյակի համար', price: 12000, image: '/images/Քողեր.JPG' }
    ]
  },
  {
    categoryName: 'Հյուսեր',
    products: [
      { name: 'Հյուս գործվածք', description: 'Բարձրորակ հյուս գործվածք', price: 8000, image: '/images/Հյուսեր.JPG' }
    ]
  },
  {
    categoryName: 'Դուրս գրման հավաքածուներ',
    products: [
      { name: 'Դուրս գրման հավաքածու', description: 'Ամբողջական հավաքածու դուրս գրման համար', price: 55000, image: '/images/Դուրս գրման հավաքածուներ.JPG' }
    ]
  }
]

async function addSampleProducts() {
  try {
    console.log('🔄 Начинаю добавление тестовых товаров...')
    
    // Получаем все категории
    const categories = await prisma.category.findMany()
    console.log(`📊 Найдено ${categories.length} категорий`)
    
    let totalAdded = 0
    
    // Добавляем товары для каждой категории
    for (const categoryData of sampleProducts) {
      const category = categories.find(cat => cat.name === categoryData.categoryName)
      
      if (!category) {
        console.warn(`⚠️  Категория "${categoryData.categoryName}" не найдена, пропускаю...`)
        continue
      }
      
      for (const productData of categoryData.products) {
        try {
          const product = await prisma.product.create({
            data: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              image: productData.image,
              categoryId: category.id,
              ingredients: 'Բարձրորակ նյութեր',
              isAvailable: true,
              stock: 10,
              status: 'REGULAR'
            }
          })
          console.log(`   ✓ Добавлен товар: ${product.name} (${category.name})`)
          totalAdded++
        } catch (error) {
          console.error(`   ❌ Ошибка при добавлении товара "${productData.name}":`, error)
        }
      }
    }
    
    console.log(`\n✅ Успешно добавлено ${totalAdded} товаров!`)
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении товаров:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск скрипта
addSampleProducts()
  .then(() => {
    console.log('\n🎉 Скрипт выполнен успешно!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Критическая ошибка:', error)
    process.exit(1)
  })


