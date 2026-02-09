# Idram: правильная версия реализации (по всей документации)

Изучены: **IDRAM_INTEGRATION_GUIDE.md**, **IDRAM_VS_BANK_INTEGRATION_SHOP.md**, официальный **Idram Merchant API** (Vpos - Doc), **IDRAM_CALLBACK_AND_DOMAINS.md**, **Idram Callback url.md**, реализация в **Bank-integration-shop** и плагины WordPress (PlanetStudio, HK Agency).

---

## 1. Что диктует официальная документация Idram

### 1.1 Параметры мерчанта (выдаёт Idram)

- **RESULT_URL** — скрипт, на который Idram шлёт **два POST** (precheck + подтверждение).
- **SUCCESS_URL** — редирект пользователя при успешной оплате.
- **FAIL_URL** — редирект при ошибке/отмене.
- **SECRET_KEY** — секрет для проверки EDP_CHECKSUM.
- **EMAIL** — уведомления при недоставке "OK".

### 1.2 Форма оплаты

- **URL:** `https://banking.idram.am/Payment/GetPayment`, метод **POST**.
- **Поля:** EDP_LANGUAGE (RU|EN|AM), EDP_REC_ACCOUNT, EDP_DESCRIPTION, EDP_AMOUNT, EDP_BILL_NO, EDP_EMAIL (опционально). Дробь в сумме — через **точку** (например `1900.00`).

### 1.3 Callback 1 — предварительная проверка (precheck)

- **Когда:** до списания средств.
- **Поля:** EDP_PRECHECK=YES, EDP_BILL_NO, EDP_REC_ACCOUNT, EDP_AMOUNT.
- **Действие мерчанта:** проверить заказ и сумму; если всё верно — ответить **"OK"** (без HTML). Иначе Idram не переведёт деньги и перенаправит на **FAIL_URL**.

### 1.4 Callback 2 — подтверждение платежа

- **Когда:** после перевода средств.
- **Поля:** EDP_BILL_NO, EDP_REC_ACCOUNT, EDP_PAYER_ACCOUNT, EDP_AMOUNT, EDP_TRANS_ID (14 символов), EDP_TRANS_DATE (dd/mm/yyyy), **EDP_CHECKSUM**.
- **Формула подписи (официально):**  
  строка = `EDP_REC_ACCOUNT:EDP_AMOUNT:SECRET_KEY:EDP_BILL_NO:EDP_PAYER_ACCOUNT:EDP_TRANS_ID:EDP_TRANS_DATE`  
  EDP_CHECKSUM = MD5(строка). В документации не указан регистр; на практике сравнивают в **верхнем регистре** (toUpperCase).
- **Безопасность:** при проверке подписи использовать **сумму из заказа в БД**, а не EDP_AMOUNT из запроса (защита от подделки).
- **Ответ:** строго **"OK"**, HTTP 200. Рекомендуемый Content-Type: **text/plain; charset=utf-8**.
- **Повторы:** Idram может слать callback повторно → обработка должна быть **идемпотентной** (повторно оплаченный заказ — снова ответ "OK").

### 1.5 Регистрация URL

Все три URL задаются техническим персоналом Idram. Для теста нужен **публичный** URL (ngrok/Vercel); localhost для RESULT_URL не подходит.

---

## 2. Рекомендуемая структура (как в Bank-integration-shop + нюансы)

### 2.1 Путь API — только с «s»

- **Правильно:** `/api/payments/idram/` (с «s»).
- В «Idram Callback url.md» и в коде Bank-integration-shop везде используется именно **payments**:  
  `RESULT_URL = .../api/payments/idram/callback`.  
  У Idram при регистрации нужно указывать этот путь; дублирование на `/api/payment/idram/` не обязательно (можно оставить редирект для обратной совместимости).

### 2.2 Модуль lib (правильная версия)

Вынести логику из API в отдельный модуль (как в Bank-integration-shop):

- **src/lib/payments/idram/config.ts** — URL формы, `getIdramCredentials()` (тест/прод по IDRAM_TEST_MODE и IDRAM_REC_ACCOUNT), `getIdramPaymentFormUrl()`.
- **src/lib/payments/idram/checksum.ts** — `md5()`, `verifyIdramChecksum(params)` с **amountFromOrder** из БД.
- **src/lib/payments/idram/types.ts** — типы формы, precheck и подтверждения.
- **src/lib/payments/idram/index.ts** — реэкспорт.

Плюсы: одна точка правды для конфига и проверки подписи, проще тесты и поддержка.

### 2.3 API routes

- **POST /api/payments/idram/init**  
  - Body: `{ orderId }`.  
  - Проверить заказ, сумму > 0.  
  - Для авторизованных пользователей — проверить `order.userId === session.user.id`.  
  - Вернуть `{ success: true, formUrl, formData }`.  
  - formData: EDP_LANGUAGE (AM/RU/EN по сайту), EDP_REC_ACCOUNT, EDP_DESCRIPTION, EDP_AMOUNT (toFixed(2)), EDP_BILL_NO.

- **POST /api/payments/idram/callback**  
  - Парсить `application/x-www-form-urlencoded` (formData).  
  - Precheck: проверить EDP_REC_ACCOUNT, наличие заказа, совпадение суммы (допуск 0.01). Опционально обновить order (например paymentStatus = PENDING). Ответ: **"OK"**, 200, Content-Type: text/plain; charset=utf-8.  
  - Подтверждение: проверить EDP_REC_ACCOUNT, заказ, сумму, **verifyIdramChecksum** (сумма из order). При неверной подписи — обновить статус на FAILED и вернуть ошибку. При уже оплаченном заказе — снова "OK". Иначе — обновить order (status CONFIRMED, paymentStatus SUCCESS/PAID, сохранить EDP_TRANS_ID). Ответ: "OK", 200.

