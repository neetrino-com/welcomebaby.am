/**
 * Скрипт для замены всех категорий
 * Удаляет все существующие категории и создает новые 15 категорий с правильными изображениями
 * 
 * Запуск: npx tsx scripts/replace-categories.ts
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
    
    // Проверяем что DATABASE_URL загружен
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL не найден в .env файле!')
      console.log('📁 Путь к .env:', envPath)
      console.log('📄 Первые строки .env:', envFile.split('\n').slice(0, 5).join('\n'))
    } else {
      console.log('✅ DATABASE_URL загружен из .env')
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке .env файла:', error)
    throw error
  }
}

// Загружаем переменные окружения
loadEnv()

// Проверяем наличие DATABASE_URL перед созданием Prisma Client
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не установлен!')
  process.exit(1)
}
// Запрет локальной БД: только Neon
assertNeonDatabaseUrl()

// Создаем Prisma Client после загрузки переменных окружения
const prisma = new PrismaClient()

// Маппинг категорий на изображения (используем JPG файлы с армянскими названиями)
const categories = [
  {
    name: 'Օրորոցներ',
    image: '/images/Օրորոցներ.JPG',
    sortOrder: 1,
    showInMainPage: true,
    description: 'Բարձրորակ օրորոցներ ձեր փոքրիկի համար'
  },
  {
    name: 'Պահարաններ',
    image: '/images/Պահարաններ.JPG',
    sortOrder: 2,
    showInMainPage: true,
    description: 'Պահարաններ մանկական սենյակի համար'
  },
  {
    name: 'Օրթոպեդ ներքնակներ',
    image: '/images/Օրթոպեդ ներքնակներ.JPG',
    sortOrder: 3,
    showInMainPage: true,
    description: 'Օրթոպեդիկ ներքնակներ առողջ քնի համար'
  },
  {
    name: 'Անկողնային պարագաներ',
    image: '/images/Անկողնային պարագաներ.JPG',
    sortOrder: 4,
    showInMainPage: true,
    description: 'Անկողնային պարագաներ և աքսեսուարներ'
  },
  {
    name: 'Հավաքածուներ',
    image: '/images/Հավաքածուներ.JPG',
    sortOrder: 5,
    showInMainPage: true,
    description: 'Հավաքածուներ նորածինների համար'
  },
  {
    name: 'Երաժշտական խաղալիքներ',
    image: '/images/Երաժշտական խաղալիքներ.JPG',
    sortOrder: 6,
    showInMainPage: true,
    description: 'Երաժշտական խաղալիքներ զարգացման համար'
  },
  {
    name: 'Մանկասայլակի հավաքածուներ',
    image: '/images/Մանկասայլակի հավաքածուներ.JPG',
    sortOrder: 7,
    showInMainPage: true,
    description: 'Մանկասայլակի հավաքածուներ և աքսեսուարներ'
  },
  {
    name: 'Սենյակի դեկորներ',
    image: '/images/Սենյակի դեկորներ.JPG',
    sortOrder: 8,
    showInMainPage: true,
    description: 'Դեկորատիվ իրեր մանկական սենյակի համար'
  },
  {
    name: 'Գործած զամբյուղներ',
    image: '/images/Գործած զամբյուղներ.JPG',
    sortOrder: 9,
    showInMainPage: true,
    description: 'Գործած զամբյուղներ և պահեստային իրեր'
  },
  {
    name: 'Լոգանքի պարագաներ',
    image: '/images/Լոգանքի պարագաներ.JPG',
    sortOrder: 10,
    showInMainPage: true,
    description: 'Լոգանքի պարագաներ և աքսեսուարներ'
  },
  {
    name: 'Գործած ադիալներ',
    image: '/images/Գործած ադիալներ.JPG',
    sortOrder: 11,
    showInMainPage: true,
    description: 'Գործած ադիալներ և պարագաներ'
  },
  {
    name: 'Կերակրման բարձեր',
    image: '/images/Կերակրման բարձեր.JPG',
    sortOrder: 12,
    showInMainPage: true,
    description: 'Կերակրման բարձեր և աքսեսուարներ'
  },
  {
    name: 'Քողեր',
    image: '/images/Քողեր.JPG',
    sortOrder: 13,
    showInMainPage: true,
    description: 'Քողեր և վարագույրներ'
  },
  {
    name: 'Հյուսեր',
    image: '/images/Հյուսեր.JPG',
    sortOrder: 14,
    showInMainPage: true,
    description: 'Հյուսեր և գործվածքներ'
  },
  {
    name: 'Դուրս գրման հավաքածուներ',
    image: '/images/Դուրս գրման հավաքածուներ.JPG',
    sortOrder: 15,
    showInMainPage: true,
    description: 'Հավաքածուներ դուրս գրման համար'
  }
]

async function replaceCategories() {
  try {
    console.log('🔄 Начинаю замену категорий...')
    
    // Шаг 1: Получить все существующие категории
    const existingCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })
    
    console.log(`📊 Найдено ${existingCategories.length} существующих категорий`)
    
    // Шаг 2: Проверить, есть ли товары в категориях
    const categoriesWithProducts = existingCategories.filter(cat => cat._count.products > 0)
    if (categoriesWithProducts.length > 0) {
      console.warn(`⚠️  ВНИМАНИЕ: Найдено ${categoriesWithProducts.length} категорий с товарами:`)
      categoriesWithProducts.forEach(cat => {
        console.warn(`   - ${cat.name}: ${cat._count.products} товаров`)
      })
      console.warn('   Товары будут потеряны при удалении категорий!')
      console.warn('   Продолжаю удаление...')
    }
    
    // Шаг 3: Удалить все в правильном порядке (чтобы избежать проблем с внешними ключами)
    console.log('🗑️  Удаляю все данные в правильном порядке...')
    
    // Сначала удаляем OrderItem (связаны с Product)
    console.log('   → Удаляю OrderItem...')
    const deleteOrderItemsResult = await prisma.orderItem.deleteMany({})
    console.log(`   ✓ Удалено ${deleteOrderItemsResult.count} элементов заказов`)
    
    // Затем удаляем Order (связаны с User)
    console.log('   → Удаляю Order...')
    const deleteOrdersResult = await prisma.order.deleteMany({})
    console.log(`   ✓ Удалено ${deleteOrdersResult.count} заказов`)
    
    // Затем удаляем Wishlist (связаны с Product)
    console.log('   → Удаляю Wishlist...')
    const deleteWishlistResult = await prisma.wishlist.deleteMany({})
    console.log(`   ✓ Удалено ${deleteWishlistResult.count} элементов wishlist`)
    
    // Затем удаляем товары
    console.log('   → Удаляю Product...')
    const deleteProductsResult = await prisma.product.deleteMany({})
    console.log(`   ✓ Удалено ${deleteProductsResult.count} товаров`)
    
    // Наконец удаляем категории
    console.log('   → Удаляю Category...')
    const deleteResult = await prisma.category.deleteMany({})
    console.log(`   ✓ Удалено ${deleteResult.count} категорий`)
    
    // Шаг 5: Создать новые категории
    console.log('➕ Создаю новые категории...')
    for (const category of categories) {
      await prisma.category.create({
        data: {
          name: category.name,
          image: category.image,
          description: category.description,
          sortOrder: category.sortOrder,
          showInMainPage: category.showInMainPage,
          isActive: true
        }
      })
      console.log(`   ✓ Создана категория: ${category.name}`)
    }
    
    console.log(`\n✅ Успешно создано ${categories.length} категорий!`)
    console.log('\n📋 Список созданных категорий:')
    categories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.image})`)
    })
    
  } catch (error) {
    console.error('❌ Ошибка при замене категорий:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск скрипта
replaceCategories()
  .then(() => {
    console.log('\n🎉 Скрипт выполнен успешно!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Критическая ошибка:', error)
    process.exit(1)
  })

