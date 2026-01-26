# ПРАВИЛА КОДИРОВАНИЯ

> ⚠️ **ДЛЯ AI**: Следуй этим правилам СТРОГО. Это стандарты senior developer.  
> Код должен быть чистым, единообразным, без мусора.

---

## 🎯 ГЛАВНЫЙ ПРИНЦИП

**Используй ТОЛЬКО готовые компоненты и токены. НЕ придумывай свои стили.**

---

## 🎨 UI КОМПОНЕНТЫ

### ✅ ПРАВИЛЬНО

```tsx
// Импортируй компоненты из packages/ui
import { Button, Card, Input } from '@/ui';

export function ProductCard({ product }: Props) {
  return (
    <Card>
      <img src={product.image} alt={product.title} className="w-full" />
      <h3 className="font-heading text-xl text-gray-900">{product.title}</h3>
      <p className="text-primary font-bold text-2xl">{product.price} ֏</p>
      <Button variant="primary" size="md">
        Купить
      </Button>
    </Card>
  );
}
```

### ❌ НЕПРАВИЛЬНО

```tsx
// ❌ НЕ создавай свои кнопки
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Купить
</button>

// ❌ НЕ используй inline styles  
<div style={{ backgroundColor: '#FF6B35', padding: '13px' }}>
  Content
</div>

// ❌ НЕ используй произвольные значения
<div className="p-[13px] bg-[#FF6B35]">
  Content
</div>

// ❌ НЕ создавай свои Card компоненты
<div className="bg-white border rounded-lg p-4 shadow">
  Content
</div>
```

---

## 🎨 СТИЛИ (Tailwind CSS)

### Цвета

```tsx
// ✅ ПРАВИЛЬНО - используй design tokens
<div className="bg-primary text-white">Primary button</div>
<div className="bg-secondary">Secondary background</div>
<div className="text-gray-900">Dark text</div>
<div className="border-gray-200">Light border</div>
<div className="bg-success">Success state</div>
<div className="bg-error text-white">Error state</div>

// ❌ НЕПРАВИЛЬНО
<div className="bg-blue-500">Button</div>
<div className="bg-[#FF6B35]">Background</div>
<div style={{ color: '#FF6B35' }}>Text</div>
```

**Доступные цвета:**
- `primary` / `secondary` — брендовые (из config/brand.json)
- `success` / `warning` / `error` — семантические
- `gray-{50...900}` — нейтральные для текста и фонов

---

### Spacing (отступы, размеры)

```tsx
// ✅ ПРАВИЛЬНО - используй стандартные значения Tailwind
<div className="p-4">         // padding 1rem
<div className="space-y-6">   // gap между элементами 1.5rem
<div className="gap-2">        // gap 0.5rem
<div className="mt-8">         // margin-top 2rem

// ❌ НЕПРАВИЛЬНО
<div className="p-[13px]">           // произвольное значение
<div className="space-y-[23px]">     // произвольное значение
<div style={{ padding: '13px' }}>    // inline style
```

**Стандартные значения:** 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

---

### Typography (текст)

```tsx
// ✅ ПРАВИЛЬНО
<h1 className="font-heading text-4xl font-bold text-gray-900">
  Заголовок H1
</h1>

<h2 className="font-heading text-3xl font-semibold text-gray-900">
  Заголовок H2
</h2>

<p className="font-sans text-base text-gray-700">
  Обычный текст
</p>

<span className="text-sm text-gray-500">
  Маленький текст
</span>

// ❌ НЕПРАВИЛЬНО
<h1 className="text-[32px]">Title</h1>
<p style={{ fontSize: '14px' }}>Text</p>
```

**Доступные размеры:** xs, sm, base, lg, xl, 2xl, 3xl, 4xl

---

### Border Radius (скругления)

```tsx
// ✅ ПРАВИЛЬНО
<div className="rounded-md">    // кнопки, inputs
<div className="rounded-lg">    // карточки
<div className="rounded-full">  // аватары, badges

// ❌ НЕПРАВИЛЬНО
<div className="rounded-[13px]">
<div style={{ borderRadius: '13px' }}>
```

