# Профессиональный интернет‑магазин — Техническое задание (v0.9)

## 0) Введение и идея

**Цель:** создать один полноценный, независимый интернет‑магазин «уровня продакшн», без конструкторов и мульти‑тенанта. Проект служит эталонной базой, которую можно копировать для новых клиентов и адаптировать до 300% по функционалу, не переписывая фундамент.

**Почему так:**

- 95% функций e‑commerce типовые. Мы реализуем их один раз профессионально и безопасно.
- База проектируется нейтрально к нише (одежда/еда/косметика), чтобы не ломать схему при переносе.
- Конфигурируемые точки там, где отличия повторяются (тема, языки, валюта, платежи, доставка), всё остальное — в коде.

**Результат:** магазин с каталогом → поиском → корзиной → checkout → оплатой → заказами → админкой, с нормами безопасности и производительности.

---

## 1) Область работ (Scope MVP)

Входит:

- **Каталог**: категории, бренды, атрибуты, вариативность (опции свободной формы), фото/галерея.
- **Поиск и фильтрация**: полнотекст (Meilisearch), фасеты, синонимы/опечатки.
- **Корзина**: гостевая и авторизованная, сохранение, «брошенные корзины» (e‑mail).
- **Checkout**: one‑page, минимальные поля, валидации, согласия.
- **Оплата**: Idram, ArCa (3‑DS), идемпотентность операций, вебхуки.
- **Доставка**: самовывоз, курьер по городу, фикс по стране; геозоны, free‑shipping.
- **ЛК**: профиль, адреса, история заказов, повтор заказа.
- **OMS**: статусы, комментарии менеджера, e‑mail/SMS уведомления, документы.
- **Контент/SEO**: блог/новости, OG, Schema.org, hreflang, sitemap, robots.
- **Админка**: CRUD товаров/категорий/атрибутов, массовые операции, импорт CSV/XLSX, заказы, купоны.

Отложено (после v1.0): рефералка, B2B‑прайсы, маркетплейс‑фиды, мульти‑склад, RMA‑кабинет, экспорт ярлыков курьеров.

---

## 2) Нефункциональные требования (SLA/SLO/качество)

- **SLA доступности**: 99.9%/мес (≈ 43 мин простоя допустимо).
- **SLO скорости**:
  - TTFB p95: ≤ 300 мс из кэша CDN, ≤ 600 мс без кэша.
  - LCP p75 ≤ 2.5 c, INP p75 ≤ 200 мс, CLS p75 ≤ 0.1.
  - API чтение p95 ≤ 500 мс; запись p95 ≤ 800 мс (checkout/оплата).
  - Поиск p95 ≤ 250 мс на 10k SKU.
- **Надежность**: 5xx ≤ 0.1%/неделя.
- **Доступность данных**: RPO ≤ 24 ч, RTO ≤ 1 ч.
- **Соответствие**: базовый OWASP ASVS L1/L2, защита персональных данных, минимизация PII в логах.

---

## 3) Архитектура и стек

**Стиль:** TypeScript «микро‑монолит» с четкими модулями.

**Фронтенд**: Next.js 15 (App Router, SSR/ISR, i18n, WCAG 2.2 AA).\
**Бэкенд**: NestJS (REST + вебхуки), RBAC, class‑validator, DTO.\
**БД**: PostgreSQL 16 (Prisma или Drizzle для миграций/ORM).\
**Кэш/очереди**: Redis 7 + BullMQ (email, индексация, webhooks, отчёты).\
**Поиск**: Meilisearch 1.x (асинхронная индексация).\
**Хранилище медиа**: S3‑совместимое (Cloudflare R2/Wasabi), через CDN.\
**I18n**: RU/AM/EN, локализованные URL/hreflang.

**Почему этот стек:** единый язык (TS), быстрый dev‑цикл, зрелые тулзы, достаточно для 1–10k SKU и до 10k заказов/мес без «микросервисного ада». Альтернатива: Laravel 11 + Blade/Livewire — возможна, но базовый выбор TS.

**Структура репозитория (монорепо)**

```
apps/
  web/        # витрина (Next.js)
  api/        # NestJS API/webhooks
packages/
  domain/     # бизнес‑модель, правила, use‑cases (чистая архитектура)
  ui/         # компоненты, дизайн‑система, токены
  adapters/   # платежи, доставка, поиск (интерфейсы + реализации)
config/
  brand.config.json   # тема: цвета/шрифты/радиусы
  app.config.json     # языки, валюта, налоги, форматы адресов
  payments.config.json# провайдеры; секреты только в .env
  shipping.config.json# геозоны, тарифы, free‑shipping
  features.json       # включалка модулей (coupons/blog/wishlist)
scripts/              # seed, index‑rebuild, deploy, backup‑check
```

### 3.1 Примеры конфигурационных файлов

**Зачем:** при клонировании проекта под нового клиента нужно изменить только конфиги, не трогая код.

#### `config/brand.config.json` — визуальная идентичность

```json
{
  "name": "MyShop",
  "domain": "myshop.am",
  "logo": {
    "light": "/assets/brand/logo-light.svg",
    "dark": "/assets/brand/logo-dark.svg",
    "favicon": "/assets/brand/favicon.ico"
  },
  "colors": {
    "primary": "#FF6B35",
    "secondary": "#004E89",
    "accent": "#F77F00",
    "success": "#06A77D",
    "warning": "#FFB627",
    "error": "#D62828",
    "text": {
      "primary": "#1A202C",
      "secondary": "#718096",
      "inverse": "#FFFFFF"
    },
    "background": {
      "primary": "#FFFFFF",
      "secondary": "#F7FAFC",
      "tertiary": "#EDF2F7"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": ["Inter", "system-ui", "sans-serif"],
      "heading": ["Montserrat", "sans-serif"]
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "full": "9999px"
  },
  "social": {
    "facebook": "https://facebook.com/myshop",
    "instagram": "https://instagram.com/myshop",
    "telegram": "https://t.me/myshop"
  }
}
```

#### `config/app.config.json` — локализация, валюта, бизнес-правила

```json
{
  "defaultLocale": "ru",
  "locales": [
    {
      "code": "ru",
      "name": "Русский",
      "flag": "🇷🇺",
      "enabled": true,
      "default": true
    },
    {
      "code": "am",
      "name": "Հայերեն",
      "flag": "🇦🇲",
      "enabled": true
    },
    {
      "code": "en",
      "name": "English",
      "flag": "🇬🇧",
      "enabled": true
    }
  ],
  "currency": {
    "code": "AMD",
    "symbol": "֏",
    "symbolPosition": "after",
    "decimalPlaces": 0,
    "thousandsSeparator": " ",
    "decimalSeparator": "."
  },
  "timezone": "Asia/Yerevan",
  "dateFormat": {
    "short": "DD.MM.YYYY",
    "long": "DD MMMM YYYY",
    "time": "HH:mm"
  },
  "contact": {
    "phone": "+374 XX XXX XXX",
    "email": "info@myshop.am",
    "address": {
      "ru": "г. Ереван, ул. Абовяна 10",
      "am": "Երևան, Աբովյան 10",
      "en": "Yerevan, Abovyan 10"
    }
  },
  "tax": {
    "enabled": true,
    "rate": 20,
    "included": true,
    "displayInPrices": true
  },
  "orderNumberFormat": "YYMMDDxxxxx",
  "reservationTTL": 900,
  "cartExpirationDays": 30,
  "abandonedCartThresholdHours": 2,
  "minOrderAmount": 1000,
  "freeShippingThreshold": 50000
}
```

#### `config/payments.config.json` — платёжные провайдеры

