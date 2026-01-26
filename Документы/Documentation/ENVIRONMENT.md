# ОКРУЖЕНИЕ ПРОЕКТА

> ⚠️ **ДЛЯ AI**: Читай это ПЕРЕД любой работой!  
> **НЕ МЕНЯЙ то что уже настроено! НЕ ПЕРЕУСТАНАВЛИВАЙ существующие инструменты!**

---

## 🗂️ ЧТО УЖЕ УСТАНОВЛЕНО (НЕ ТРОГАТЬ!)

### Development (локальная разработка)

#### Runtime:
- ✅ **Node.js**: 18.20.0 (УЖЕ установлен)
- ✅ **npm**: 10.x (УЖЕ установлен)
- ✅ **Docker**: 24.x (УЖЕ установлен)
- ✅ **Docker Compose**: 2.x (УЖЕ установлен)

#### База данных:
- ✅ **PostgreSQL**: 16.1 (УЖЕ установлен и настроен)
  - Host: localhost
  - Port: 5432
  - User: postgres
  - Database: создаётся для каждого проекта

#### Кэш и очереди:
- ✅ **Redis**: 7.2 (УЖЕ установлен)
  - Host: localhost
  - Port: 6379

#### Поиск:
- ✅ **Meilisearch**: 1.6 (будет в Docker контейнере)
  - Port: 7700

---

### Production (VPS сервер)

#### Сервер:
- ✅ **OS**: Ubuntu 22.04 LTS
- ✅ **Docker**: 24.x
- ✅ **Docker Compose**: 2.x
- ✅ **Nginx**: 1.24
- ✅ **Let's Encrypt**: для SSL

#### Services (в Docker контейнерах):
- ✅ **PostgreSQL**: 16
- ✅ **Redis**: 7
- ✅ **Meilisearch**: 1.6

---

## ✅ ЧТО ОБЯЗАТЕЛЬНО ИСПОЛЬЗОВАТЬ

### 1. База данных

```typescript
// ✅ ПРАВИЛЬНО - используй PostgreSQL
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany();
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ создавай SQLite
import SQLite from 'better-sqlite3';
const db = new SQLite('data.db'); // ❌ НЕЛЬЗЯ!
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ используй MongoDB
import { MongoClient } from 'mongodb'; // ❌ НЕЛЬЗЯ!
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ создавай JSON файлы для данных
import fs from 'fs';
fs.writeFileSync('data.json', ...); // ❌ НЕЛЬЗЯ!
```

**Правило:** ВСЕГДА используй PostgreSQL через Prisma ORM.

---

### 2. Кэш

```typescript
// ✅ ПРАВИЛЬНО - используй Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

await redis.set('key', 'value', 'EX', 3600);
const value = await redis.get('key');
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ используй in-memory кэш
const cache = new Map(); // ❌ НЕЛЬЗЯ!
cache.set('key', 'value');
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ используй node-cache
import NodeCache from 'node-cache'; // ❌ НЕЛЬЗЯ!
```

**Правило:** ВСЕГДА используй Redis для кэша.

---

### 3. Очереди (фоновые задачи)

```typescript
// ✅ ПРАВИЛЬНО - используй BullMQ (на базе Redis)
import { Queue } from 'bullmq';

const emailQueue = new Queue('emails', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

await emailQueue.add('send-welcome', { email: 'user@example.com' });
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ используй другие библиотеки
import Bull from 'bull'; // ❌ Используй BullMQ, не Bull
import Agenda from 'agenda'; // ❌ НЕЛЬЗЯ!
```

**Правило:** ВСЕГДА используй BullMQ для очередей.

---

### 4. Поиск

```typescript
// ✅ ПРАВИЛЬНО - используй Meilisearch
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY
});

const results = await client.index('products').search('футболка');
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ используй другие поисковики
import algoliasearch from 'algoliasearch'; // ❌ НЕЛЬЗЯ!
import { Client as ElasticClient } from '@elastic/elasticsearch'; // ❌ НЕЛЬЗЯ!
```

**Правило:** ВСЕГДА используй Meilisearch для поиска.

---

### 5. ORM

```typescript
// ✅ ПРАВИЛЬНО - используй Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const product = await prisma.product.create({
  data: { title: 'Product' }
});
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ используй другие ORM
import { TypeORM } from 'typeorm'; // ❌ НЕЛЬЗЯ!
import Sequelize from 'sequelize'; // ❌ НЕЛЬЗЯ!
import Knex from 'knex'; // ❌ НЕЛЬЗЯ!
```