---

## 📁 NAMING CONVENTIONS

### Файлы

```
✅ ПРАВИЛЬНО:
ProductCard.tsx           - React компонент
ProductService.ts         - сервис (NestJS)
product.types.ts          - типы TypeScript
product.dto.ts            - DTO (Data Transfer Object)
product.controller.ts     - контроллер (NestJS)
product.test.ts           - тесты
useProduct.ts             - React хук
product.utils.ts          - утилиты

❌ НЕПРАВИЛЬНО:
product_card.tsx          - используй PascalCase
productcard.tsx           - нет разделения слов
PRODUCT_CARD.tsx          - не UPPER_CASE
product-service.ts        - используй camelCase для сервисов
```

---

### Переменные и функции

```typescript
// ✅ ПРАВИЛЬНО
const userName = 'John';
const isValid = true;
const hasProducts = products.length > 0;
const totalPrice = 10000;

function getProduct(id: number) {}
function createProduct(data: CreateProductDto) {}
function updateProduct(id: number, data: UpdateProductDto) {}
function deleteProduct(id: number) {}

// Boolean getters
function isProductValid(product: Product): boolean {}
function hasStock(variant: Variant): boolean {}

// Handlers
function handleClick() {}
function handleSubmit() {}

// ❌ НЕПРАВИЛЬНО
const UserName = 'John';        // не PascalCase для переменных
const user_name = 'John';       // не snake_case
const valid = true;             // не понятно что это boolean
const products_count = 5;       // не snake_case

function get_product(id) {}     // не snake_case
function Product() {}           // компонент должен быть с большой
```

---

### Компоненты React

```tsx
// ✅ ПРАВИЛЬНО - PascalCase, named export
export function ProductCard({ product }: ProductCardProps) {
  return <div>...</div>;
}

export function ShoppingCart() {
  return <div>...</div>;
}

// ❌ НЕПРАВИЛЬНО
export function productCard() {}     // не camelCase
export default function ProductCard() {} // не default export
export const ProductCard = () => {}; // используй function declaration
```

---

### Константы

```typescript
// ✅ ПРАВИЛЬНО - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.shop.am';
const DEFAULT_PAGE_SIZE = 24;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// ❌ НЕПРАВИЛЬНО
const apiBaseUrl = 'https://api.shop.am';
const default_page_size = 24;
```

---

### Enum и Types

```typescript
// ✅ ПРАВИЛЬНО
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

type PaymentProvider = 'idram' | 'arca' | 'stripe';

interface Product {
  id: number;
  title: string;
  price: number;
}

// ❌ НЕПРАВИЛЬНО
enum orderStatus {}               // не camelCase
type payment_provider = string;   // не snake_case, не string (используй union)
```

---

## 📦 СТРУКТУРА КОМПОНЕНТА

### Правильная структура:

```tsx
// 1. Imports (сначала external, потом internal)
import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { type Product } from '@/types';

// 2. Types (interface для props)
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  variant?: 'compact' | 'full';
}

// 3. Component (используй memo для оптимизации)
export const ProductCard = memo(function ProductCard({ 
  product, 
  onAddToCart,
  variant = 'full'
}: ProductCardProps) {
  // 4. Hooks (useState, useEffect, custom hooks)
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  
  // 5. Handlers (используй useCallback для оптимизации)
  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);
  
  const handleClick = useCallback(() => {
    router.push(`/products/${product.slug}`);
  }, [product.slug, router]);
  
  // 6. Early returns (если нужно)
  if (!product.published) {
    return null;
  }
  
  // 7. Render
  return (
    <Card className={variant === 'compact' ? 'p-4' : 'p-6'}>
      <img 
        src={product.image} 
        alt={product.title}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h3 className="font-heading text-xl mt-4">{product.title}</h3>
      <p className="text-primary font-bold text-2xl mt-2">
        {product.price} ֏
      </p>
      <Button 
        variant="primary" 
        size="md"
        onClick={handleAddToCart}
        className="mt-4 w-full"
      >
        Купить
      </Button>
    </Card>
  );
});
```