```json
{
  "defaultProvider": "idram",
  "providers": [
    {
      "id": "idram",
      "name": "Idram",
      "enabled": true,
      "methods": ["wallet", "card"],
      "currencies": ["AMD", "USD"],
      "logo": "/assets/payments/idram.svg",
      "testMode": false,
      "webhookUrl": "/api/v1/payments/webhook/idram",
      "config": {
        "merchantId": "${IDRAM_MERCHANT_ID}",
        "secretKey": "${IDRAM_SECRET_KEY}",
        "publicKey": "${IDRAM_PUBLIC_KEY}",
        "apiUrl": "https://banking.idram.am/api/v1"
      }
    },
    {
      "id": "arca",
      "name": "ArCa",
      "enabled": true,
      "methods": ["card"],
      "currencies": ["AMD"],
      "logo": "/assets/payments/arca.svg",
      "supports3DS": true,
      "testMode": false,
      "webhookUrl": "/api/v1/payments/webhook/arca",
      "config": {
        "merchantId": "${ARCA_MERCHANT_ID}",
        "apiKey": "${ARCA_API_KEY}",
        "apiUrl": "https://ipay.arca.am/payment/rest"
      }
    }
  ],
  "retryPolicy": {
    "maxAttempts": 3,
    "backoffMs": 1000
  },
  "webhookSignatureAlgo": "hmac-sha256"
}
```

#### `config/shipping.config.json` — методы доставки и геозоны

```json
{
  "defaultMethod": "courier_yerevan",
  "methods": [
    {
      "id": "pickup",
      "name": {
        "ru": "Самовывоз",
        "am": "Ինքնուրույն", 
        "en": "Pickup"
      },
      "enabled": true,
      "price": 0,
      "estimatedDays": 0,
      "icon": "store",
      "locations": [
        {
          "name": { "ru": "Главный офис", "am": "Գլխավոր գրասենյակ", "en": "Main Office" },
          "address": "Yerevan, Abovyan 10",
          "coords": { "lat": 40.1776, "lng": 44.5126 },
          "workingHours": { "ru": "Пн-Пт 10:00-19:00", "am": "Երկ-Ուրբ 10:00-19:00", "en": "Mon-Fri 10:00-19:00" }
        }
      ]
    },
    {
      "id": "courier_yerevan",
      "name": {
        "ru": "Курьер по Еревану",
        "am": "Առաքիչ Երևանում",
        "en": "Courier in Yerevan"
      },
      "enabled": true,
      "price": 1000,
      "freeAbove": 50000,
      "estimatedDays": 1,
      "icon": "truck",
      "zones": [
        {
          "name": "Yerevan Center",
          "postalCodes": ["0001", "0002", "0009"],
          "price": 1000
        },
        {
          "name": "Yerevan Outskirts",
          "postalCodes": ["0070", "0080"],
          "price": 1500
        }
      ]
    },
    {
      "id": "armenia_regions",
      "name": {
        "ru": "Доставка по Армении",
        "am": "Առաքում Հայաստանում",
        "en": "Armenia regions"
      },
      "enabled": true,
      "price": 3000,
      "freeAbove": null,
      "estimatedDays": 3,
      "icon": "map",
      "excludedRegions": []
    }
  ]
}
```

#### `config/features.json` — включалка модулей

```json
{
  "catalog": {
    "reviews": false,
    "wishlist": true,
    "compare": false,
    "recentlyViewed": true,
    "relatedProducts": true
  },
  "checkout": {
    "guestCheckout": true,
    "quickCheckout": true,
    "savePaymentMethods": false,
    "giftMessages": false
  },
  "marketing": {
    "coupons": true,
    "loyaltyProgram": false,
    "referralProgram": false,
    "abandonedCartEmails": true
  },
  "content": {
    "blog": true,
    "staticPages": true,
    "faq": true
  },
  "analytics": {
    "ga4": true,
    "facebookPixel": false,
    "tiktokPixel": false
  },
  "integrations": {
    "crm": null,
    "accounting": null,
    "delivery": null
  }
}
```

**Переменные окружения (`.env.example`):**

```bash
# App
NODE_ENV=production
APP_URL=https://myshop.am
API_URL=https://api.myshop.am

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myshop

# Redis
REDIS_URL=redis://localhost:6379

# Meilisearch
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=your-master-key

# S3 (Media Storage)
S3_ENDPOINT=https://your-bucket.r2.cloudflarestorage.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=myshop-media
S3_PUBLIC_URL=https://cdn.myshop.am

# Payments (секреты из config/payments.config.json)
IDRAM_MERCHANT_ID=12345
IDRAM_SECRET_KEY=secret
ARCA_MERCHANT_ID=67890
ARCA_API_KEY=api-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@myshop.am
SMTP_PASSWORD=password

# SMS
SMS_PROVIDER=twilio
SMS_API_KEY=your-api-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Monitoring
SENTRY_DSN=https://sentry.io/your-dsn
```

**Как использовать в коде:**

```typescript
// apps/api/src/config/brand.config.ts
import brandConfig from '@workspace/config/brand.config.json';

@Injectable()
export class BrandConfigService {
  getColors() {
    return brandConfig.colors;
  }
  
  getLogo(theme: 'light' | 'dark') {
    return brandConfig.logo[theme];
  }
}

// apps/web/src/lib/theme.ts
import { brandConfig } from '@/config';

export const theme = createTheme({
  colors: {
    primary: brandConfig.colors.primary,
    ...
  }
});
```

---

## 4) Доменная модель (ядро)

**Сущности**

- `Product(id, slug, title, description, brandId, media[], attrs[], published)`
- `Variant(id, productId, sku, options[], price, compareAt, stock, barcode)`
- `Category(id, parentId, slug, title, meta)`
- `Attribute(id, key, type, localized)` / `AttributeValue(id, attributeId, value)`
- `Cart(id, userId?, items[], totals, coupon?)`
- `Order(id, number, userId?, items[], totals, status, payments[], shipments[], audit)`
- `User(id, email/phone, passwordHash?, roles[], addresses[])`
- `Coupon(id, code, rules, usageLimits, validFrom/To)`

**Принципы**

- Варианты — через **свободный набор опций** (размер/цвет/вкус/объем), без жёстких полей «только одежда».
- Везде audit‑поля, soft‑delete где оправдано.
- Цены/скидки/налоги считаются централизованно на бэке.

**DDL (набросок индексов)**

- FK и уникальные индексы обязательны.
- `products.slug` UNIQUE, `variants.sku` UNIQUE.
- Индексы на `orders(userId, createdAt)`; `variants(productId)`; GIN/Trigram для поиска по названию/артикулам.
- Partial index для soft‑delete: `WHERE deleted_at IS NULL`.

### 4.1 Локализация данных: стратегия хранения переводов

**Задача:** RU/AM/EN для товаров/категорий/атрибутов/брендов, SEO‑слуги и тексты — без дублирования базовой записи.

**Подход:** нормализованные таблицы переводов c уникальными ключами по `(entity_id, locale)` и локализованными слагами.

**Схема (пример):**

```sql
-- товары
CREATE TABLE product_translations (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,          -- 'ru', 'am', 'en'
  title TEXT NOT NULL,
  subtitle TEXT,
  description_html TEXT,               -- санитизированный HTML/PortableText JSON
  slug TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,      -- title/description/og
  CONSTRAINT uq_product_locale UNIQUE(product_id, locale),
  CONSTRAINT uq_product_slug_locale UNIQUE(slug, locale)
);
CREATE INDEX idx_product_trg_title_trgm ON product_translations USING GIN (title gin_trgm_ops);

-- категории
CREATE TABLE category_translations (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,                  -- локализованный слаг
  full_path TEXT NOT NULL,             -- precomputed: 'odezhda/platya'
  meta JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT uq_cat_locale UNIQUE(category_id, locale),
  CONSTRAINT uq_cat_path_locale UNIQUE(full_path, locale)
);
```

