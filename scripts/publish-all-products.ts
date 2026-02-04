/**
 * Публикует все товары: устанавливает published=true и isAvailable=true.
 * Товары с published=false или isAvailable=false не отображаются на сайте.
 *
 * Запуск: npx tsx scripts/publish-all-products.ts
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { assertNeonDatabaseUrl } from '../src/lib/db-config'

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
  } catch (error) {
    console.error('❌ Ошибка при загрузке .env:', error)
    throw error
  }
}

loadEnv()
assertNeonDatabaseUrl()

const prisma = new PrismaClient()

async function publishAllProducts() {
  try {
    const result = await prisma.product.updateMany({
      where: {
        OR: [{ published: false }, { isAvailable: false }],
      },
      data: {
        published: true,
        isAvailable: true,
      },
    })

    console.log(`✅ Обработано товаров: ${result.count}`)
    if (result.count === 0) {
      console.log('   Все товары уже опубликованы (published=true, isAvailable=true)')
    } else {
      console.log('   Теперь все товары видны на сайте.')
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

publishAllProducts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