---

## 🔧 TYPESCRIPT

### Типы (всегда строгие!)

```typescript
// ✅ ПРАВИЛЬНО
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

type Status = 'pending' | 'active' | 'inactive';

function processUser(user: User): void {
  console.log(user.name);
}

// ❌ НЕПРАВИЛЬНО
const user: any = {...};                  // НЕ используй any!
const status: string = 'pending';         // используй union type
function processUser(user) {}             // всегда указывай типы
```

---

### Никогда `any`

```typescript
// ✅ ПРАВИЛЬНО - используй unknown или конкретный тип
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  if (typeof data === 'number') {
    return data * 2;
  }
  throw new Error('Invalid data type');
}

// Или с generic
function processData<T>(data: T): T {
  return data;
}

// ❌ НЕПРАВИЛЬНО
function processData(data: any) {
  return data.anything(); // небезопасно!
}
```

---

### Nullability

```typescript
// ✅ ПРАВИЛЬНО
interface Product {
  id: number;
  title: string;
  description: string | null;  // может быть null
  price?: number;               // опциональное поле
}

function getProduct(id: number): Product | null {
  // ...
}

// Проверка перед использованием
const product = getProduct(123);
if (product) {
  console.log(product.title);
}

// ❌ НЕПРАВИЛЬНО
function getProduct(id): any {  // без типов
  // ...
}

const product = getProduct(123);
console.log(product.title); // может упасть если null
```

---

## 🧪 ТЕСТИРОВАНИЕ

### Что ОБЯЗАТЕЛЬНО тестировать:

✅ **Бизнес-логику** в `packages/domain/`
```typescript
// packages/domain/use-cases/calculate-total.test.ts
describe('CalculateTotal', () => {
  it('should calculate total with discount', () => {
    const result = calculateTotal({
      subtotal: 10000,
      discount: 1000,
      shipping: 500
    });
    
    expect(result).toBe(9500);
  });
});
```

✅ **API endpoints** (integration tests)
```typescript
// apps/api/src/modules/products/products.controller.spec.ts
describe('ProductsController', () => {
  it('GET /products should return list', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);
      
    expect(response.body.data).toBeArray();
  });
});
```

✅ **Утилиты**
```typescript
// apps/web/lib/format-price.test.ts
describe('formatPrice', () => {
  it('should format AMD price', () => {
    expect(formatPrice(5000, 'AMD')).toBe('5,000 ֏');
  });
});
```

### Что можно НЕ тестировать:

⚠️ Простые UI компоненты (если только рендерят данные)  
⚠️ TypeScript типы  
⚠️ Конфигурационные файлы  

---

### Шаблон теста

```typescript
// Arrange-Act-Assert паттерн

describe('ProductService', () => {
  let service: ProductService;
  
  beforeEach(() => {
    // Setup
    service = new ProductService(mockRepository);
  });
  
  it('should create product', async () => {
    // Arrange (подготовка)
    const data = { 
      title: 'Test Product',
      price: 5000
    };
    
    // Act (действие)
    const result = await service.create(data);
    
    // Assert (проверка)
    expect(result).toBeDefined();
    expect(result.title).toBe('Test Product');
    expect(result.price).toBe(5000);
  });
  
  it('should throw error for invalid data', async () => {
    const data = { title: '' }; // invalid
    
    await expect(service.create(data)).rejects.toThrow();
  });
});
```

---

## 📏 РАЗМЕРЫ И ОГРАНИЧЕНИЯ

### Функции: максимум 50 строк

```typescript
// ✅ ПРАВИЛЬНО - маленькая функция
function calculateDiscount(price: number, percent: number): number {
  return price * (percent / 100);
}

// ❌ НЕПРАВИЛЬНО - слишком длинная функция
function processOrder(order: Order) {
  // ... 100 строк кода
  // Разбей на маленькие функции!
}

// ✅ ПРАВИЛЬНО - разбивка на функции
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateTotal(order);
  const discount = applyDiscount(total, order.coupon);
  const shipping = calculateShipping(order.address);
  return createOrderRecord(order, total, discount, shipping);
}
```