Аналогично: `attribute_translations`, `attribute_value_translations`, `brand_translations`.

**URL/SEO:**

- Префиксы локали в пути: `/am/`, `/ru/`, `/en/`.
- `hreflang` и `canonical` на каждую локаль.
- При смене слага создаём запись в таблице редиректов `redirects(from_path, to_path, locale, 301)`.

**Fallback:**

- Если перевода нет, возвращаем дефолтную локаль + `translationMissing=true`.
- Политика fallback настраивается: например, `am -> ru -> en`.

**Админ‑процессы:**

- Вкладки языков в форме товара; статус «нужен перевод»; массовый импорт/экспорт CSV/XLSX с колонками `locale`.
- Проверки: пустые поля ключевых локалей блокируют публикацию.

**API:**

- Явный параметр `?lang=am` или `Accept-Language`.
- Всегда отдаём `localized` и `default` блоки в ответе, если нужен fallback.

**Поиск:**

- Отдельный индекс Meilisearch на каждую локаль (`products_ru`, `products_am`, `products_en`).
- Синонимы/морфология настраиваются по языку. Индексация подтягивает нужную запись перевода.

**События для кэша/поиска:** `TranslationCreated/Updated`, `SlugChanged` → reindex + инвалидация HTML/JSON по соответствующим локалям.

---

### 4.2 Детальная схема БД (DDL основных таблиц)

**Все таблицы с точными типами, индексами и FK для корректной генерации миграций.**

```sql
-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE brands (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_brands_published ON brands(published) WHERE deleted_at IS NULL;

CREATE TABLE brand_translations (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  CONSTRAINT uq_brand_locale UNIQUE(brand_id, locale)
);

-- ============================================================
-- CATEGORIES (nested set или closure table для дерева)
-- ============================================================
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  media JSONB DEFAULT '[]'::jsonb,           -- [{url, alt, type}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_published ON categories(published) WHERE deleted_at IS NULL;

CREATE TABLE category_translations (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  full_path TEXT NOT NULL,                   -- precomputed для быстрых URL
  description TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  CONSTRAINT uq_cat_locale UNIQUE(category_id, locale),
  CONSTRAINT uq_cat_path_locale UNIQUE(full_path, locale)
);
CREATE INDEX idx_cat_trg_slug ON category_translations(slug, locale);

-- ============================================================
-- ATTRIBUTES & VALUES (размер, цвет, материал и т.д.)
-- ============================================================
CREATE TABLE attributes (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,          -- 'size', 'color', 'material'
  type VARCHAR(50) DEFAULT 'select',         -- select/multiselect/text/number
  filterable BOOLEAN DEFAULT true,           -- показывать в фасетах
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attribute_translations (
  id BIGSERIAL PRIMARY KEY,
  attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT uq_attr_locale UNIQUE(attribute_id, locale)
);

CREATE TABLE attribute_values (
  id BIGSERIAL PRIMARY KEY,
  attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  value VARCHAR(255) NOT NULL,               -- значение (S/M/L или Red)
  position INTEGER DEFAULT 0,
  CONSTRAINT uq_attr_value UNIQUE(attribute_id, value)
);

CREATE TABLE attribute_value_translations (
  id BIGSERIAL PRIMARY KEY,
  value_id BIGINT NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  label VARCHAR(255) NOT NULL,
  CONSTRAINT uq_attrval_locale UNIQUE(value_id, locale)
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL,
  sku_prefix VARCHAR(50),                    -- префикс для вариантов
  media JSONB DEFAULT '[]'::jsonb,           -- [{url, alt, position, type}]
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,            -- "хит продаж"
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_products_brand ON products(brand_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_published ON products(published, published_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_featured ON products(featured) WHERE published = true AND deleted_at IS NULL;

CREATE TABLE product_translations (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description_html TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  CONSTRAINT uq_product_locale UNIQUE(product_id, locale),
  CONSTRAINT uq_product_slug_locale UNIQUE(slug, locale)
);
CREATE INDEX idx_product_trg_slug ON product_translations(slug, locale);
CREATE INDEX idx_product_trg_title_trgm ON product_translations USING GIN (title gin_trgm_ops);

-- ============================================================
-- PRODUCT ↔ CATEGORY (many-to-many)
-- ============================================================
CREATE TABLE product_categories (
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (product_id, category_id)
);
CREATE INDEX idx_prod_cat_category ON product_categories(category_id);

-- ============================================================
-- PRODUCT ↔ ATTRIBUTE (какие атрибуты у товара)
-- ============================================================
CREATE TABLE product_attributes (
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, attribute_id)
);

-- ============================================================
-- VARIANTS (SKU, цена, остаток)
-- ============================================================
CREATE TABLE variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL UNIQUE,
  barcode VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),           -- зачеркнутая цена
  cost DECIMAL(10, 2),                       -- себестоимость
  stock INTEGER DEFAULT 0,
  stock_reserved INTEGER DEFAULT 0,          -- зарезервировано в заказах
  weight_grams INTEGER,
  image_url TEXT,                            -- опционально своё фото
  position INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_variants_product ON variants(product_id);
CREATE INDEX idx_variants_sku ON variants(sku);
CREATE INDEX idx_variants_stock ON variants(stock) WHERE published = true;

-- ============================================================
-- VARIANT OPTIONS (размер=M, цвет=Red)
-- ============================================================
CREATE TABLE variant_options (
  id BIGSERIAL PRIMARY KEY,
  variant_id BIGINT NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  value_id BIGINT NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
  CONSTRAINT uq_variant_attr UNIQUE(variant_id, attribute_id)
);
CREATE INDEX idx_variant_opt_variant ON variant_options(variant_id);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50) UNIQUE,
  password_hash TEXT,                        -- Argon2id
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  locale VARCHAR(5) DEFAULT 'ru',
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT user_login_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;

-- ============================================================
-- USER ROLES (RBAC)
-- ============================================================
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,          -- admin, manager, customer
  permissions JSONB DEFAULT '[]'::jsonb      -- ['products.edit', 'orders.view']
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- USER ADDRESSES
-- ============================================================
CREATE TABLE addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country_code VARCHAR(2) DEFAULT 'AM',
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================================
-- CARTS
-- ============================================================
CREATE TABLE carts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  guest_token UUID UNIQUE,                   -- для гостей
  locale VARCHAR(5) DEFAULT 'ru',
  coupon_code VARCHAR(100),
  abandoned BOOLEAN DEFAULT false,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR guest_token IS NOT NULL)
);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_guest ON carts(guest_token);
CREATE INDEX idx_carts_abandoned ON carts(abandoned, abandoned_at) WHERE abandoned = true;

CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id BIGINT NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_snapshot DECIMAL(10, 2) NOT NULL,    -- цена на момент добавления
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_cart_variant UNIQUE(cart_id, variant_id)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  number VARCHAR(50) NOT NULL UNIQUE,        -- человекочитаемый номер
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',
  
  -- Финансы
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'AMD',
  
  -- Контакты
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_locale VARCHAR(5) DEFAULT 'ru',
  
  -- Адреса
  billing_address JSONB,                     -- {first_name, last_name, address...}
  shipping_address JSONB,
  
  -- Доставка
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  
  -- Прочее
  notes TEXT,                                -- заметки клиента
  admin_notes TEXT,                          -- заметки менеджера
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(number);
CREATE INDEX idx_orders_status ON orders(status, created_at);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id BIGINT REFERENCES variants(id) ON DELETE SET NULL,
  
  -- Snapshot данных (на момент заказа)
  product_title VARCHAR(255) NOT NULL,
  variant_title VARCHAR(255),
  sku VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);

-- ============================================================
-- ORDER EVENTS (audit log / event sourcing)
-- ============================================================
CREATE TABLE order_events (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,                -- 'order.created', 'payment.completed'
  data JSONB NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_order_events_order ON order_events(order_id, created_at);
CREATE INDEX idx_order_events_type ON order_events(type);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,             -- 'idram', 'arca', 'stripe'
  provider_transaction_id VARCHAR(255),
  method VARCHAR(50),                        -- 'card', 'wallet', 'terminal'
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'AMD',
  status VARCHAR(50) DEFAULT 'pending',      -- pending/completed/failed/refunded
  
  -- Metadata
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  error_code VARCHAR(100),
  error_message TEXT,
  
  provider_response JSONB,                   -- raw данные от провайдера
  idempotency_key UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_provider_txn ON payments(provider, provider_transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE coupons (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,                 -- 'percentage', 'fixed_amount', 'free_shipping'
  value DECIMAL(10, 2),                      -- 10 (для 10%) или 5000 (для 5000 AMD)
  
  -- Ограничения
  min_order_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,                       -- общий лимит
  usage_limit_per_user INTEGER,
  usage_count INTEGER DEFAULT 0,
  
  -- Применимость
  applies_to VARCHAR(50) DEFAULT 'all',      -- 'all', 'categories', 'products'
  target_ids BIGINT[],                       -- ID категорий или товаров
  
  -- Период действия
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_coupons_code ON coupons(code) WHERE active = true;

-- ============================================================
-- COUPON USAGE (история использования)
-- ============================================================
CREATE TABLE coupon_usages (
  id BIGSERIAL PRIMARY KEY,
  coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_coupon_usage_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usage_user ON coupon_usages(user_id);

-- ============================================================
-- IDEMPOTENCY KEYS (для checkout и платежей)
-- ============================================================
CREATE TABLE idempotency_keys (
  key UUID PRIMARY KEY,
  request_hash TEXT NOT NULL,                -- hash тела запроса
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- ============================================================
-- REDIRECTS (для SEO при смене URL)
-- ============================================================
CREATE TABLE redirects (
  id BIGSERIAL PRIMARY KEY,
  from_path TEXT NOT NULL,
  to_path TEXT NOT NULL,
  locale VARCHAR(5),
  status_code SMALLINT DEFAULT 301,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_redirect_from UNIQUE(from_path, locale)
);
CREATE INDEX idx_redirects_from ON redirects(from_path, locale);
```