**Правило:** ВСЕГДА используй Prisma ORM.

---

### 6. HTTP клиент

```typescript
// ✅ ПРАВИЛЬНО - используй native fetch
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ добавляй axios
import axios from 'axios'; // ❌ НЕЛЬЗЯ! Используй fetch
```

**Правило:** ВСЕГДА используй native fetch (Node.js 18+ имеет встроенный fetch).

---

### 7. Даты

```typescript
// ✅ ПРАВИЛЬНО - используй date-fns
import { format, addDays } from 'date-fns';

const formatted = format(new Date(), 'yyyy-MM-dd');
const tomorrow = addDays(new Date(), 1);
```

```typescript
// ❌ НЕПРАВИЛЬНО - НЕ используй moment.js или dayjs
import moment from 'moment'; // ❌ НЕЛЬЗЯ! (deprecated, большой размер)
import dayjs from 'dayjs'; // ❌ НЕЛЬЗЯ!
```

**Правило:** ВСЕГДА используй date-fns для работы с датами.

---

## 🚫 ЧТО ЗАПРЕЩЕНО ДЕЛАТЬ

### 1. Не менять базу данных

```bash
# ❌ НЕ ДЕЛАЙ:
npm install sqlite3
npm install mongodb
npm install mysql2

# ✅ ИСПОЛЬЗУЙ:
# PostgreSQL уже установлен, используй через Prisma
```

---

### 2. Не переустанавливать инструменты

```bash
# ❌ НЕ ДЕЛАЙ:
brew install node        # Node уже установлен
brew install postgresql  # PostgreSQL уже установлен
brew install redis       # Redis уже установлен

# ✅ ПРОВЕРЯЙ:
node -v                  # проверь версию
postgres --version       # проверь что установлен
redis-cli --version      # проверь что установлен
```

---

### 3. Не создавать локальные файлы для данных

```typescript
// ❌ НЕ ДЕЛАЙ:
import fs from 'fs';

// Сохранение данных в файл
fs.writeFileSync('data.json', JSON.stringify(products));

// Чтение из файла
const products = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// ✅ ДЕЛАЙ:
// Храни всё в PostgreSQL через Prisma
const products = await prisma.product.findMany();
```

---

### 4. Не менять мажорные версии без согласования

```bash
# ❌ НЕ ДЕЛАЙ:
npm install react@19      # если сейчас react@18
npm install next@15       # если сейчас next@14

# ✅ СПРОСИ:
# "Можно обновить React с 18 на 19?"
# Подожди подтверждения разработчика
```

---

### 5. Не использовать альтернативные технологии

```bash
# ❌ НЕ ДОБАВЛЯЙ без необходимости:
npm install axios         # используй fetch
npm install moment        # используй date-fns
npm install lodash        # используй нативные методы
npm install jquery        # вообще не нужен
```

---

## 📋 CHECKLIST ПЕРЕД РАБОТОЙ

### Перед началом любой задачи проверь:

- [ ] Прочитал `.env.example` — какие сервисы нужны?
- [ ] Проверил `package.json` — какие пакеты УЖЕ установлены?
- [ ] Проверил `docker-compose.yml` — какие контейнеры есть?
- [ ] PostgreSQL доступен? (проверь DATABASE_URL в .env)
- [ ] Redis доступен? (проверь REDIS_URL в .env)
- [ ] Не планируешь добавлять новые зависимости без причины?
- [ ] Используешь существующую инфраструктуру?

---

## 🔧 ЕСЛИ НУЖНО ДОБАВИТЬ НОВЫЙ ИНСТРУМЕНТ

**СТОП! Сначала проверь:**

1. ✅ **Есть ли уже похожий инструмент?**
   - Для HTTP запросов → есть fetch
   - Для дат → есть date-fns
   - Для валидации → есть class-validator
   
2. ✅ **Действительно ли он нужен?**
   - Может можно решить нативными методами?
   - Может уже есть встроенный функционал?

3. ✅ **Согласуй с разработчиком**
   - Объясни почему нужен
   - Покажи альтернативы
   - Получи подтверждение

4. ✅ **После установки:**
   - Добавь в ENVIRONMENT.md
   - Добавь в `.env.example` (если нужны переменные)
   - Обнови `package.json`

---

## 📊 ВЕРСИИ ИНСТРУМЕНТОВ (актуальные)

