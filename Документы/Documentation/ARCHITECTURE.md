# АРХИТЕКТУРА ПРОЕКТА

> **Цель:** Понять ГДЕ что находится, ПОЧЕМУ так устроено, и КАК всё работает вместе.

---

## 🗂️ СТРУКТУРА ПРОЕКТА

```
shop-classic/
│
├── apps/
│   ├── web/                        # 🌐 Next.js витрина (SSR/ISR)
│   │   ├── app/                    # App Router (Next.js 15)
│   │   │   ├── (shop)/            # Группа routes для магазина
│   │   │   │   ├── page.tsx       # Главная страница
│   │   │   │   ├── products/      # Каталог
│   │   │   │   ├── cart/          # Корзина
│   │   │   │   └── checkout/      # Оформление заказа
│   │   │   ├── (account)/         # Группа для личного кабинета
│   │   │   │   ├── profile/
│   │   │   │   └── orders/
│   │   │   └── api/               # API routes (если нужны)
│   │   │
│   │   ├── components/            # Бизнес-компоненты
│   │   │   ├── ProductCard.tsx   # Карточка товара
│   │   │   ├── CartWidget.tsx    # Виджет корзины
│   │   │   └── Header.tsx        # Шапка сайта
│   │   │
│   │   ├── lib/                   # Утилиты и хуки
│   │   │   ├── api-client.ts     # Клиент для API
│   │   │   ├── hooks/            # React хуки
│   │   │   └── utils/            # Вспомогательные функции
│   │   │
│   │   └── public/                # Статика
│   │       ├── logo.svg
│   │       └── favicon.ico
│   │
│   └── api/                       # 🔧 NestJS backend (REST API)
│       └── src/
│           ├── modules/           # Модули (feature-based)
│           │   ├── products/      # Модуль товаров
│           │   │   ├── products.controller.ts
│           │   │   ├── products.service.ts
│           │   │   ├── products.module.ts
│           │   │   └── dto/       # Data Transfer Objects
│           │   ├── orders/
│           │   ├── users/
│           │   ├── auth/
│           │   └── payments/
│           │
│           ├── common/            # Общие сервисы
│           │   ├── guards/        # Auth guards
│           │   ├── interceptors/  # Логирование, трансформация
│           │   ├── filters/       # Exception filters
│           │   └── decorators/    # Кастомные decorators
│           │
│           ├── config/            # Конфигурация
│           │   └── configuration.ts
│           │
│           └── main.ts            # Entry point
│
├── packages/
│   ├── domain/                    # 🎯 Бизнес-логика (чистая)
│   │   ├── entities/              # Доменные сущности
│   │   │   ├── Product.ts
│   │   │   ├── Order.ts
│   │   │   ├── User.ts
│   │   │   └── Cart.ts
│   │   │
│   │   ├── use-cases/             # Бизнес-операции
│   │   │   ├── create-order.ts
│   │   │   ├── calculate-total.ts
│   │   │   └── reserve-stock.ts
│   │   │
│   │   ├── events/                # Доменные события
│   │   │   └── domain-events.ts
│   │   │
│   │   └── rules/                 # Бизнес-правила
│   │       ├── pricing-rules.ts
│   │       └── discount-rules.ts
│   │
│   ├── ui/                        # 🎨 UI компоненты (готовые)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts               # Экспорты
│   │
│   ├── design-tokens/             # 🎨 Дизайн-система
│   │   ├── tokens.ts              # Цвета, spacing, typography
│   │   └── index.ts
│   │
│   └── adapters/                  # 🔌 Интеграции
│       ├── payments/
│       │   ├── payment.interface.ts
│       │   ├── idram.adapter.ts
│       │   └── arca.adapter.ts
│       │
│       └── shipping/
│           ├── shipping.interface.ts
│           └── armenia-post.adapter.ts
│
├── config/                        # ⚙️ Конфигурация клиента
│   ├── brand.json                 # Бренд (МЕНЯЕТСЯ для клиента)
│   ├── contact.json               # Контакты
│   ├── shipping.json              # Методы доставки
│   ├── payments.json              # Платёжные провайдеры
│   └── features.json              # Включалки модулей
│
├── prisma/                        # 🗄️ БД схема и миграции
│   ├── schema.prisma              # Схема БД
│   ├── migrations/                # Миграции
│   └── seed.ts                    # Тестовые данные
│
├── scripts/                       # 🛠️ Скрипты
│   ├── setup-new-client.sh        # Настройка под клиента
│   ├── deploy.sh                  # Деплой
│   └── backup.sh                  # Бэкап
│
└── Documentation/                 # 📚 Документация (этот файл)
    ├── RULES.md
    ├── ARCHITECTURE.md
    └── ...
```