**Комментарии к схеме:**

- **Soft delete**: `deleted_at` для восстановления данных; partial index для производительности.
- **Audit fields**: везде `created_at`, `updated_at`; в критичных таблицах можно добавить `created_by`, `updated_by`.
- **Snapshot данные**: в `order_items` хранятся title/price на момент заказа (защита от изменения товара).
- **JSONB**: для гибких данных (адреса, meta, provider_response) без схемных миграций.
- **Event sourcing**: `order_events` хранит всю историю изменений заказа для аудита.
- **Idempotency**: отдельная таблица с TTL для автоочистки старых ключей.

---

## 5) API дизайн

**Версионирование:** `/api/v1/...`\
**Стандарты:**

- Формат ошибок — RFC 7807 (`application/problem+json`).
- Идемпотентность: заголовок `Idempotency-Key` на POST `/checkout` и платежи.
- Пагинация: `limit/offset` или cursor, whitelisted фильтры и сортировки.
- Кэш GET: `ETag/Last-Modified` + 304.
- OpenAPI 3.1 спецификация; генерация SDK клиента.

**Примеры эндпоинтов**

- GET `/products?query=&category=&filters=&sort=&page=`
- GET `/products/{slug}`
- GET `/categories/tree`
- POST `/cart/items` | PATCH `/cart/items/{id}` | DELETE `/cart/items/{id}`
- POST `/checkout` → возврат `orderId`, `paymentUrl`/`paymentClientSecret`
- POST `/payments/webhook/idram` | `/payments/webhook/arca` (подпись/проверка)
- GET `/orders/{number}` (авторизованная зона)

**DTO/валидации**: class‑validator на каждое поле, строгие схемы, canonicalization.

### 5.1 Примеры API запросов и ответов

**Зачем:** чёткие контракты API защищают от несовпадения ожиданий фронтенда и бэкенда, облегчают генерацию SDK и документации.

#### **GET /api/v1/products/{slug} — Детали товара**

**Request:**
```http
GET /api/v1/products/red-tshirt?lang=ru HTTP/1.1
Host: api.myshop.am
Accept: application/json
Accept-Language: ru
```

**Response 200 OK:**
```json
{
  "id": 123,
  "slug": "red-tshirt",
  "title": "Красная футболка",
  "subtitle": "Базовая модель",
  "description": "<p>Удобная хлопковая футболка...</p>",
  "brand": {
    "id": 5,
    "slug": "nike",
    "name": "Nike",
    "logo": "https://cdn.myshop.am/brands/nike.svg"
  },
  "categories": [
    {
      "id": 10,
      "slug": "odezhda/futbolki",
      "title": "Футболки",
      "breadcrumb": [
        { "id": 1, "slug": "odezhda", "title": "Одежда" },
        { "id": 10, "slug": "odezhda/futbolki", "title": "Футболки" }
      ]
    }
  ],
  "media": [
    {
      "url": "https://cdn.myshop.am/products/red-tshirt-1.jpg",
      "alt": "Красная футболка спереди",
      "position": 1,
      "type": "image"
    }
  ],
  "variants": [
    {
      "id": 456,
      "sku": "TSH-RED-S",
      "price": 5000,
      "compareAtPrice": 7000,
      "stock": 10,
      "options": [
        { "attribute": "Размер", "value": "S", "key": "size" },
        { "attribute": "Цвет", "value": "Красный", "key": "color" }
      ],
      "available": true
    },
    {
      "id": 457,
      "sku": "TSH-RED-M",
      "price": 5000,
      "stock": 0,
      "options": [
        { "attribute": "Размер", "value": "M", "key": "size" },
        { "attribute": "Цвет", "value": "Красный", "key": "color" }
      ],
      "available": false
    }
  ],
  "attributes": [
    {
      "key": "material",
      "name": "Материал",
      "value": "100% хлопок"
    }
  ],
  "seo": {
    "title": "Красная футболка Nike — купить в Ереване",
    "description": "Базовая хлопковая футболка Nike. Доставка по Армении."
  },
  "published": true,
  "publishedAt": "2025-01-15T10:00:00Z",
  "createdAt": "2025-01-10T12:00:00Z",
  "updatedAt": "2025-01-20T14:30:00Z"
}
```

**Response 404 Not Found:**
```json
{
  "type": "https://api.myshop.am/problems/not-found",
  "title": "Product not found",
  "status": 404,
  "detail": "Product with slug 'red-tshirt' does not exist or is not published",
  "instance": "/api/v1/products/red-tshirt"
}
```

---

#### **GET /api/v1/products — Список товаров (каталог)**

**Request:**
```http
GET /api/v1/products?category=odezhda&filters[size]=M,L&filters[color]=red&sort=price_asc&page=1&limit=24&lang=ru HTTP/1.1
```

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": 123,
      "slug": "red-tshirt",
      "title": "Красная футболка",
      "brand": { "id": 5, "name": "Nike" },
      "price": 5000,
      "compareAtPrice": 7000,
      "image": "https://cdn.myshop.am/products/red-tshirt-thumb.jpg",
      "badge": "sale",
      "inStock": true
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 24,
    "totalPages": 7
  },
  "facets": {
    "size": [
      { "value": "S", "count": 23 },
      { "value": "M", "count": 45, "selected": true },
      { "value": "L", "count": 38, "selected": true }
    ],
    "color": [
      { "value": "red", "label": "Красный", "count": 12, "selected": true },
      { "value": "blue", "label": "Синий", "count": 34 }
    ],
    "price": {
      "min": 2000,
      "max": 50000,
      "currentMin": null,
      "currentMax": null
    }
  }
}
```

---

#### **POST /api/v1/cart/items — Добавить в корзину**

**Request:**
```http
POST /api/v1/cart/items HTTP/1.1
Content-Type: application/json
X-Guest-Token: 550e8400-e29b-41d4-a716-446655440000

