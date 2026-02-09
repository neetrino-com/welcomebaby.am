# 🔒 АУДИТ БЕЗОПАСНОСТИ ПРОЕКТА

> Проверка на типичные уязвимости Next.js

**Дата проверки:** 2025-02-07  
**Дата исправления:** 2025-02-07  
**Статус:** ✅ Критичные проблемы исправлены

---

## ✅ ЧТО СДЕЛАНО ПРАВИЛЬНО

### 1. ✅ Переменные окружения
- `.env` файлы в `.gitignore` ✅
- `NEXT_PUBLIC_*` используется только для публичных URL ✅
- Секреты не хардкодятся в коде ✅

### 2. ✅ Авторизация на сервере
- API routes проверяют сессию через `getServerSession()` ✅
- Проверка роли ADMIN на сервере ✅
- Middleware для защиты маршрутов ✅

### 3. ✅ Валидация данных
- Базовая валидация в API routes ✅
- Проверка типов и обязательных полей ✅
- Zod установлен (но не используется везде) ⚠️

### 4. ✅ Загрузка файлов
- Проверка типа файла (`image/`) ✅
- Ограничение размера (5MB) ✅
- Уникальные имена файлов ✅

### 5. ✅ XSS защита
- Нет `dangerouslySetInnerHTML` в коде ✅

### 6. ✅ SQL инъекции
- Используется Prisma ORM (параметризованные запросы) ✅

---

## 🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. ❌ **Middleware отключен!**

**Файл:** `src/middleware.ts`

```typescript
// Временно отключаем проверку роли для тестирования
// if (req.nextUrl.pathname.startsWith('/admin')) {
//   if (req.nextauth.token?.role !== 'ADMIN') {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }
// }

// Временно разрешаем доступ ко всем страницам
return true
```

**Проблема:** Любой может зайти в `/admin` и `/profile` без авторизации!

**Решение:**
```typescript
export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/profile')) {
          return !!token
        }
        return true
      },
    },
  }
)
```

---

### 2. ❌ **Секрет NextAuth хардкод в коде**

**Файл:** `src/lib/auth.ts`

```typescript
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'your-secret-key-here-change-in-production'
}
```

**Проблема:** Если в `.env` нет `NEXTAUTH_SECRET`, используется слабый дефолтный ключ.

**Решение:** Убрать fallback, обязать наличие в `.env`:
```typescript
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required in environment variables')
}
```

---

### 3. ❌ **Нет Security Headers в Next.js**

**Файл:** `next.config.ts`

**Проблема:** Отсутствуют критичные заголовки:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Strict-Transport-Security` (HSTS)

**Решение:** Добавить в `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
        },
      ],
    },
    // ... существующие headers для кэша
  ]
}
```

---

### 4. ❌ **Валидация без Zod (ручная проверка)**

**Проблема:** Валидация делается вручную через `if`, а не через Zod схемы.

**Примеры:**
- `src/app/api/admin/products/route.ts` - ручная валидация
- `src/app/api/orders/route.ts` - нет валидации структуры `items`

**Решение:** Использовать Zod для всех входных данных:
```typescript
import { z } from 'zod'

const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  categoryId: z.string().uuid(),
  // ...
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validation = CreateProductSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.errors },
      { status: 400 }
    )
  }
  
  // Используем validation.data
}
```

---

### 5. ❌ **Загрузка файлов: нет проверки содержимого**

**Файл:** `src/app/api/upload/route.ts` и `src/app/api/upload-image/route.ts`

**Проблема:**
- Проверяется только MIME-тип (`file.type`), но его можно подделать
- Нет проверки реального содержимого файла (magic bytes)
- Файлы сохраняются в `public/` - доступны напрямую

**Решение:**
```typescript
import { fileTypeFromBuffer } from 'file-type'

// Проверка magic bytes
const fileType = await fileTypeFromBuffer(buffer)
if (!fileType || !fileType.mime.startsWith('image/')) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
}