---

## 🎯 ПРИНЦИПЫ АРХИТЕКТУРЫ

### 1. Clean Architecture (чистая архитектура)

```
┌─────────────────────────────────────┐
│        UI Layer (apps/web)          │
│   - React компоненты                │
│   - Next.js pages                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Application Layer (apps/api)      │
│   - Controllers                     │
│   - Services                        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Domain Layer (packages/domain)    │
│   - Entities                        │
│   - Use Cases                       │
│   - Business Rules                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ Infrastructure (Prisma, Redis, etc) │
│   - Database                        │
│   - External APIs                   │
└─────────────────────────────────────┘
```

**Правила:**
- Domain НЕ зависит ни от чего (чистая логика)
- Application использует Domain
- UI использует Application через API
- Infrastructure реализует интерфейсы из Domain

---

### 2. Design System First

```
config/brand.json (цвета клиента)
         ↓
packages/design-tokens/tokens.ts (система дизайна)
         ↓
tailwind.config.ts (конфигурация Tailwind)
         ↓
packages/ui/* (готовые компоненты)
         ↓
apps/web/components/* (бизнес-компоненты)
```

**Правила:**
- ВСЕГДА используй компоненты из `packages/ui/`
- НЕ создавай свои стили (только через токены)
- Если нужен новый вариант — расширь существующий компонент

---

### 3. Config-Driven (конфиги управляют)

**Что меняется для каждого клиента:**
- `config/brand.json` — цвета, логотипы
- `config/contact.json` — email, телефон, адрес
- `config/shipping.json` — методы доставки
- `config/payments.json` — платёжные провайдеры

**Что НЕ меняется (система):**
- `packages/design-tokens/` — дизайн-система
- `packages/ui/` — UI компоненты
- `packages/domain/` — бизнес-логика

---

## 📦 ОПИСАНИЕ МОДУЛЕЙ

### `apps/web/` — Frontend (Next.js)

**Назначение:** Витрина магазина для пользователей.

**Технологии:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS

**Что здесь:**
- Страницы (каталог, товар, корзина, checkout)
- Бизнес-компоненты (ProductCard, CartWidget)
- Утилиты и хуки
- Клиент для API

**Куда писать:**
- Новая страница → `app/(shop)/new-page/page.tsx`
- Новый компонент → `components/NewComponent.tsx`
- Новый хук → `lib/hooks/useNewHook.ts`
- Новая утилита → `lib/utils/newUtil.ts`

---

### `apps/api/` — Backend (NestJS)

**Назначение:** REST API для фронтенда и вебхуки для интеграций.

**Технологии:**
- NestJS 10
- TypeScript
- Prisma ORM
- class-validator

**Что здесь:**
- Модули (Products, Orders, Users, Auth, Payments)
- Controllers (тонкий слой, только роутинг)
- Services (вся бизнес-логика)
- DTO (валидация данных)

**Куда писать:**
- Новый endpoint → `src/modules/products/products.controller.ts`
- Новая логика → `src/modules/products/products.service.ts`
- Новая валидация → `src/modules/products/dto/create-product.dto.ts`

---

### `packages/domain/` — Бизнес-логика

**Назначение:** Чистая бизнес-логика, независимая от фреймворков.

**Правила:**
- НЕТ зависимостей от Next.js/NestJS
- НЕТ зависимостей от Prisma/БД
- Только чистый TypeScript
- Только бизнес-правила

**Что здесь:**
- Entities (Product, Order, User) — доменные сущности
- Use Cases (CreateOrder, CalculateTotal) — бизнес-операции
- Rules (PricingRules, DiscountRules) — правила расчётов

**Куда писать:**
- Новая сущность → `entities/NewEntity.ts`
- Новый use case → `use-cases/new-operation.ts`
- Новое правило → `rules/new-rule.ts`

**Пример:**
```typescript
// packages/domain/entities/Order.ts
export class Order {
  constructor(
    public readonly id: number,
    public readonly items: OrderItem[],
    public readonly status: OrderStatus
  ) {}
  
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }
  
  canBeCancelled(): boolean {
    return ['pending', 'confirmed'].includes(this.status);
  }
}
```

---

### `packages/ui/` — UI компоненты

**Назначение:** Готовые переиспользуемые компоненты.

**Что здесь:**
- Button — кнопки (варианты: primary, secondary, outline)
- Card — карточки
- Input — поля ввода
- Badge — значки (sale, new, hot)
- Modal — модальные окна

**Куда писать:**
- Новый компонент → `NewComponent.tsx`
- Экспорт → добавить в `index.ts`