---

### Файлы: максимум 300 строк

```typescript
// ✅ ПРАВИЛЬНО
// ProductCard.tsx - 150 строк
// ProductList.tsx - 100 строк
// ProductFilter.tsx - 80 строк

// ❌ НЕПРАВИЛЬНО
// Products.tsx - 500 строк (всё в одном файле)

// ✅ РЕШЕНИЕ - разбить на файлы:
// components/ProductCard.tsx
// components/ProductList.tsx
// components/ProductFilter.tsx
// components/ProductSort.tsx
```

---

### Вложенность: максимум 3 уровня

```typescript
// ✅ ПРАВИЛЬНО - early returns, guard clauses
function processPayment(order: Order) {
  if (!order) {
    throw new Error('Order is required');
  }
  
  if (order.status !== 'pending') {
    throw new Error('Order already processed');
  }
  
  if (order.total <= 0) {
    throw new Error('Invalid total');
  }
  
  // Основная логика на уровне 1
  return createPayment(order);
}

// ❌ НЕПРАВИЛЬНО - глубокая вложенность
function processPayment(order: Order) {
  if (order) {
    if (order.status === 'pending') {
      if (order.total > 0) {
        if (order.items.length > 0) {
          // слишком глубоко! (уровень 4)
          return createPayment(order);
        }
      }
    }
  }
}
```

---

## 🚫 КОД КОТОРЫЙ НЕЛЬЗЯ ПИСАТЬ

### 1. Дублирование

```typescript
// ❌ НЕПРАВИЛЬНО
function getUserName(user: User) {
  return user.name;
}

function getProductName(product: Product) {
  return product.name;
}

// ✅ ПРАВИЛЬНО - обобщи
function getName<T extends { name: string }>(entity: T): string {
  return entity.name;
}
```

---

### 2. Магические числа

```typescript
// ❌ НЕПРАВИЛЬНО
if (user.age > 18) {
  allowPurchase();
}

if (fileSize > 5242880) {
  throw new Error('File too large');
}

// ✅ ПРАВИЛЬНО
const ADULT_AGE = 18;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (user.age > ADULT_AGE) {
  allowPurchase();
}

if (fileSize > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

---

### 3. Закомментированный код

```typescript
// ❌ НЕПРАВИЛЬНО
function processOrder(order: Order) {
  // const oldTotal = order.subtotal + order.tax;
  // return oldTotal;
  
  const total = order.subtotal + order.tax + order.shipping;
  return total;
}

// ✅ ПРАВИЛЬНО - удали старый код
function processOrder(order: Order) {
  const total = order.subtotal + order.tax + order.shipping;
  return total;
}
```

---

### 4. Длинные функции

```typescript
// ❌ НЕПРАВИЛЬНО - всё в одной функции (100 строк)
async function createOrder(data: CreateOrderDto) {
  // валидация (20 строк)
  // расчёт totals (30 строк)
  // резервирование stock (20 строк)
  // создание платежа (30 строк)
}

// ✅ ПРАВИЛЬНО - разбей на функции
async function createOrder(data: CreateOrderDto) {
  await validateOrderData(data);
  const totals = calculateOrderTotals(data);
  await reserveStock(data.items);
  const payment = await initializePayment(totals);
  
  return { order, payment };
}
```

---

## 📦 СТРУКТУРА BACKEND (NestJS)

### Controller (тонкий слой)

```typescript
// ✅ ПРАВИЛЬНО
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: FindProductsDto) {
    // Только вызов сервиса, без логики
    return this.productsService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}