{
  "variantId": 456,
  "quantity": 2
}
```

**Response 201 Created:**
```json
{
  "cart": {
    "id": 789,
    "items": [
      {
        "id": 1001,
        "variant": {
          "id": 456,
          "sku": "TSH-RED-S",
          "product": {
            "id": 123,
            "title": "Красная футболка",
            "slug": "red-tshirt",
            "image": "https://cdn.myshop.am/products/red-tshirt-thumb.jpg"
          },
          "options": [
            { "attribute": "Размер", "value": "S" }
          ]
        },
        "quantity": 2,
        "price": 5000,
        "total": 10000
      }
    ],
    "totals": {
      "subtotal": 10000,
      "discount": 0,
      "shipping": 1000,
      "tax": 0,
      "total": 11000,
      "currency": "AMD"
    },
    "itemsCount": 2
  }
}
```

**Response 422 Unprocessable Entity:**
```json
{
  "type": "https://api.myshop.am/problems/validation-error",
  "title": "Validation failed",
  "status": 422,
  "errors": [
    {
      "field": "quantity",
      "message": "Requested quantity (10) exceeds available stock (3)",
      "code": "insufficient_stock"
    }
  ]
}
```

---

#### **POST /api/v1/checkout — Создать заказ**

**Request:**
```http
POST /api/v1/checkout HTTP/1.1
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440001

{
  "cartId": 789,
  "email": "customer@example.com",
  "phone": "+37477123456",
  "shippingAddress": {
    "firstName": "Иван",
    "lastName": "Иванов",
    "addressLine1": "ул. Абовяна 10",
    "city": "Ереван",
    "postalCode": "0001",
    "countryCode": "AM"
  },
  "billingAddress": null,
  "shippingMethod": "courier_yerevan",
  "paymentMethod": "idram",
  "notes": "Позвонить за час до доставки",
  "acceptTerms": true
}
```

**Response 201 Created:**
```json
{
  "order": {
    "id": 9876,
    "number": "250207-00123",
    "status": "pending",
    "paymentStatus": "pending",
    "total": 11000,
    "currency": "AMD",
    "createdAt": "2025-02-07T14:35:00Z"
  },
  "payment": {
    "provider": "idram",
    "paymentUrl": "https://banking.idram.am/payment?token=abc123",
    "expiresAt": "2025-02-07T14:50:00Z"
  },
  "nextAction": "redirect",
  "redirectUrl": "https://banking.idram.am/payment?token=abc123"
}
```

**Response 400 Bad Request (идемпотентность):**
```json
{
  "type": "https://api.myshop.am/problems/idempotency-mismatch",
  "title": "Idempotency key already used",
  "status": 400,
  "detail": "This idempotency key was already used with different request data",
  "existingOrderNumber": "250207-00122"
}
```

---

#### **POST /api/v1/payments/webhook/idram — Вебхук платежа**

**Request (от Idram):**
```http
POST /api/v1/payments/webhook/idram HTTP/1.1
Content-Type: application/json
X-Idram-Signature: sha256=abc123...

{
  "transactionId": "IDR-12345678",
  "merchantOrderId": "9876",
  "status": "success",
  "amount": 11000,
  "currency": "AMD",
  "cardMask": "****1234",
  "cardType": "VISA",
  "timestamp": "2025-02-07T14:40:00Z"
}
```

**Response 200 OK:**
```json
{
  "received": true,
  "orderId": "250207-00123"
}
```

---

#### **GET /api/v1/orders/{number} — Детали заказа**

**Request:**
```http
GET /api/v1/orders/250207-00123 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "id": 9876,
  "number": "250207-00123",
  "status": "confirmed",
  "paymentStatus": "paid",
  "fulfillmentStatus": "unfulfilled",
  "items": [
    {
      "id": 10001,
      "productTitle": "Красная футболка",
      "variantTitle": "S / Красный",
      "sku": "TSH-RED-S",
      "quantity": 2,
      "price": 5000,
      "total": 10000,
      "image": "https://cdn.myshop.am/products/red-tshirt-thumb.jpg"
    }
  ],
  "totals": {
    "subtotal": 10000,
    "discount": 0,
    "shipping": 1000,
    "tax": 0,
    "total": 11000,
    "currency": "AMD"
  },
  "customer": {
    "email": "customer@example.com",
    "phone": "+37477123456"
  },
  "shippingAddress": {
    "firstName": "Иван",
    "lastName": "Иванов",
    "addressLine1": "ул. Абовяна 10",
    "city": "Ереван",
    "postalCode": "0001",
    "countryCode": "AM"
  },
  "shippingMethod": "Курьер по Еревану",
  "trackingNumber": null,
  "timeline": [
    {
      "status": "created",
      "timestamp": "2025-02-07T14:35:00Z",
      "note": "Заказ создан"
    },
    {
      "status": "paid",
      "timestamp": "2025-02-07T14:40:00Z",
      "note": "Оплата получена"
    },
    {
      "status": "confirmed",
      "timestamp": "2025-02-07T14:41:00Z",
      "note": "Заказ подтверждён"
    }
  ],
  "createdAt": "2025-02-07T14:35:00Z",
  "updatedAt": "2025-02-07T14:41:00Z"
}
```

---

#### **GET /api/v1/search — Глобальный поиск**

**Request:**
```http
GET /api/v1/search?q=красная+футболка&lang=ru&limit=20 HTTP/1.1
```

**Response 200 OK:**
```json
{
  "query": "красная футболка",
  "processingTimeMs": 12,
  "hits": [
    {
      "id": "123",
      "type": "product",
      "title": "Красная <em>футболка</em> Nike",
      "slug": "red-tshirt",
      "price": 5000,
      "image": "https://cdn.myshop.am/products/red-tshirt-thumb.jpg",
      "inStock": true,
      "score": 0.98
    }
  ],
  "facets": {
    "category": [
      { "value": "odezhda", "label": "Одежда", "count": 45 }
    ]
  },
  "total": 45,
  "estimatedTotalHits": 45
}
```

---

**Общие правила ответов:**

1. **Успех (2xx):** всегда JSON с данными
2. **Ошибки клиента (4xx):** RFC 7807 Problem Details
3. **Ошибки сервера (5xx):** минимизировать детали (не раскрывать стек)
4. **Timestamps:** ISO 8601 UTC (`2025-02-07T14:35:00Z`)
5. **Цены:** integer (копейки/драмы), без float
6. **Локализация:** через параметр `?lang=` или `Accept-Language`
7. **Пагинация:** `page/limit` + мета-информация
8. **Идемпотентность:** заголовок `Idempotency-Key` на POST/PATCH

---

## 6) Checkout, оплата, идемпотентность

**Правила**

- Заказ создается в статусе `pending` с `reservationTTL=15min`.
- Все операции записи idempotent. Повтор запроса с тем же `Idempotency-Key` не создаёт дубль.
- Webhook провайдера верифицируется по подписи; повторная доставка события безопасна.

**Псевдокод idempotent обработки**

```ts
async function createOrder(req) {
  const key = req.headers['Idempotency-Key'];
  const existing = await idempotencyStore.get(key);
  if (existing) return existing.response;

  return await withTransaction(async (tx) => {
    const order = await tx.orders.create(pendingFromCart(req.user, req.body));
    await reserveStock(tx, order.items, { ttl: 15 * 60 });
    const payment = await payments.init(order, req.body.method);
    const resp = { orderId: order.number, payment }; 
    await idempotencyStore.put(key, resp);
    return resp;
  });
}
```

### 6.1 Схема статусов заказа (state machine)

**Зачем:** чёткие правила переходов защищают от логических ошибок и гарантируют консистентность.

**Три независимые оси статусов:**

1. **Order Status** (общий статус заказа)
2. **Payment Status** (статус оплаты)
3. **Fulfillment Status** (статус выполнения)

#### **1. Order Status (основной жизненный цикл)**

```mermaid
stateDiagram-v2
    [*] --> pending: создан заказ
    pending --> confirmed: менеджер подтвердил
    pending --> cancelled: клиент/менеджер отменил
    
    confirmed --> processing: начата обработка
    confirmed --> cancelled: отменён до обработки
    
    processing --> shipped: товар отправлен
    processing --> cancelled: отменён во время обработки
    
    shipped --> delivered: доставлен
    shipped --> returned: возврат инициирован
    
    delivered --> completed: завершён успешно
    delivered --> returned: клиент вернул товар
    
    returned --> refunded: возврат обработан
    refunded --> [*]
    completed --> [*]
    cancelled --> [*]
