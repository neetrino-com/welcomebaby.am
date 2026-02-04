import { PrismaClient } from '@prisma/client'
import { assertNeonDatabaseUrl } from '@/lib/db-config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Запрет локальной БД: только Neon (*.neon.tech)
assertNeonDatabaseUrl()

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