// Сохранять вне public/, отдавать через API
const uploadDir = join(process.cwd(), 'uploads') // не public/
```

---

### 6. ❌ **Детальные ошибки в продакшене**

**Файл:** `src/app/api/admin/products/route.ts` и другие

```typescript
return NextResponse.json(
  { 
    error: 'Failed to create product',
    details: error instanceof Error ? error.message : 'Unknown error' // ❌
  },
  { status: 500 }
)
```

**Проблема:** Stack trace и детали ошибок уходят клиенту.

**Решение:**
```typescript
const isDev = process.env.NODE_ENV === 'development'

return NextResponse.json(
  { 
    error: 'Failed to create product',
    ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' })
  },
  { status: 500 }
)
```

---

### 7. ⚠️ **JWT в cookies (NextAuth) - частично OK**

**Статус:** NextAuth использует cookies, но нужно проверить настройки:

**Проблема:** Не видно явной настройки `httpOnly`, `secure`, `sameSite` в `authOptions`.

**Решение:** Добавить в `authOptions`:
```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production', // HTTPS only в проде
    },
  },
},
```

---

### 8. ⚠️ **Нет CSRF защиты**

**Проблема:** Next.js API Routes имеют встроенную CSRF защиту, но нужно убедиться что она работает.

**Решение:** Проверить что:
- Все POST/PUT/DELETE запросы идут через `fetch` с `credentials: 'include'`
- Нет прямых форм с `action="/api/..."` без CSRF токенов

---

### 9. ⚠️ **Логирование чувствительных данных**

**Файл:** `src/app/api/orders/route.ts`

```typescript
console.log('Creating order with data:', { 
  name, 
  phone,  // ⚠️ Персональные данные
  address, // ⚠️ Персональные данные
  // ...
})
```

**Проблема:** Персональные данные в логах.

**Решение:** Логировать только ID и метаданные:
```typescript
console.log('Creating order:', { 
  userId: session?.user?.id,
  itemsCount: items?.length,
  total,
  // НЕ логируем name, phone, address
})
```

---

### 10. ⚠️ **Нет rate limiting**

**Проблема:** API endpoints не защищены от DDoS и брутфорса.

**Решение:** Добавить rate limiting:
```typescript
// Использовать библиотеку типа @upstash/ratelimit или next-rate-limit
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  // ...
}
```

---

## 📋 ЧЕКЛИСТ ИСПРАВЛЕНИЙ

### Критичные (исправлено ✅):
- [x] **Включить middleware** - убрать `return true` ✅
- [x] **Убрать хардкод NEXTAUTH_SECRET** - обязать через env ✅
- [x] **Добавить Security Headers** в `next.config.ts` ✅
- [x] **Исправить детальные ошибки** - скрыть в проде ✅

### Важные (исправлено ✅):
- [x] **Настроить cookies** в NextAuth (httpOnly, secure) ✅
- [x] **Убрать PII из логов** (name, phone, address) ✅
- [x] **Улучшить проверку файлов** - расширения, размер, валидация ✅

### Желательные (улучшения):
- [ ] **Внедрить Zod валидацию** во все API routes (частично - есть базовая валидация)
- [ ] **Добавить magic bytes проверку** для файлов (требует библиотеку file-type)
- [ ] **Добавить rate limiting** на API
- [ ] **Переместить uploads** из `public/`

### Желательные (улучшения):
- [ ] **Добавить rate limiting** на API
- [ ] **Переместить uploads** из `public/`
- [ ] **Добавить мониторинг** безопасности

---

## 🔧 БЫСТРЫЕ ИСПРАВЛЕНИЯ

### 1. Включить middleware (5 минут)

```typescript
// src/middleware.ts
export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/profile')) {
          return !!token
        }
        return true
      },
    },
  }
)
```

### 2. Добавить Security Headers (10 минут)

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
    // ... существующие
  ]
}
```

### 3. Убрать хардкод секрета (2 минуты)

```typescript
// src/lib/auth.ts
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET must be set in environment variables')
}
```

---

## 📊 СТАТИСТИКА

- **Критичных проблем:** 4
- **Важных проблем:** 4
- **Желательных улучшений:** 2
- **Всего найдено:** 10 проблем

---

**Следующий шаг:** Исправить критичные проблемы, затем перейти к важным.