```

**Валидные переходы:**

| Из статуса   | В статус    | Условие                      | Кто может                     |
| ------------ | ----------- | ---------------------------- | ----------------------------- |
| `pending`    | `confirmed` | payment\_status = 'paid'     | автоматически / менеджер      |
| `pending`    | `cancelled` | любое                        | клиент, менеджер, автоматика  |
| `confirmed`  | `processing`| stock доступен               | менеджер                      |
| `confirmed`  | `cancelled` | до начала обработки          | менеджер                      |
| `processing` | `shipped`   | tracking\_number заполнен    | менеджер                      |
| `processing` | `cancelled` | только с согласованием       | менеджер (admin role)         |
| `shipped`    | `delivered` | подтверждение доставки       | курьер / автоматика           |
| `delivered`  | `completed` | 7 дней без претензий         | автоматика                    |
| `delivered`  | `returned`  | клиент инициировал возврат   | клиент → менеджер одобряет    |
| `returned`   | `refunded`  | возврат обработан            | менеджер                      |

**Реализация проверки:**

```typescript
const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['completed', 'returned'],
  returned: ['refunded'],
  completed: [],
  cancelled: [],
  refunded: []
};

function canTransition(from: string, to: string): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// В сервисе:
async updateOrderStatus(orderId, newStatus, userId) {
  const order = await findOrder(orderId);
  if (!canTransition(order.status, newStatus)) {
    throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
  }
  
  // Проверка прав доступа
  await checkPermission(userId, 'orders.update_status', { currentStatus: order.status, newStatus });
  
  // Атомарное обновление + событие
  await db.transaction(async tx => {
    await tx.orders.update({ status: newStatus, updated_at: NOW() });
    await tx.orderEvents.create({
      order_id: orderId,
      type: 'order.status_changed',
      data: { from: order.status, to: newStatus },
      user_id: userId
    });
  });
  
  await eventBus.emit('order.status_changed', { orderId, from: order.status, to: newStatus });
}
```

#### **2. Payment Status**

```
pending → processing → paid → refunded
              ↓
           failed
```

| Статус      | Описание                            |
| ----------- | ----------------------------------- |
| `pending`   | ожидание оплаты                     |
| `processing`| оплата в процессе (redirect к провайдеру) |
| `paid`      | успешно оплачен                     |
| `failed`    | платёж не прошёл                    |
| `refunded`  | возврат средств выполнен            |

**Автоматика:**
- Если `pending` > 15 минут → резерв stock освобождается
- Если `paid` → триггер перехода order status в `confirmed`

#### **3. Fulfillment Status**

```
unfulfilled → partially_fulfilled → fulfilled
```

| Статус               | Описание                             |
| -------------------- | ------------------------------------ |
| `unfulfilled`        | ни один товар не отправлен           |
| `partially_fulfilled`| часть товаров отправлена (split orders) |
| `fulfilled`          | все товары отправлены                |

**Permissions (RBAC):**

```json
{
  "roles": {
    "customer": ["orders.view_own", "orders.cancel_pending"],
    "manager": ["orders.view_all", "orders.update_status", "orders.add_notes"],
    "admin": ["orders.*"]
  }
}
```

---

## 7) Поиск и навигация

- Индексация в фоне: события `ProductCreated/Updated/Deleted` кладут задачи в очередь.
- Синонимы и опечатки включены; фасеты: цена/бренд/ключевые атрибуты.
- 404/410 для удалённых товаров; 301 редиректы при смене слага.

### 7.1 Полный список доменных событий

**Зачем:** события — основа event-driven архитектуры. Этот список обязателен для корректной реализации кэш-инвалидации, очередей и интеграций.

**Формат события:**

```typescript
interface DomainEvent<T = any> {
  id: string;              // UUID события
  type: string;            // 'product.created'
  aggregateId: string;     // ID сущности (productId, orderId)
  aggregateType: string;   // 'product', 'order'
  data: T;                 // payload события
  metadata: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    timestamp: Date;
    correlationId: string; // для trace distributed requests
  };
}
```

#### **Каталог (Products)**

| Событие                     | Триггер                         | Payload (data)                           | Действия                                      |
| --------------------------- | ------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `product.created`           | создание товара                 | `{ productId, slug, published }`         | reindex Meili, purge /products                |
| `product.updated`           | изменение товара                | `{ productId, changes }`                 | reindex, purge карточки                       |
| `product.deleted`           | soft-delete товара              | `{ productId, slug }`                    | delete from Meili, purge, 410 redirect        |
| `product.published`         | публикация товара               | `{ productId }`                          | reindex, purge categories/home                |
| `product.unpublished`       | снятие с публикации             | `{ productId }`                          | delete from Meili, purge                      |
| `variant.price_changed`     | изменение цены варианта         | `{ variantId, oldPrice, newPrice, sku }` | revalidateTag('price:{sku}'), reindex         |
| `variant.stock_changed`     | изменение остатка               | `{ variantId, oldStock, newStock, sku }` | revalidateTag('stock:{sku}'), уведомление     |
| `variant.created`           | добавление варианта             | `{ variantId, productId, sku }`          | reindex product                               |
| `variant.deleted`           | удаление варианта               | `{ variantId, sku }`                     | reindex, purge                                |
| `translation.created`       | добавление перевода             | `{ entityType, entityId, locale }`       | reindex локального индекса                    |
| `translation.updated`       | обновление перевода             | `{ entityType, entityId, locale }`       | reindex, purge по locale                      |
| `category.created`          | создание категории              | `{ categoryId, parentId }`               | purge /categories, rebuild tree               |
| `category.updated`          | изменение категории             | `{ categoryId, changes }`                | purge категории и всех родителей              |
| `category.deleted`          | удаление категории              | `{ categoryId }`                         | purge, reindex products                       |
| `category.tree_changed`     | изменение дерева (parent)       | `{ categoryId, oldParent, newParent }`   | rebuild full_path, purge all categories       |

#### **Корзина (Cart)**

| Событие              | Триггер                       | Payload                             | Действия                                |
| -------------------- | ----------------------------- | ----------------------------------- | --------------------------------------- |
| `cart.created`       | создание корзины              | `{ cartId, userId?, guestToken? }`  | —                                       |
| `cart.item_added`    | добавление товара в корзину   | `{ cartId, variantId, quantity }`   | уведомление (опционально)               |
| `cart.item_updated`  | изменение количества          | `{ cartId, itemId, newQuantity }`   | —                                       |
| `cart.item_removed`  | удаление товара               | `{ cartId, itemId }`                | —                                       |
| `cart.coupon_applied`| применение купона             | `{ cartId, couponCode, discount }`  | пересчёт totals                         |
| `cart.abandoned`     | корзина брошена (2ч+ не актив)| `{ cartId, userId?, email?, items }`| job → abandoned cart email              |
| `cart.converted`     | корзина превратилась в заказ  | `{ cartId, orderId }`               | —                                       |

#### **Заказы (Orders)**

| Событие                  | Триггер                          | Payload                                       | Действия                                     |
| ------------------------ | -------------------------------- | --------------------------------------------- | -------------------------------------------- |
| `order.created`          | создание заказа                  | `{ orderId, number, userId?, total }`         | email confirmation, резерв stock, analytics  |
| `order.status_changed`   | изменение статуса                | `{ orderId, from, to }`                       | email/SMS уведомление, освобождение stock    |
| `order.paid`             | оплата успешна                   | `{ orderId, paymentId, amount }`              | триггер confirmed, email receipt, analytics  |
| `order.payment_failed`   | платёж не прошёл                 | `{ orderId, paymentId, error }`               | email уведомление, освобождение stock        |
| `order.shipped`          | заказ отправлен                  | `{ orderId, trackingNumber, carrier }`        | email + SMS с трекингом                      |
| `order.delivered`        | заказ доставлен                  | `{ orderId }`                                 | email подтверждение, запуск таймера review   |
| `order.cancelled`        | заказ отменён                    | `{ orderId, reason, userId }`                 | освобождение stock, refund (если оплачен)    |
| `order.refunded`         | возврат выполнен                 | `{ orderId, amount }`                         | email подтверждение                          |
| `order.note_added`       | комментарий добавлен             | `{ orderId, note, userId }`                   | —                                            |

#### **Платежи (Payments)**

| Событие                    | Триггер                    | Payload                                  | Действия                              |
| -------------------------- | -------------------------- | ---------------------------------------- | ------------------------------------- |
| `payment.initiated`        | начало платежа             | `{ paymentId, orderId, amount }`         | —                                     |
| `payment.completed`        | платёж успешен             | `{ paymentId, orderId, txnId }`          | триггер order.paid                    |
| `payment.failed`           | платёж провален            | `{ paymentId, orderId, error }`          | retry logic, триггер order.failed     |
| `payment.refund_initiated` | возврат инициирован        | `{ paymentId, amount }`                  | —                                     |
| `payment.refunded`         | возврат выполнен           | `{ paymentId, amount, txnId }`           | триггер order.refunded                |
| `payment.webhook_received` | вебхук от провайдера       | `{ provider, txnId, status, rawData }`   | идемпотентная обработка               |

#### **Пользователи (Users)**

| Событие                 | Триггер                       | Payload                            | Действия                       |
| ----------------------- | ----------------------------- | ---------------------------------- | ------------------------------ |
| `user.registered`       | регистрация                   | `{ userId, email }`                | welcome email, analytics       |
| `user.email_verified`   | подтверждение email           | `{ userId }`                       | —                              |
| `user.password_changed` | смена пароля                  | `{ userId }`                       | security email                 |
| `user.logged_in`        | вход в систему                | `{ userId, ip, userAgent }`        | security log                   |
| `user.blocked`          | блокировка пользователя       | `{ userId, reason }`               | отзыв токенов                  |

#### **Купоны (Coupons)**

| Событие             | Триггер                   | Payload                       | Действия                  |
| ------------------- | ------------------------- | ----------------------------- | ------------------------- |
| `coupon.created`    | создание купона           | `{ couponId, code }`          | —                         |
| `coupon.used`       | использование купона      | `{ couponId, userId, orderId }`| increment usage_count     |
| `coupon.exhausted`  | лимит использований       | `{ couponId }`                | disable coupon            |
| `coupon.expired`    | истёк срок действия       | `{ couponId }`                | —                         |

#### **Система (System)**

| Событие                      | Триггер                         | Payload                        | Действия                     |
| ---------------------------- | ------------------------------- | ------------------------------ | ---------------------------- |
| `system.cache_invalidated`   | ручная инвалидация кэша         | `{ tags[], keys[] }`           | purge CDN/Redis              |
| `system.index_rebuilt`       | полная переиндексация           | `{ index, recordsCount }`      | —                            |
| `system.backup_completed`    | бэкап завершён                  | `{ backupId, size, duration }` | алерт success                |
| `system.health_check_failed` | health check не прошёл          | `{ service, error }`           | алерт Telegram               |

**Реализация event bus (NestJS):**

```typescript
// packages/domain/src/events/index.ts
export enum DomainEventType {
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  ORDER_CREATED = 'order.created',
  ORDER_PAID = 'order.paid',
  // ... все события выше
}