**Шаблон компонента:**
```typescript
// packages/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonStyles = cva(
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-white hover:bg-secondary/90',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-base rounded-lg',
        lg: 'px-6 py-3 text-lg rounded-lg'
      }
    }
  }
);

interface ButtonProps extends VariantProps<typeof buttonStyles> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, size })} {...props}>
      {children}
    </button>
  );
}
```

---

### `packages/design-tokens/` — Дизайн-система

**Назначение:** Источник правды для всех стилей.

**Что здесь:**
- Цвета (semantic, neutral)
- Spacing (отступы)
- Typography (шрифты, размеры)
- Shadows (тени)
- Border Radius (скругления)

**ЧТО ВАЖНО:**
- **НЕ МЕНЯЕТСЯ** от клиента к клиенту
- Клиентские цвета берутся из `config/brand.json`
- Остальное — стандарт для всех

**Пример:**
```typescript
// packages/design-tokens/tokens.ts
import brandConfig from '@/config/brand.json';

export const designTokens = {
  colors: {
    // Из brand config (меняется)
    brand: {
      primary: brandConfig.colors.primary,
      secondary: brandConfig.colors.secondary
    },
    
    // Семантические (не меняются)
    semantic: {
      success: '#06A77D',
      warning: '#FFB627',
      error: '#D62828'
    },
    
    // Нейтральные (не меняются)
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem'     // 48px
  },
  
  typography: {
    fontFamily: {
      heading: brandConfig.fonts.heading,
      body: brandConfig.fonts.body
    }
  }
} as const;
```

---

### `packages/adapters/` — Интеграции

**Назначение:** Адаптеры для внешних сервисов (платежи, доставка).

**Принцип:** Интерфейс + реализации.

**Пример:**
```typescript
// packages/adapters/payments/payment.interface.ts
export interface PaymentAdapter {
  createPayment(order: Order): Promise<PaymentResponse>;
  verifyWebhook(request: Request): Promise<boolean>;
  processRefund(paymentId: string, amount: number): Promise<void>;
}

// packages/adapters/payments/idram.adapter.ts
export class IdramAdapter implements PaymentAdapter {
  async createPayment(order: Order) {
    // Idram специфичная логика
  }
  
  async verifyWebhook(request: Request) {
    // Проверка подписи Idram
  }
}

// packages/adapters/payments/arca.adapter.ts
export class ArcaAdapter implements PaymentAdapter {
  async createPayment(order: Order) {
    // ArCa специфичная логика
  }
}
```

**Куда писать:**
- Новый адаптер → `adapters/category/new-adapter.ts`
- Интерфейс → `adapters/category/interface.ts`

---

## 🚀 ГДЕ ЧТО МЕНЯТЬ

### Таблица быстрого поиска:

| Что нужно сделать | Где менять | Файл |
|-------------------|-----------|------|
| Изменить цвет кнопок | Config | `config/brand.json` → primary |
| Изменить логотип | Static | `apps/web/public/logo.svg` |
| Изменить контакты | Config | `config/contact.json` |
| Добавить страницу | Frontend | `apps/web/app/(shop)/new-page/page.tsx` |
| Добавить UI компонент | UI | `packages/ui/NewComponent.tsx` |
| Добавить API endpoint | Backend | `apps/api/src/modules/*/controller.ts` |
| Изменить бизнес-логику | Domain | `packages/domain/use-cases/*.ts` |
| Добавить таблицу БД | Database | `prisma/schema.prisma` |
| Добавить метод доставки | Config | `config/shipping.json` |
| Добавить платёж провайдер | Adapter | `packages/adapters/payments/new.adapter.ts` |

---

## 🗄️ БАЗА ДАННЫХ

### Схема БД:

**Основные таблицы:**
- `products` — товары
- `product_translations` — переводы товаров (RU/AM/EN)
- `variants` — варианты (SKU, цена, остаток)
- `categories` — категории (дерево)
- `category_translations` — переводы категорий
- `orders` — заказы
- `order_items` — позиции заказа
- `order_events` — события заказа (audit log)
- `users` — пользователи
- `addresses` — адреса доставки
- `carts` — корзины
- `cart_items` — товары в корзине
- `payments` — платежи
- `coupons` — купоны
- `brands` — бренды
- `attributes` — атрибуты (размер, цвет)

**Детальная схема:** см. файл ТЗ раздел 4.2

---

### Миграции Prisma:

```bash
# Создать миграцию
npx prisma migrate dev --name add_products_table

# Применить миграции (production)
npx prisma migrate deploy

# Сгенерировать Prisma client
npx prisma generate

# Открыть Prisma Studio (GUI для БД)
npx prisma studio
```

