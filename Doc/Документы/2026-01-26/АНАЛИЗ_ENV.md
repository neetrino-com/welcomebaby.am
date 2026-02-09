# АНАЛИЗ .ENV ФАЙЛА ДЛЯ VERCEL

**Дата:** 2026-01-26

---

## 📋 ТЕКУЩИЙ .ENV

```env
NODE_ENV=development
DATABASE_URL="postgresql://..."
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-please-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PORT=3000
```

---

## ❌ ЧТО ЛИШНЕЕ ДЛЯ VERCEL

### 1. PORT=3000
**Причина:** Vercel автоматически определяет порт  
**Действие:** Удалить из .env для Vercel

### 2. NEXT_PUBLIC_API_URL
**Причина:** Не используется в коде (используется относительный путь `/api`)  
**Действие:** Удалить из .env для Vercel

### 3. NEXT_PUBLIC_SITE_URL
**Причина:** Не используется, Vercel автоматически определяет  
**Действие:** Удалить из .env для Vercel

---

## ✅ ЧТО НУЖНО ДЛЯ VERCEL

### 1. DATABASE_URL ✅
**Статус:** Уже настроен (Neon PostgreSQL)  
**Действие:** Оставить как есть

### 2. NEXTAUTH_URL ⚠️
**Текущее:** `http://localhost:3000`  
**Нужно:** `https://your-project.vercel.app`  
**Действие:** Изменить после первого деплоя

### 3. NEXTAUTH_SECRET ⚠️
**Текущее:** `dev-secret-key-please-change-in-production`  
**Нужно:** Сложный секрет (минимум 32 символа)  
**Сгенерирован:** `sl/VCG8KdAKTsCtG7eyozpCtM+g4zcPrPQeGyv9PU64=`  
**Действие:** Использовать сгенерированный секрет

### 4. BLOB_READ_WRITE_TOKEN ✨
**Статус:** Нужно добавить  
**Действие:** Получить из Vercel Blob Store

---

## 📝 ФИНАЛЬНЫЙ .ENV ДЛЯ VERCEL

```env
# Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://neondb_owner:npg_79qxjgetEKAG@ep-divine-lab-ag5dnvod-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=sl/VCG8KdAKTsCtG7eyozpCtM+g4zcPrPQeGyv9PU64=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

---

## 📝 .ENV ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ

```env
# Environment
NODE_ENV=development

# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-please-change-in-production

# Blob не нужен для локальной разработки
# (но можно добавить для тестирования)
```

---

## ✅ ИТОГО

**Удалить для Vercel:**
- ❌ PORT
- ❌ NEXT_PUBLIC_API_URL
- ❌ NEXT_PUBLIC_SITE_URL

**Изменить для Vercel:**
- ⚠️ NEXTAUTH_URL → production URL
- ⚠️ NEXTAUTH_SECRET → сложный секрет

**Добавить для Vercel:**
- ✨ BLOB_READ_WRITE_TOKEN

**Оставить:**
- ✅ DATABASE_URL
- ✅ NODE_ENV (production)

---

**Готово!** ✅