// ❌ НЕПРАВИЛЬНО - логика в контроллере
@Controller('products')
export class ProductsController {
  @Get()
  async findAll(@Query() query: any) { // ❌ any
    // ❌ Логика в контроллере (должна быть в сервисе)
    const products = await prisma.product.findMany({
      where: { published: true }
    });
    
    return products;
  }
}
```

---

### Service (вся бизнес-логика здесь)

```typescript
// ✅ ПРАВИЛЬНО
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
    private searchService: SearchService
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    // Валидация
    await this.validateDto(dto);
    
    // Создание
    const product = await this.repository.create(dto);
    
    // Индексация в поиске (асинхронно)
    await this.searchService.indexProduct(product);
    
    // Событие
    await this.eventBus.emit('product.created', { productId: product.id });
    
    return product;
  }
  
  private async validateDto(dto: CreateProductDto) {
    // Валидация логика
  }
}
```

---

## ✅ CHECKLIST ПЕРЕД КОММИТОМ

Перед каждым коммитом проверь:

### Код:
- [ ] Нет TypeScript ошибок (`tsc --noEmit`)
- [ ] Нет ESLint warnings (`npm run lint`)
- [ ] Используешь ТОЛЬКО UI компоненты из `@/ui`
- [ ] Используешь ТОЛЬКО цвета из design tokens
- [ ] Функции < 50 строк
- [ ] Файлы < 300 строк
- [ ] Нет вложенности > 3 уровней
- [ ] Нет дублирования
- [ ] Нет магических чисел
- [ ] Нет закомментированного кода
- [ ] Нет `any` в TypeScript
- [ ] Понятные имена переменных/функций

### Тесты:
- [ ] Написаны тесты для бизнес-логики
- [ ] Все тесты проходят (`npm test`)
- [ ] Coverage не уменьшился

### Документация:
- [ ] Обновил PROGRESS.md
- [ ] Добавил комментарии для сложной логики
- [ ] Обновил API документацию (если менял API)

### Работоспособность:
- [ ] Проект запускается (`npm run dev`)
- [ ] Нет ошибок в консоли
- [ ] Новая функциональность работает
- [ ] Не сломал существующую функциональность

---

## 💡 BEST PRACTICES

### 1. DRY (Don't Repeat Yourself)

```typescript
// ❌ НЕПРАВИЛЬНО
const userFullName = user.firstName + ' ' + user.lastName;
const productFullName = product.firstName + ' ' + product.lastName;

// ✅ ПРАВИЛЬНО
function getFullName(entity: { firstName: string; lastName: string }) {
  return `${entity.firstName} ${entity.lastName}`;
}
```

---

### 2. Single Responsibility

```typescript
// ❌ НЕПРАВИЛЬНО - функция делает слишком много
function processOrderAndSendEmail(order: Order) {
  // валидация
  // расчёт
  // сохранение
  // отправка email
  // логирование
}

// ✅ ПРАВИЛЬНО - каждая функция делает одно
async function processOrder(order: Order) {
  const validated = await validateOrder(order);
  const calculated = await calculateTotals(validated);
  const saved = await saveOrder(calculated);
  
  await sendConfirmationEmail(saved);
  await logOrderCreated(saved);
  
  return saved;
}
```

---

### 3. Явное лучше неявного

```typescript
// ❌ НЕПРАВИЛЬНО - неявное поведение
function getProducts(published) {
  // что такое published? boolean? string?
}

// ✅ ПРАВИЛЬНО - явные типы и названия
function getProducts(options: { 
  published?: boolean;
  category?: string;
  limit?: number;
}) {
  // понятно что ожидается
}

// Вызов
getProducts({ published: true, limit: 24 });
```

---

## 📋 SUMMARY

### Что ВСЕГДА делать:
1. ✅ Используй готовые UI компоненты
2. ✅ Используй design tokens для стилей
3. ✅ Следуй naming conventions
4. ✅ Пиши маленькие функции/файлы
5. ✅ Используй строгие TypeScript типы
6. ✅ Пиши тесты для логики
7. ✅ Проверяй checklist перед коммитом

### Что НИКОГДА не делать:
1. ❌ Произвольные цвета и стили
2. ❌ Inline styles
3. ❌ `any` в TypeScript
4. ❌ Дублирование кода
5. ❌ Магические числа
6. ❌ Длинные функции/файлы
7. ❌ Закомментированный код

---

**Последнее обновление:** 2025-02-07  
**Версия:** 1.0  
**Следующий review:** При появлении новых паттернов