// apps/api/src/events/event-bus.service.ts
@Injectable()
export class EventBusService {
  constructor(
    private eventEmitter: EventEmitter2,
    private queue: Queue, // BullMQ
  ) {}

  async emit(type: DomainEventType, data: any) {
    const event: DomainEvent = {
      id: uuid(),
      type,
      aggregateId: data.id || data.orderId || data.productId,
      aggregateType: type.split('.')[0],
      data,
      metadata: {
        timestamp: new Date(),
        correlationId: AsyncLocalStorage.getStore()?.correlationId,
      }
    };

    // Синхронные слушатели (кэш-инвалидация)
    this.eventEmitter.emit(type, event);

    // Асинхронные задачи (email, индексация)
    await this.queue.add('process-event', event, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }
}
```

---

## 8) Фронтенд: витрина

- SSR/ISR + CDN, критический CSS инлайн, code‑splitting, lazy для не‑above‑the‑fold.
- Доступность: WCAG 2.2 AA, фокусы, aria, клавиатура, skip‑links.
- I18n: ICU‑plural, локализация форматов дат/валют, локализованные URL/hreflang.
- Изображения: WebP/AVIF, `srcset/sizes`, лимит \~300 KB на карточку, трансформации на CDN, preconnect/preload критики.
- Унифицированные состояния UI: loading/skeleton/empty/error.

---

## 9) Админ‑панель (v1)

- Роли: администратор, менеджер заказов, контент‑менеджер, маркетолог.
- Массовые операции: импорт CSV/XLSX (валидация + отчёт ошибок), массовые правки цен/остатков.
- История изменений и аудит: кто/что/когда.
- Права на операции (create/edit/delete/publish) по ролям.
- Шаблоны e‑mail/SMS, предпросмотр, локализация.

---

## 10) Безопасность

**Аутентификация/авторизация**

- Хеш паролей: Argon2id (memory ≥ 64MB, iterations/parallelism по профилю машины).
- Сессии: HttpOnly, SameSite=Lax; refresh‑токены ≤ 30 дней, ротация/отзыв.
- MFA для админов.
- RBAC deny‑by‑default; проверка прав на сервере, не только в UI.

**Ввод/валидация**

- Обязательная валидация DTO на бэке; нормализация/escape; строгие типы.
- Запрет прямых SQL — только параметризованные запросы ORM.

**Защита от атак**

- CSRF защита на изменяющих запросах; антибот (hCaptcha/reCAPTCHA) на публичных формах.
- Rate‑limit per IP/user; circuit breaker и тайм‑ауты на интеграции.
- Заголовки: CSP (script‑src 'self' 'nonce‑{n}'), HSTS, X‑Content‑Type‑Options, Referrer‑Policy, Permissions‑Policy, X‑Frame‑Options.

**Загрузка файлов**

- Проверка MIME/расширений, ограничение размера, антивирус‑скан, приватные префиксы в S3; подписи URL с TTL.

**Секреты/конфиги**

- Никаких ключей в Git. Секрет‑менеджмент (ENV, Vault/KMS). Разделение dev/stage/prod.

**Логи/PII**

- Структурные JSON‑логи с correlation‑id. Маскирование PII, запрет логировать PAN.

---

## 11) Производительность и кэш

- CDN перед Nginx, HTML‑кэш категорий/товаров/брендов (ISR + `stale‑while‑revalidate`).
- Redis‑кэш для часто читаемых API (прайс‑блоки, хиты) с TTL и точечной инвалидацией по событиям (изменение цены/остатка/публикации).
- Оптимизация SQL: индексы, избегать N+1; `SELECT … FOR UPDATE` в критических местах.
- Бюджеты: домашняя страница критический CSS/JS ≤ 150 KB; шрифты — `display: swap`.

### 11.1 Стратегия кэш‑инвалидации (конкретика)

**Типы кэшей:**

1. **Edge/CDN** HTML и media (Cloudflare).
2. **Next.js** Route/Data Cache (ISR, `revalidateTag`).
3. **Redis** объектный кэш API/аггрегатов.
4. **Браузерный** кэш с `ETag/Last-Modified`.

**Теги и версии:**

- В БД у сущностей `version`/`updated_at`. Ключ Redis: `product:{id}:v{version}`. Инвалидация = атомарный инкремент версии и публикация события.
- В Next.js используем **cache tags**: `product:{id}`, `category:{id}`, `collection:{id}`, `price:{sku}`, `stock:{sku}`, `menu`, `home`, `sitemap`.
- HTML‑ответы помечаются **Surrogate‑Key/Cache‑Tag** заголовком (если доступно) с теми же тегами.

**Механика событий:** Каждое изменение генерирует доменное событие → очередь → обработчики:

| Событие                        | Действия инвалидации                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| ProductCreated/Updated/Deleted | `revalidateTag('product:{id}')`, purge CDN по тегу `product:{id}`, инкремент версии Redis, reindex Meili                       |
| TranslationCreated/Updated     | `revalidateTag('product:{id}')`/`category:{id}` для нужной локали; purge CDN по локализованным URL, reindex локального индекса |
| PriceChanged                   | `revalidateTag('price:{sku}')`, обновить карточку в Redis, мягкий purge продуктовой страницы                                   |
| StockChanged                   | `revalidateTag('stock:{sku}')`, обновить блок наличия, без полного purge каталога                                              |
| CategoryChanged/TreeChanged    | `revalidateTag('category:{id}')`, purge категорий/хлебных крошек, пересчитать `full_path`, reindex дочерних                    |
| Publish/Unpublish              | purge соответствующих страниц/списков, reindex                                                                                 |

**CDN purge:**

- Если есть Cache‑Tags — чистим по тегам батчами.
- Нет тегов — чистим по списку URL (продукт, его категории, бренд, пагинации 1–3).
- Все purge идемпотентны и батчатся (debounce 2–5 сек) для массовых правок.

**Next.js ISR:**

- Страницы категорий/товаров строятся с `revalidate` и **тегами**. На событии вызываем серверный `revalidateTag(tag)`. Пользователь видит stale, а фон перегенерирует свежую версию.

**Redis:**

- Ключи включают версию. На событии инкрементим версию и публикуем `invalidate:{entity}:{id}` в Pub/Sub, чтобы все инстансы выкинули старое.

**Batch‑импорт:**

- Включаем `bulk-mode`: отключаем точечный purge, собираем ID и делаем **coarse purge по тегам** (например, категория/бренд) + пакетную reindex. Ограничиваем QPS к CDN API.

**TTL и политика:**

- HTML категорий/товаров: `max-age=0, s-maxage=600, stale-while-revalidate=86400`.
- Данные цены/остатков: Redis TTL 30–60 сек и событие‑инвалидация при изменении. Корзина/checkout не кэшируются.

**Защита от штормов:**

- Debounce/троттлинг purge, джиттер, распределённые локи на reindex. Метрики: hit‑rate, время `revalidate`, частота purge, ошибки CDN API.

**Админ‑UX:**

- Кнопки: «Обновить страницу товара», «Очистить категорию», «Полный purge витрины» с защитой и журналом.

---

## 12) Инфраструктура и деплой

- **VPS + Docker Compose**: web, api, redis, meilisearch, nginx отдельными сервисами; Postgres управляемый или отдельный VPS.
- **CDN/WAF**: Cloudflare; кэш, DDoS, TLS 1.2+.
- **CI/CD**: GitHub Actions → линт/типы/тесты → сборка контейнеров → деплой по SSH, blue‑green (web\_v1/web\_v2). Миграции применяются на релизе.
- **Обсервабилити**: Loki/Prometheus/Grafana, Uptime‑мониторинг, алерты в Telegram (ошибки 5xx, latency p95, лаг очередей).
- **Бэкапы/DR**: ежедневные инкременты, еженедельные полные; offsite‑копия; ежеквартальный тест восстановления.

Начальные размеры: web+api 8 vCPU/16 GB, Meili 4 vCPU/8 GB, Redis 2 vCPU/4 GB, Postgres 2–4 vCPU/8–16 GB.

---

## 13) Тестирование и качество

- **Unit** ядра и сервисов, **API‑контракты**; покрытие ядра ≥ 70%.
- **E2E** (Playwright): поиск → корзина → checkout → оплата → смена статуса заказа.
- **Нагрузочное** (k6): 100–150 RPS чтение, 5–20 RPS запись (пики 10 мин) без нарушения SLO.
- **Lighthouse** в CI: mobile ≥ 85, desktop ≥ 95; контроль CWV.
- **Security**: SAST (ESLint/type‑check), зависимостей (Trivy/Snyk), секретов (gitleaks).

**Definition of Done (каждой задачи)**

- Тесты есть (unit/integration/e2e по необходимости).
- Документация обновлена (README/ADR/API).
- Логи/метрики/алерты покрывают новый функционал.
- Нет регрессий перформанса (Lighthouse/Profiler).
- Безопасность: хедеры, права, валидации проверены.

---

## 14) SEO и аналитика

- Canonical, OG/Twitter, Schema.org: Product, BreadcrumbList, Organization.
- XML‑sitemap index, правильный robots для stage/prod.
- GA4 + server‑side events (view\_item, add\_to\_cart, begin\_checkout, purchase); дедупликация; соблюдение consent.

---

## 15) Документация и ввод в эксплуатацию

- README: dev/stage/prod, шаблоны `.env`, команды.
- ER‑диаграмма, события, вебхуки, схемы статусов заказа.
- Чек‑лист запуска нового клиента (≤ 30 шагов) и план отката.

**Предрелизный чек‑лист**

1. Миграции/сиды проходят на stage.
2. Lighthouse mobile/desktop в бюджете; CWV в зелёной зоне.
3. k6 нагрузка пройдена.
4. Платёжные вебхуки — ок, идемпотентность проверена.
5. Бэкап свежий, восстановление протестировано.
6. Домены/SSL/CDN готовы, кэш‑инвалидации работают.
7. Почта/SMS доставляются; SPF/DKIM/DMARC ок.
8. Политики/robots/sitemap корректны.
9. Алерты включены.
10. Есть план отката.

**Пострелиз (48 часов)**: мониторинг error‑rate/latency/конверсии checkout; проверка индексации поиска и фидов; сбор RUM CWV; пост‑морем.

---

## 16) Почему это решение «рабочее в жизни»

- **Без лишней магии**: один проект, чётко спроектированное ядро, понятные конфиги и адаптеры.
- **Без «медленного шаблона»**: это не CMS и не runtime‑конструктор; скорость задают кэш/индексы/CDN и дисциплина бандла.
- **Гибкость**: нейтральная доменная модель и адаптеры позволяют увести функционал далеко от базы без сноса фундамента.
- **Поддерживаемость**: стандарты тестов/безопасности/деплоя уменьшают шанс словить «долг» в каждой копии.

> Финальный ориентир: первый магазин делаем по этому ТЗ. Все последующие независимые проекты стартуют копированием репозитория и заменой темы/конфигов, а ядро и нормы остаются едиными, чтобы не забыть ничего важного — особенно в безопасности.