---

## 🎨 DESIGN TOKENS

### Как используются токены:

```typescript
// 1. Design tokens определены
// packages/design-tokens/tokens.ts
export const designTokens = {
  colors: { primary: '#FF6B35' },
  spacing: { md: '1rem' }
}

// 2. Импортируются в Tailwind
// tailwind.config.ts
import { designTokens } from './packages/design-tokens';

export default {
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.brand.primary
      }
    }
  }
}

// 3. Используются в компонентах
// apps/web/components/ProductCard.tsx
<Button className="bg-primary">   // → #FF6B35
```

---

## 🔌 API ДИЗАЙН

### Структура API:

```
/api/v1/
  /products              GET, POST
  /products/:slug        GET, PUT, DELETE
  /categories            GET, POST
  /categories/:id        GET, PUT, DELETE
  /cart/items            POST, PATCH, DELETE
  /checkout              POST
  /orders/:number        GET
  /payments/webhook/*    POST
```

### Формат ответа:

```typescript
// Успех (200, 201)
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1
  }
}

// Ошибка (4xx, 5xx) — RFC 7807
{
  "type": "https://api.shop.am/problems/not-found",
  "title": "Product not found",
  "status": 404,
  "detail": "Product with slug 'red-shirt' does not exist"
}
```

---

## 🔄 ПОТОКИ ДАННЫХ

### Создание заказа (пример):

```
1. User action
   └─> Frontend (apps/web/checkout/page.tsx)
   
2. API call
   └─> Backend Controller (apps/api/modules/orders/controller.ts)
   
3. Validation
   └─> DTO (dto/create-order.dto.ts)
   
4. Business logic
   └─> Service (orders.service.ts)
       └─> Domain Use Case (packages/domain/use-cases/create-order.ts)
   
5. Database
   └─> Prisma ORM
       └─> PostgreSQL
   
6. Events
   └─> Event Bus (order.created)
       ├─> Email Queue (BullMQ)
       ├─> Search Indexing (Meilisearch)
       └─> Cache Invalidation (Redis)
```

---

## 📚 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### Frontend: Создание страницы

```tsx
// apps/web/app/(shop)/products/page.tsx
import { ProductCard } from '@/components/ProductCard';

export default async function ProductsPage() {
  // Server-side fetching (Next.js 15)
  const products = await fetch('http://localhost:3001/api/v1/products')
    .then(res => res.json());
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-4xl font-bold mb-8">
        Каталог товаров
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

### Backend: Создание endpoint

```typescript
// apps/api/src/modules/products/products.controller.ts
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  async findAll(@Query() query: FindProductsDto) {
    return this.service.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }
}

// apps/api/src/modules/products/products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private eventBus: EventBusService
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: dto
    });
    
    // Индексация
    await this.searchService.indexProduct(product);
    
    // Событие
    await this.eventBus.emit('product.created', { productId: product.id });
    
    return product;
  }
}
```

---

## 📋 CHECKLIST ПРИ СОЗДАНИИ НОВОЙ ФИЧИ

### Frontend (компонент/страница):
- [ ] Используешь компоненты из `packages/ui/`
- [ ] Используешь цвета из design tokens
- [ ] Нет inline styles
- [ ] Нет произвольных значений spacing
- [ ] Компонент < 200 строк (иначе разбей)
- [ ] Props имеют TypeScript типы
- [ ] Используешь memo для оптимизации (если нужно)

### Backend (API endpoint):
- [ ] Controller — тонкий слой (только роутинг)
- [ ] Service — вся логика
- [ ] DTO — валидация всех входных данных
- [ ] Используешь Prisma для БД
- [ ] Генеришь события для важных операций
- [ ] Обрабатываешь ошибки правильно
- [ ] Возвращаешь стандартный формат ответа

### Domain (бизнес-логика):
- [ ] Нет зависимостей от фреймворков
- [ ] Только чистый TypeScript
- [ ] Есть unit тесты
- [ ] Понятные имена функций

---

## ✅ SUMMARY

### Основные правила:
1. ✅ Используй готовые UI компоненты (не создавай свои)
2. ✅ Используй design tokens (не произвольные стили)
3. ✅ Следуй naming conventions (camelCase, PascalCase)
4. ✅ Пиши маленькие функции (< 50 строк)
5. ✅ Пиши маленькие файлы (< 300 строк)
6. ✅ Используй строгие TypeScript типы (никакого any)
7. ✅ Пиши тесты для бизнес-логики
8. ✅ Следуй Clean Architecture

---

**Последнее обновление:** 2025-02-07  
**Версия:** 1.0  
**Следующий review:** При появлении новых best practices
