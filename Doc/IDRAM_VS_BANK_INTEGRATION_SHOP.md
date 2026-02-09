# Сравнение: Idram в Bank-integration-shop и в welcomebaby.am

## 1. Структура в Bank-integration-shop

### 1.1 Модуль `src/lib/payments/idram/`

Логика вынесена в отдельный модуль (без дублирования в API):

| Файл | Назначение |
|------|------------|
| **config.ts** | `IDRAM_CONFIG` (paymentFormUrl), `getIdramCredentials()`, `getIdramPaymentFormUrl()`. Тест/прод по `IDRAM_TEST_MODE` и наличию `IDRAM_REC_ACCOUNT`. |
| **checksum.ts** | `md5()`, `verifyIdramChecksum()` — проверка EDP_CHECKSUM (сумма из заказа в БД). |
| **types.ts** | `IdramPaymentFormParams`, `IdramPrecheckParams`, `IdramPaymentConfirmParams`. |
| **index.ts** | Реэкспорт всего модуля. |

### 1.2 API Routes — путь `/api/payments/idram/` (с «s»)

- **POST /api/payments/idram/init**  
  Принимает `{ orderId }`. Проверка сессии (заказ принадлежит пользователю). Использует `getIdramCredentials()`, `getIdramPaymentFormUrl()`. Возвращает `{ success: true, formUrl, formData }`. Язык формы `EDP_LANGUAGE: 'RU'`.
- **POST /api/payments/idram/callback**  
  Один маршрут по RESULT_URL. Использует `getIdramCredentials()`, `verifyIdramChecksum()` из `@/lib/payments/idram`. Ответы: `PLAIN_OK()` / `PLAIN_ERROR()`. При подтверждении: `paymentStatus: PaymentStatus.SUCCESS`, `paymentTransactionId: transId`, `status: 'CONFIRMED'`. Идемпотентность по `order.paymentStatus === PaymentStatus.SUCCESS`.

Отдельной страницы `/payment/failed` нет — всё на **order-success**.

### 1.3 Prisma (Bank-integration-shop)

```prisma
model Order {
  ...
  paymentStatus        PaymentStatus?   // enum: PENDING | SUCCESS | FAILED | REFUNDED | CANCELLED
  paymentTransactionId String?         // EDP_TRANS_ID
  // нет paymentData (Json)
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
  CANCELLED
}
```

Нет `deliveryTypeId`, есть только `deliveryTime` (string).

### 1.4 Checkout (Bank-integration-shop)

- Создание заказа: `POST /api/orders` с `paymentMethod: 'idram'`.
- Для Idram: `POST /api/payments/idram/init` с `{ orderId: order.id }` → `clearCart()` → создание `<form>` с `formUrl` и `formData` → `form.submit()`.
- Ответ init: `{ success, formUrl, formData }` (у них есть поле `success`).

### 1.5 order-success (Bank-integration-shop)

- **Одна страница** для успеха и ошибки.
- Читает `searchParams`: `error`, `orderId`, `EDP_BILL_NO`, `message`, `responseCode`, `clearCart`.
- **hasError = !!error** (в т.ч. `error=payment_failed`).
- При **hasError** — красный блок «Ошибка при оплате», текст из `message`, кнопка «Попробовать снова» → `/checkout`.
- При успехе — зелёный блок, при наличии `orderId`/`EDP_BILL_NO` подгружает заказ из `/api/orders` и показывает статус.
- Корзину очищают только если **!error && clearCart=true** (при успешном возврате с Idram нужно передавать `clearCart=true` в SUCCESS_URL).

---

## 2. Отличия welcomebaby.am

| Аспект | Bank-integration-shop | welcomebaby.am |
|--------|------------------------|----------------|
| **Путь API** | Только `/api/payments/idram/` (с «s») | `/api/payment/idram/` + дубль `/api/payments/idram/callback` (для Idram с «s») |
| **Модуль lib** | `src/lib/payments/idram/` (config, checksum, types) | Логика в API route (callback), без отдельного модуля |
| **PaymentStatus** | Enum `PENDING \| SUCCESS \| FAILED \| REFUNDED \| CANCELLED` | Строки `'PENDING' \| 'PAID' \| 'FAILED'` в поле `paymentStatus` |
| **Order** | `paymentTransactionId` (string) | `paymentId` + `paymentData` (Json) |
| **order-success** | Одна страница: по `error` показывается успех или ошибка | Отдельно: при `error=payment_failed` редирект на `/payment/failed` |
| **Страница ошибки** | Нет отдельной | Есть `/payment/success` и `/payment/failed` |
| **Init ответ** | `{ success: true, formUrl, formData }` | `{ formUrl, formData }` |
| **Проверка заказа в init** | Проверка, что заказ принадлежит пользователю (session) | Нет проверки владельца заказа |

---

## 3. Что можно перенести из Bank-integration-shop в welcomebaby.am

1. **Модуль `src/lib/payments/idram/`** — вынести config, checksum, types и использовать в API routes (меньше дублирования, проще тесты).
2. **Единый путь** — оставить только `/api/payments/idram/` (как в Bank-integration-shop), зарегистрировать у Idram именно его; при желании оставить редирект со старого `/api/payment/idram/callback` на новый.
3. **order-success как одна страница** — по `error` показывать успех или ошибку (как там), без редиректа на `/payment/failed`; при необходимости оставить `/payment/failed` только как альтернативный URL для Idram FAIL_URL.
4. **Проверка владельца заказа в init** — для авторизованных пользователей проверять `order.userId === session.user.id`.
5. **Enum PaymentStatus в Prisma** — опционально: ввести enum вместо строк для единообразия с Bank-integration-shop и админкой.

Файлы для ориентира в Bank-integration-shop:
- `src/lib/payments/idram/*`
- `src/app/api/payments/idram/init/route.ts`
- `src/app/api/payments/idram/callback/route.ts`
- `src/app/order-success/page.tsx`
- `src/app/checkout/page.tsx` (блок idram и ameriabank)
