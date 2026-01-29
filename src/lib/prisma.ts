import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Используется только Neon: DATABASE_URL из .env (без локальных или альтернативных БД)
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Set it in .env to your Neon database connection string.')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