### 2.4 URL возврата пользователя (SUCCESS_URL / FAIL_URL)

По документации и примеру из Bank-integration-shop:

- **SUCCESS_URL:** `https://yourdomain.com/order-success?clearCart=true`  
  Idram может добавить к редиректу свои параметры (например EDP_BILL_NO).
- **FAIL_URL:** `https://yourdomain.com/order-success?error=payment_failed`  
  При необходимости можно добавить `&EDP_BILL_NO=...` если Idram передаёт.

То есть **одна страница order-success** обрабатывает и успех, и ошибку по query.

### 2.5 Страница order-success (правильная версия)

- Читать **searchParams**: `error`, `orderId`, `EDP_BILL_NO`, `message`, `clearCart`.
- **hasError = !!error** (в т.ч. `error=payment_failed`).
- Если **hasError** — показывать блок «Ошибка оплаты», текст из `message` (если есть), кнопка «Попробовать снова» → `/checkout`.
- Если **!hasError** — показывать «Заказ успешно оформлен»; при наличии orderId/EDP_BILL_NO можно подгрузить заказ из API и показать статус.
- **Корзину очищать** только при успехе: `!error && clearCart=true`. Поэтому в SUCCESS_URL обязательно передавать `clearCart=true`.

Отдельные страницы `/payment/success` и `/payment/failed` не обязаны по документации Idram; они могут остаться как альтернативные URL для SUCCESS_URL/FAIL_URL, но тогда нужно либо дублировать логику, либо редиректить на order-success с нужными query (как сейчас при error=payment_failed редирект на /payment/failed — допустимо, но единая страница order-success проще и совпадает с эталоном).

### 2.6 Checkout

- Создать заказ `POST /api/orders` с `paymentMethod: 'idram'`.
- Вызвать `POST /api/payments/idram/init` с `{ orderId: order.id }`.
- По ответу: `clearCart()`, создать форму (action=formUrl, method=POST), заполнить поля из formData, submit().

### 2.7 База данных (Order)

Минимум для Idram:

- **paymentStatus** — статус оплаты: PENDING / SUCCESS (или PAID) / FAILED. Лучше enum в Prisma (PENDING, SUCCESS, FAILED, REFUNDED, CANCELLED) для единообразия с админкой и другими банками.
- **paymentId** или **paymentTransactionId** — строка EDP_TRANS_ID (14 символов) для связи с Idram и возможного возврата.

Дополнительно можно хранить **paymentData** (Json) с payerAccount, transDate, amount — по желанию.

### 2.8 Переменные окружения

- IDRAM_TEST_MODE — true для теста.
- IDRAM_TEST_REC_ACCOUNT, IDRAM_TEST_SECRET_KEY — тестовые.
- IDRAM_REC_ACCOUNT, IDRAM_SECRET_KEY — продакшн.
- IDRAM_EMAIL — опционально для формы/уведомлений.

RESULT_URL, SUCCESS_URL, FAIL_URL не хранятся в .env в явном виде — они формируются от base URL приложения и регистрируются у Idram.

---

## 3. Нюансы, которые обязательно учитывать

1. **Путь callback** — у Idram зарегистрирован **/api/payments/idram/callback**. Если в коде только `/api/payment/idram/callback` (без «s») — callback будет 404. Нужен маршрут именно по тому пути, который указан при регистрации.
2. **Ответ callback** — ровно строка **"OK"**, без пробелов и HTML, HTTP 200, Content-Type: text/plain; charset=utf-8. Иначе Idram может отменить или повторить платёж.
3. **Подпись** — считать по формуле из официального API; для проверки брать **сумму из заказа в БД**, не из запроса.
4. **Идемпотентность** — при повторном callback с тем же оплаченным заказом снова вернуть "OK".
5. **SUCCESS_URL** — передавать `clearCart=true`, чтобы на order-success очистить корзину только после успешной оплаты.
6. **FAIL_URL** — передавать `error=payment_failed`, чтобы order-success показал ошибку, а не успех.
7. **Валюта** — только AMD; сумма в формате с точкой (например "1900.00").
8. **Precheck** — не обновлять заказ в БД не обязательно; обновление до PENDING допустимо для отображения в админке.

---

## 4. Итог: какая версия считается правильной

**Правильная реализация** — та, которая:

- использует **один зарегистрированный путь** `/api/payments/idram/` (init + callback);
- выносит конфиг и проверку подписи в **lib/payments/idram**;
- в callback отвечает строго **"OK"** / text/plain при успехе и проверяет подпись по **сумме из БД**;
- использует **одну страницу order-success** с параметрами `error`, `clearCart`, `EDP_BILL_NO` и по ним показывает успех или ошибку и очищает корзину только при успехе;
- в SUCCESS_URL передаёт `clearCart=true`, в FAIL_URL — `error=payment_failed`;
- в init при наличии сессии проверяет владельца заказа.

Текущий welcomebaby.am уже близок к этому; для «полностью правильной» версии стоит: привести путь к **/api/payments/idram/** везде, добавить модуль **lib/payments/idram**, унифицировать order-success под один сценарий с Bank-integration-shop и зарегистрировать у Idram URL как в разделе 2.4.