### Runtime:
| Инструмент | Версия | Команда проверки |
|-----------|--------|------------------|
| Node.js | 18.20.0 | `node -v` |
| npm | 10.x | `npm -v` |
| TypeScript | ^5.3.0 | `tsc -v` |

### Database:
| Инструмент | Версия | Команда проверки |
|-----------|--------|------------------|
| PostgreSQL | 16.1 | `psql --version` |
| Prisma | ^5.8.0 | `npx prisma -v` |

### Cache & Queues:
| Инструмент | Версия | Команда проверки |
|-----------|--------|------------------|
| Redis | 7.2 | `redis-cli --version` |
| BullMQ | ^5.0.0 | проверь `package.json` |

### Search:
| Инструмент | Версия | Команда проверки |
|-----------|--------|------------------|
| Meilisearch | 1.6 | `curl localhost:7700/version` |

### Frontend:
| Инструмент | Версия | Команда проверки |
|-----------|--------|------------------|
| Next.js | ^15.0.0 | проверь `package.json` |
| React | ^18.3.0 | проверь `package.json` |
| Tailwind CSS | ^3.4.0 | проверь `package.json` |

### Backend:
| Инструмент | Версия | Команда проверки |
|-----------|--------|------------------|
| NestJS | ^10.3.0 | проверь `package.json` |
| class-validator | ^0.14.0 | проверь `package.json` |

---

## 🚀 КАК ПРОВЕРИТЬ ОКРУЖЕНИЕ

### Локально (development):

```bash
# Проверка Node.js
node -v
# Должно быть: v18.20.0 или выше

# Проверка PostgreSQL
psql --version
# Должно быть: psql (PostgreSQL) 16.x

# Проверка Redis
redis-cli ping
# Должно быть: PONG

# Проверка Docker
docker --version
docker compose version
```

### На сервере (production):

```bash
# SSH на сервер
ssh hetzner

# Проверка контейнеров
docker ps
# Должны быть запущены: web, api, postgres, redis, meilisearch

# Проверка БД
docker exec shop-postgres psql -U postgres -c 'SELECT version();'

# Проверка Redis
docker exec shop-redis redis-cli ping
```

---

## 🎯 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

### Обязательные переменные (всегда нужны):

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Redis (кэш и очереди)
REDIS_URL="redis://localhost:6379"

# Meilisearch (поиск)
MEILI_HOST="http://localhost:7700"
MEILI_MASTER_KEY="your-master-key"

# App
NODE_ENV="development" # или "production"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Для платежей (Idram, ArCa):

```bash
# Idram
IDRAM_MERCHANT_ID="your-merchant-id"
IDRAM_SECRET_KEY="your-secret-key"
IDRAM_PUBLIC_KEY="your-public-key"

# ArCa
ARCA_MERCHANT_ID="your-merchant-id"
ARCA_API_KEY="your-api-key"
```

### Для email/SMS:

```bash
# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@shop.am"
SMTP_PASSWORD="your-password"

# SMS (опционально)
SMS_PROVIDER="twilio"
SMS_API_KEY="your-api-key"
```

### Для безопасности:

```bash
# JWT
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_EXPIRES_IN="7d"

# NextAuth (если используется)
NEXTAUTH_URL="https://shop.am"
NEXTAUTH_SECRET="your-nextauth-secret"
```

---

## 🚨 ТИПИЧНЫЕ ОШИБКИ AI

### ❌ Ошибка 1: "Не могу подключиться к PostgreSQL, создам SQLite"

**Что делает AI:**
```typescript
// ❌ НЕПРАВИЛЬНО
import SQLite from 'better-sqlite3';
const db = new SQLite('shop.db');
```

**Что НУЖНО делать:**
```typescript
// ✅ ПРАВИЛЬНО
// 1. Проверь .env файл
console.log(process.env.DATABASE_URL);

// 2. Убедись что PostgreSQL запущен
// docker ps | grep postgres

// 3. Используй Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

---

### ❌ Ошибка 2: "Node.js не найден, установлю заново"

**Что делает AI:**
```bash
# ❌ НЕПРАВИЛЬНО
brew install node
```

**Что НУЖНО делать:**
```bash
# ✅ ПРАВИЛЬНО
# 1. Проверь версию
node -v

# 2. Проверь PATH
echo $PATH

# 3. Если действительно нет - СПРОСИ разработчика
```

---

### ❌ Ошибка 3: "Использую in-memory кэш для скорости"

**Что делает AI:**
```typescript
// ❌ НЕПРАВИЛЬНО
const cache = new Map<string, any>();

