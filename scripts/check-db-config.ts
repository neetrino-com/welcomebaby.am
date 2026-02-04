/**
 * Проверка конфигурации БД перед выполнением Prisma CLI.
 * Запрещает локальную БД — допустим только Neon (*.neon.tech).
 *
 * Использование: tsx scripts/check-db-config.ts
 * Выход: 0 — OK, 1 — ошибка (локальная БД или неверный DATABASE_URL)
 */

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
  } catch {
    // .env может отсутствовать — assertNeonDatabaseUrl выбросит, если DATABASE_URL нет
  }
}

loadEnv()
assertNeonDatabaseUrl()
process.exit(0)
