import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/** Логируем маскированные host/db из DATABASE_URL (Neon) — без паролей и секретов */
function getDbInfoForLog(): string {
  const url = process.env.DATABASE_URL
  if (!url) return 'DATABASE_URL not set'
  try {
    const u = new URL(url.replace(/^postgresql:/, 'https:'))
    const host = u.hostname || 'unknown'
    const db = (u.pathname || '').replace(/^\//, '') || 'unknown'
    return `host=${host} db=${db} (Neon from DATABASE_URL)`
  } catch {
    return 'DATABASE_URL present (parse skipped)'
  }
}

// Проверяем обязательные переменные окружения
if (!process.env.NEXTAUTH_URL) {
  if (process.env.NODE_ENV === 'development') {
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
  } else {
    throw new Error('NEXTAUTH_URL must be set in environment variables for production')
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET must be set in environment variables. Generate with: openssl rand -base64 32')
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const dbInfo = getDbInfoForLog()
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[Auth] Login attempt missing email or password')
            return null
          }

          // Только Neon: запрос к users в БД из DATABASE_URL. Нет моков, тестовых и локальных учётных данных.
          console.log('[Auth] Querying Neon DB for user:', dbInfo)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user || !user.password) {
            console.log('[Auth] User not found in Neon DB, login rejected (401)')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            console.log('[Auth] User found in Neon DB but password invalid, login rejected (401)')
            return null
          }

          console.log('[Auth] User authenticated successfully (Neon DB)')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('[Auth] DB connection error (Neon):', dbInfo, error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    updateAge: 24 * 60 * 60, // 24 часа
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only в проде
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)