export function getCachedProducts() {
  if (cache.has('products')) {
    return cache.get('products');
  }
  // ...
}
```

**Что НУЖНО делать:**
```typescript
// ✅ ПРАВИЛЬНО
import { redis } from '@/lib/redis';

export async function getCachedProducts() {
  const cached = await redis.get('products');
  if (cached) {
    return JSON.parse(cached);
  }
  // ...
}
```

---

### ❌ Ошибка 4: "Обновлю Next.js до 15 версии"

**Что делает AI:**
```bash
# ❌ НЕПРАВИЛЬНО (без согласования)
npm install next@15
```

**Что НУЖНО делать:**
```bash
# ✅ ПРАВИЛЬНО
# 1. Проверь текущую версию
npm list next

# 2. Если нужно обновление - СПРОСИ
"Текущая версия Next.js 14.2.1. Обновить до 15.0.0?"

# 3. Жди подтверждения разработчика
```

---

### ❌ Ошибка 5: "Создам JSON файл для хранения настроек"

**Что делает AI:**
```typescript
// ❌ НЕПРАВИЛЬНО
import fs from 'fs';

function saveSettings(settings) {
  fs.writeFileSync('settings.json', JSON.stringify(settings));
}
```

**Что НУЖНО делать:**
```typescript
// ✅ ПРАВИЛЬНО
// Настройки хранятся:
// 1. Статичные → config/*.json (бренд, доставка)
// 2. Динамичные → PostgreSQL (пользовательские)

// Для пользовательских настроек:
await prisma.setting.upsert({
  where: { key: 'siteName' },
  update: { value: 'MyShop' },
  create: { key: 'siteName', value: 'MyShop' }
});
```

---

## ✅ CHECKLIST БЕЗОПАСНОСТИ ОКРУЖЕНИЯ

Перед началом работы над ЛЮБОЙ задачей:

### Проверь что используешь правильные инструменты:
- [ ] База данных = PostgreSQL (не SQLite/MongoDB/MySQL)
- [ ] ORM = Prisma (не TypeORM/Sequelize/Knex)
- [ ] Кэш = Redis (не in-memory Map/Set)
- [ ] Очереди = BullMQ на Redis (не другие библиотеки)
- [ ] Поиск = Meilisearch (не Algolia/Elasticsearch)
- [ ] HTTP = fetch (не axios)
- [ ] Даты = date-fns (не moment/dayjs)

### Проверь что НЕ переустанавливаешь:
- [ ] Node.js УЖЕ установлен (не устанавливай заново)
- [ ] PostgreSQL УЖЕ установлен (не устанавливай заново)
- [ ] Redis УЖЕ установлен (не устанавливай заново)
- [ ] Docker УЖЕ установлен (не устанавливай заново)

### Проверь что НЕ создаёшь локальные хранилища:
- [ ] Не создаёшь .db файлы (SQLite)
- [ ] Не создаёшь .json файлы для данных
- [ ] Не используешь Map/Set для кэша
- [ ] Всё хранится в PostgreSQL или Redis

---

## 💾 ПОДКЛЮЧЕНИЕ К СЕРВИСАМ

### PostgreSQL:

```typescript
// apps/api/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});
```

### Redis:

```typescript
// apps/api/src/lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});
```

### Meilisearch:

```typescript
// apps/api/src/lib/meilisearch.ts
import { MeiliSearch } from 'meilisearch';

export const searchClient = new MeiliSearch({
  host: process.env.MEILI_HOST!,
  apiKey: process.env.MEILI_MASTER_KEY
});
```

---

## 🎯 ИТОГО

### ДО начала работы:
1. ✅ Прочитал этот файл (ENVIRONMENT.md)
2. ✅ Понял что уже установлено
3. ✅ Понял что запрещено делать
4. ✅ Готов использовать правильные инструменты

### ВО ВРЕМЯ работы:
1. ✅ Использую PostgreSQL через Prisma
2. ✅ Использую Redis для кэша
3. ✅ НЕ создаю SQLite/JSON файлы
4. ✅ НЕ переустанавливаю инструменты
5. ✅ НЕ меняю версии без согласования

### ПОСЛЕ работы:
1. ✅ Всё подключено к правильным сервисам
2. ✅ Нет локальных файлов для данных
3. ✅ Нет альтернативных технологий
4. ✅ Проект работает с существующей инфраструктурой

---

**Последнее обновление:** 2025-02-07  
**Версия:** 1.0  
**Обновлять:** При изменении инфраструктуры или добавлении инструментов
