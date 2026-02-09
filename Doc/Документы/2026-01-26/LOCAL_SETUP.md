# ЛОКАЛЬНЫЙ ЗАПУСК БЕЗ DOCKER

## 🚀 Быстрый старт

### 1. Установка PostgreSQL (если не установлен)

#### Windows:
1. Скачать PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Установить с настройками по умолчанию
3. Запомнить пароль для пользователя `postgres`
4. Запустить службу PostgreSQL

#### macOS:
```bash
# Через Homebrew
brew install postgresql@16
brew services start postgresql@16

# Или через Postgres.app
# Скачать с https://postgresapp.com/
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Настройка базы данных

#### Вариант A: Локальная установка PostgreSQL

```bash
# Создать базу данных
createdb detskiy_mir

# Или через psql
psql -U postgres
CREATE DATABASE detskiy_mir;
\q
```

#### Вариант B: Docker (если Docker установлен)

```bash
# Запустить PostgreSQL в Docker
docker run --name postgres-local -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=detskiy_mir -p 5432:5432 -d postgres:16

# Проверить что контейнер запущен
docker ps

# Остановить контейнер (когда не нужен)
docker stop postgres-local
docker rm postgres-local
```

### 3. Настройка переменных окружения

Создать файл `.env` на основе `env.example`:

```bash
cp env.example .env
```

Отредактировать `.env`:
```env
# Локальная конфигурация для разработки
NODE_ENV=development

# NextAuth конфигурация
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production-32-chars-min

# База данных PostgreSQL (локальная)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detskiy_mir

# API URL для фронтенда
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Дополнительные настройки
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Важно:** Замените `postgres` на ваш пароль PostgreSQL в DATABASE_URL.

### 4. Установка зависимостей и запуск

```bash
# Установить зависимости
npm install

# Применить миграции базы данных
npm run db:migrate

# Сгенерировать Prisma client
npm run db:generate

# Заполнить тестовыми данными
npm run db:seed

# Запустить приложение
npm run dev
```

### 5. Проверка работы

Откройте в браузере:
- **Главная страница:** http://localhost:3000
- **Админ-панель:** http://localhost:3000/admin
- **Prisma Studio:** `npm run db:studio` (откроется на http://localhost:5555)

## 🛠️ Полезные команды

```bash
# Работа с базой данных
npm run db:migrate   # Создать и применить миграцию
npm run db:generate  # Сгенерировать Prisma client
npm run db:studio    # Открыть GUI для БД
npm run db:seed      # Заполнить тестовыми данными
npm run db:reset     # Сбросить БД и заполнить заново
npm run db:push      # Применить изменения схемы без миграции

# Разработка
npm run dev          # Запустить в dev режиме
npm run build        # Собрать production build
npm run start        # Запустить production build
npm run lint         # Проверить код
```

## 🔧 Устранение проблем

### PostgreSQL не запускается:
```bash
# Windows: проверить службы
services.msc

# macOS: перезапустить службу
brew services restart postgresql@16

# Linux: проверить статус
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Ошибка подключения к БД:
1. Проверить что PostgreSQL запущен
2. Проверить правильность DATABASE_URL в .env
3. Проверить что база данных `detskiy_mir` существует
4. Проверить права пользователя postgres

### Ошибки миграций:
```bash
# Сбросить и пересоздать БД
npm run db:reset

# Или принудительно применить миграции
npx prisma migrate deploy
```

## 📝 Примечания

- Все данные хранятся в локальной PostgreSQL
- Нет необходимости в Docker или Redis
- Приложение работает полностью локально
- Для production можно использовать тот же подход с внешней PostgreSQL
