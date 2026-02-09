# План интеграции платёжной системы IDram

> Изучены: `Doc/IDRAM_INTEGRATION_GUIDE.md`, структура проекта, checkout, API заказов, Prisma schema.  
> Референс: Bank-integration-shop (общая структура). Реализация — по гайду в проекте.

---

## 1. Текущее состояние

- **Checkout:** способы оплаты только «Կանխիկ» (cash) и «Քարտ» (card). После отправки заказа — редирект на `/order-success`.
- **Order (Prisma):** нет полей для онлайн-оплаты: `paymentStatus`, `paymentId`, `paymentData`.
- **.env:** уже есть `IDRAM_REC_ACCOUNT`, `IDRAM_SECRET_KEY` (продакшн). Тестовые данные предоставлены отдельно.
- **Типы:** в `src/types/index.ts` уже есть `PaymentMethod` с `idram`, `PAYMENT_METHODS.idram`; в checkout по факту используются только `cash` и `card`.

---

## 2. План действий (по шагам)

### Этап 1 — База данных и конфиг

| # | Задача | Детали |
|---|--------|--------|
| 1.1 | Добавить поля в модель `Order` | `paymentStatus` (String?, например `PENDING` \| `PAID` \| `FAILED`), `paymentId` (String?, Idram EDP_TRANS_ID), `paymentData` (Json?, опционально: payerAccount, transDate, amount). |
| 1.2 | Миграция Prisma | `npx prisma migrate dev --name add_order_payment_idram` |
| 1.3 | Переменные окружения | В `.env` и в `env.example` (или Doc): поддержка теста — `IDRAM_TEST_MODE`, `IDRAM_TEST_REC_ACCOUNT`, `IDRAM_TEST_SECRET_KEY`; продакшн уже есть. Для callback при необходимости: `NEXT_PUBLIC_BASE_URL` или отдельные `IDRAM_RESULT_URL`, `IDRAM_SUCCESS_URL`, `IDRAM_FAIL_URL` (если будут отличаться от дефолтных путей). |

### Этап 2 — API Idram

| # | Задача | Детали |
|---|--------|--------|
| 2.1 | **POST /api/payment/idram/init** | Принимает `{ orderId }`. Проверяет заказ, что сумма > 0, при необходимости — только AMD. Возвращает `{ formUrl, formData }` для POST на `https://banking.idram.am/Payment/GetPayment`. Учитывать `IDRAM_TEST_MODE` для выбора EDP_REC_ACCOUNT. |
| 2.2 | **POST /api/payment/idram/callback** | RESULT_URL. Обработка: 1) EDP_PRECHECK — проверка заказа/суммы/EDP_REC_ACCOUNT, ответ `"OK"` (text/plain, 200). 2) Второй POST — проверка EDP_CHECKSUM (MD5), обновление заказа (paymentStatus=PAID, paymentId, paymentData), идемпотентность (если уже PAID — снова вернуть "OK"). Ответ строго `"OK"` и 200. |

### Этап 3 — Checkout и страницы возврата

| # | Задача | Детали |
|---|--------|--------|
| 3.1 | Добавить способ оплаты «Idram» на checkout | Третий вариант в блоке «Վճարման եղանակ» (мобильный и десктоп). value=`idram`, подпись типа «Idram — վճարում Idram-ով». |
| 3.2 | Логика отправки при выборе Idram | При `paymentMethod === 'idram'`: 1) Валидация формы как сейчас. 2) POST `/api/orders` с `paymentMethod: 'idram'`. 3) POST `/api/payment/idram/init` с `orderId`. 4) По ответу — динамически создать `<form>` с `action=formUrl`, полями из `formData`, `method="POST"`, submit (редирект пользователя на Idram). Корзину очищать после успешного создания заказа (как при cash/card). |
| 3.3 | Страницы возврата | **SUCCESS:** `/payment/success` (или использовать существующую `/order-success` с query `?orderId=...` / `EDP_BILL_NO=...`). **FAIL:** `/payment/failed` с возможностью вернуться в checkout или на главную. Idram при редиректе может передавать EDP_BILL_NO — отображать номер заказа. |

### Этап 4 — Учёт Idram в заказе и отображение

| # | Задача | Детали |
|---|--------|--------|
| 4.1 | Отображение способа оплаты | В `OrderDetailsModal` и админке: добавить в `PAYMENT_LABELS`: `idram: 'Idram'` (или армянский эквивалент). |
| 4.2 | Статус оплаты в админке (опционально) | Показывать `paymentStatus` для заказов с `paymentMethod === 'idram'` (Ожидает оплаты / Оплачен / Ошибка). |

### Этап 5 — Документация и тестирование

| # | Задача | Детали |
|---|--------|--------|
| 5.1 | Обновить PROGRESS.md | Отметить выполнение интеграции Idram. |
| 5.2 | Чек-лист для теста | Локально: для callback нужен доступный извне URL (ngrok). Зарегистрировать у Idram RESULT_URL, SUCCESS_URL, FAIL_URL. Тест с тестовыми данными (IDRAM_TEST_MODE=true). |

---

## 3. Важные моменты по Idram (из гайда)

- **Callback:** только сервер-сервер; localhost для callback не подходит — нужен ngrok или деплой.
- **Ответ на callback:** строго `"OK"` (text/plain), HTTP 200; иначе Idram может отменить или повторить запрос.
- **Подпись:** `MD5(EDP_REC_ACCOUNT:EDP_AMOUNT:SECRET_KEY:EDP_BILL_NO:EDP_PAYER_ACCOUNT:EDP_TRANS_ID:EDP_TRANS_DATE)` в верхнем регистре; для проверки использовать сумму из БД, не из запроса.
- **Валюта:** только AMD.
- **Сумма:** формат `"1234.00"` (два знака после точки).

---

## 4. Переменные окружения (итог)

**Минимум для работы:**

```bash
# Режим (true = тестовый аккаунт)
IDRAM_TEST_MODE=true

# Тест (когда IDRAM_TEST_MODE=true)
IDRAM_TEST_REC_ACCOUNT=110003721
IDRAM_TEST_SECRET_KEY=r1XKnppb8YsUc9HNTylSEFKArOHr3bu4jsfikM

# Продакшн (уже в .env)
IDRAM_REC_ACCOUNT=100066396
IDRAM_SECRET_KEY=...
```

**Для callback URL (если отличны от дефолтных):**  
RESULT_URL = `{BASE}/api/payment/idram/callback`  
SUCCESS_URL = `{BASE}/payment/success`  
FAIL_URL = `{BASE}/payment/failed`  
где BASE — публичный URL сайта (на проде или ngrok для теста). Регистрация этих URL у Idram обязательна.

---

## 5. Порядок реализации (после одобрения)

1. Миграция БД (поля Order).
2. API: `/api/payment/idram/init`, `/api/payment/idram/callback`.
3. Страницы `/payment/success`, `/payment/failed`.
4. Checkout: способ «Idram» + логика редиректа на Idram.
5. Отображение способа оплаты и при необходимости paymentStatus в модалках/админке.
6. Обновить PROGRESS.md и при необходимости env.example / документацию.

После вашего одобрения этого плана можно переходить к реализации по шагам.
