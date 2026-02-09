# DEPLOYMENT (Деплой на сервер)

> **Цель:** Безошибочный процесс деплоя проекта на production сервер.

---

## 🎯 ОБЩАЯ СХЕМА ДЕПЛОЯ

```
Разработка → GitHub → GitHub Actions → Docker Registry → VPS → Production
```

**Или ручной деплой:**
```
Разработка → Git push → SSH на VPS → Pull → Build → PM2/Docker restart
```

---

## 🖥️ ТРЕБОВАНИЯ К СЕРВЕРУ

### Минимальные требования (production):

**VPS характеристики:**
- **OS**: Ubuntu 22.04 LTS (рекомендуется)
- **CPU**: 8 vCPU (минимум 4 vCPU)
- **RAM**: 16GB (минимум 8GB)
- **Disk**: 100GB SSD (минимум 50GB)
- **Network**: 1 Gbps

**Software:**
- Docker 24.x
- Docker Compose 2.x
- Nginx 1.24+
- Let's Encrypt (для SSL)
- PM2 (если без Docker) или Docker Swarm

**Порты:**
- 80 (HTTP) → Nginx
- 443 (HTTPS) → Nginx
- 3000 (Next.js web)
- 3001 (NestJS api)
- 5432 (PostgreSQL) — только localhost
- 6379 (Redis) — только localhost
- 7700 (Meilisearch) — только localhost

---

## 📦 ПЕРВИЧНАЯ НАСТРОЙКА VPS (один раз)

### Шаг 1: Подготовка сервера

```bash
# 1. Подключиться к серверу
ssh root@your-server-ip

# 2. Обновить систему
apt update && apt upgrade -y

# 3. Создать пользователя для деплоя
adduser deployer
usermod -aG sudo deployer

# 4. Настроить SSH для deployer
mkdir -p /home/deployer/.ssh
cp /root/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys

# 5. Переключиться на deployer
su - deployer
```

---

### Шаг 2: Установка Docker

```bash
# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавить пользователя в группу docker
sudo usermod -aG docker deployer

# Выйти и зайти снова для применения
exit
ssh deployer@your-server-ip

# Проверить
docker --version
docker compose version
```

---

### Шаг 3: Установка и настройка Nginx

```bash
# Установить Nginx
sudo apt install nginx -y

# Проверить статус
sudo systemctl status nginx

# Включить автозапуск
sudo systemctl enable nginx
```

---

### Шаг 4: Установка SSL (Let's Encrypt)

```bash
# Установить Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получить сертификат (замени на свой домен)
sudo certbot --nginx -d shop.am -d www.shop.am

# Автопродление (добавится автоматически в cron)
sudo systemctl status certbot.timer
```

---

## 🚀 ПРОЦЕСС ДЕПЛОЯ

### Вариант A: Автоматический (GitHub Actions) — рекомендуется

**Настройка один раз:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker compose build
          
      - name: Push to registry
        run: |
          docker compose push
          
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deployer
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/shop
            docker compose pull
            docker compose up -d
```

**Процесс:**
1. Push в `main` ветку
2. GitHub Actions запускается автоматически
3. Тесты проходят
4. Docker images собираются
5. Push в Docker Registry
6. SSH на VPS
7. Pull новых images
8. Restart контейнеров
9. Health check

---

### Вариант B: Ручной деплой (через SSH)

**Шаг 1: Подготовка**
```bash
# 1. Подключиться к серверу
ssh deployer@your-server-ip

# 2. Перейти в папку проекта
cd /var/www/shop

# 3. Создать резервную копию (ОБЯЗАТЕЛЬНО!)
cp -r /var/www/shop /var/www/shop.backup-$(date +%Y%m%d-%H%M%S)
```

**Шаг 2: Обновление кода**
```bash
# 1. Остановить приложение
docker compose down
# или для PM2:
pm2 stop shop-web shop-api

# 2. Обновить код
git pull origin main

# 3. Удалить конфликтующие файлы
rm -f apps/web/.env.local
rm -f apps/api/.env.local
rm -rf apps/web/.next
```

**Шаг 3: Установка зависимостей**
```bash
# Установить зависимости
npm install

# Сгенерировать Prisma client (КРИТИЧНО!)
npx prisma generate
```

**Шаг 4: База данных**
```bash
# Применить миграции
npx prisma migrate deploy

# Проверить БД
npx prisma db push --preview-feature
```

**Шаг 5: Сборка**
```bash
# Собрать проекты
npm run build

# Или через Docker
docker compose build
```

**Шаг 6: Запуск**
```bash
# Через Docker (рекомендуется)
docker compose up -d

# Или через PM2
pm2 restart shop-web shop-api

# Проверить статус
docker compose ps
# или
pm2 status
```

**Шаг 7: Проверка**
```bash
# Проверить health endpoint
curl http://localhost:3001/api/health

# Проверить главную страницу
curl -I http://localhost:3000

# Проверить логи
docker compose logs -f web api
# или
pm2 logs shop-web --lines 20
```

---

## 🔄 BLUE-GREEN DEPLOYMENT (zero-downtime)

### Стратегия:

```
1. Текущая версия работает (green)
2. Запускаем новую версию параллельно (blue)
3. Health check новой версии
4. Переключаем трафик на новую версию
5. Останавливаем старую версию
```

### Реализация через Docker:

```yaml
# docker-compose.yml
services:
  web-v1:
    image: shop/web:${VERSION:-latest}
    container_name: shop-web-v1
    labels:
      - "traefik.http.routers.web-v1.priority=1"
  
  web-v2:
    image: shop/web:${VERSION:-latest}
    container_name: shop-web-v2
    labels:
      - "traefik.enable=false"  # выключен до готовности
```

```bash
# Скрипт деплоя с blue-green
#!/bin/bash
# scripts/deploy-blue-green.sh

# 1. Собрать новую версию (blue)
docker compose build web-v2

# 2. Запустить blue (без трафика)
docker compose up -d web-v2

# 3. Health check
sleep 10
curl -f http://localhost:3002/api/health || exit 1

# 4. Переключить трафик на blue
docker exec traefik \
  traefik dynamic update \
  --entrypoint web-v2

# 5. Остановить green
docker compose stop web-v1

# 6. Переименовать для следующего деплоя
docker tag shop/web:v2 shop/web:v1
```

---

## 🔙 ROLLBACK (откат версии)

### Быстрый откат:

```bash
# Вариант 1: Откат через Git
cd /var/www/shop
git log --oneline -5           # найти нужный коммит
git revert abc123              # откатить изменения
npm run build
docker compose restart

# Вариант 2: Откат через backup
sudo rm -rf /var/www/shop
sudo cp -r /var/www/shop.backup-20250207-143000 /var/www/shop
cd /var/www/shop
docker compose up -d

# Вариант 3: Откат через Docker image tag
docker compose down
docker tag shop/web:previous shop/web:latest
docker compose up -d
```

---

## 📊 МОНИТОРИНГ ПОСЛЕ ДЕПЛОЯ

### Первые 30 минут (критично!):

```bash
# 1. Проверить статус контейнеров
docker compose ps
# Все должны быть UP

# 2. Проверить логи на ошибки
docker compose logs -f --tail=100
# Не должно быть ошибок

# 3. Проверить API
curl https://shop.am/api/health
# Должен вернуть 200 OK

# 4. Проверить БД подключение
docker exec shop-api npx prisma db pull --preview-feature
# Должно работать без ошибок

# 5. Проверить Redis
docker exec shop-redis redis-cli ping
# Должен вернуть PONG

# 6. Проверить Meilisearch
curl http://localhost:7700/health
# Должен вернуть {"status": "available"}

# 7. Smoke test критичных флоу
curl https://shop.am/
curl https://shop.am/api/v1/products
curl https://shop.am/api/v1/categories/tree
```

### Grafana dashboards:
- Открыть: `https://grafana.shop.am/d/overview`
- Проверить метрики:
  - Error rate < 0.1%
  - Response time p95 < 800ms
  - CPU < 70%
  - Memory < 80%

### Telegram alerts:
- Подключиться к `@shop_alerts_bot`
- Проверить что нет критичных алертов

---

## 🚨 ЧАСТЫЕ ПРОБЛЕМЫ ПРИ ДЕПЛОЕ

### ❌ Проблема 1: "Container не запускается"

**Симптомы:**
```bash
docker compose ps
# shop-web   Exited (1)
```

**Решение:**
```bash
# Посмотреть логи
docker compose logs web

# Частые причины:
# 1. Неправильный .env
cat .env

# 2. Порт занят
sudo netstat -tlnp | grep :3000

# 3. Нет миграций БД
docker exec shop-api npx prisma migrate deploy
```

---

### ❌ Проблема 2: "Database connection failed"

**Симптомы:**
```
Error: Authentication failed against database server
```

**Решение:**
```bash
# 1. Проверить DATABASE_URL
echo $DATABASE_URL

# 2. Проверить что PostgreSQL запущен
docker ps | grep postgres

# 3. Проверить логи PostgreSQL
docker logs shop-postgres

# 4. Проверить пользователя и права
docker exec shop-postgres psql -U postgres -c "\du"
```

---

### ❌ Проблема 3: "502 Bad Gateway"

**Симптомы:**
```
Nginx возвращает 502 при обращении к сайту
```

**Решение:**
```bash
# 1. Проверить что приложение запущено
docker ps | grep shop-web

# 2. Проверить порт в nginx конфиге
cat /etc/nginx/sites-available/shop.am | grep proxy_pass
# Должно быть: proxy_pass http://localhost:3000;

# 3. Проверить что приложение слушает на правильном порту
curl http://localhost:3000

# 4. Перезагрузить nginx
sudo systemctl reload nginx
```

---

### ❌ Проблема 4: "Out of memory"

**Симптомы:**
```
docker logs shop-web
# JavaScript heap out of memory
```

**Решение:**
```bash
# 1. Увеличить лимит памяти для Node.js
# В docker-compose.yml:
environment:
  NODE_OPTIONS: "--max-old-space-size=4096"

# 2. Увеличить лимит для контейнера
# В docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 2G

# 3. Перезапустить
docker compose up -d
```

---

### ❌ Проблема 5: "Порт уже занят"

**Симптомы:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Решение:**
```bash
# 1. Найти что использует порт
sudo netstat -tlnp | grep :3000

# 2. Остановить процесс
sudo kill -9 <PID>

# 3. Или изменить порт в .env
PORT=3002

# 4. Перезапустить
docker compose up -d
```

---

## 📋 CHECKLIST ДЕПЛОЯ

### Перед деплоем:

- [ ] Все тесты зелёные в CI
- [ ] Code review сделан и approved
- [ ] Миграции БД протестированы на staging
- [ ] .env обновлён (если нужно)
- [ ] Бэкап БД сделан (ОБЯЗАТЕЛЬНО!)
- [ ] Команда уведомлена о деплое
- [ ] Мониторинг открыт (Grafana)
- [ ] Rollback plan готов

---

### Во время деплоя:

- [ ] Git pull выполнен
- [ ] npm install выполнен
- [ ] npx prisma generate выполнен
- [ ] Миграции БД применены
- [ ] Кэш Next.js очищен (rm -rf .next)
- [ ] npm run build успешен
- [ ] Контейнеры/PM2 перезапущены
- [ ] Health check прошёл

---

### После деплоя (30 минут мониторинга):

- [ ] Приложение доступно (https://shop.am)
- [ ] API работает (GET /api/v1/products)
- [ ] Нет ошибок 5xx в логах
- [ ] Response time p95 < 800ms (Grafana)
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Database connections < 80% лимита
- [ ] Queue не растёт (BullMQ dashboard)
- [ ] Критичные флоу работают:
  - [ ] Browse products
  - [ ] Add to cart
  - [ ] Checkout
  - [ ] Payment (test)

---

## 🔧 КОНФИГУРАЦИЯ NGINX

### Базовая конфигурация:

```nginx
# /etc/nginx/sites-available/shop.am

# Upstream для балансировки
upstream shop_web {
    server localhost:3000;
}

upstream shop_api {
    server localhost:3001;
}

# HTTPS сервер
server {
    server_name shop.am www.shop.am;

    # Static files (Next.js)
    location /_next/static/ {
        proxy_pass http://shop_web;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://shop_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts для платежей
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Main app
    location / {
        proxy_pass http://shop_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Логи
    access_log /var/log/nginx/shop.am.access.log;
    error_log /var/log/nginx/shop.am.error.log;

    # SSL (управляется Certbot)
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/shop.am/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shop.am/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name shop.am www.shop.am;
    return 301 https://$host$request_uri;
}
```

**Активация конфига:**
```bash
# Создать symlink
sudo ln -s /etc/nginx/sites-available/shop.am /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить
sudo systemctl reload nginx
```

---

## 🐳 DOCKER COMPOSE КОНФИГУРАЦИЯ

```yaml
# docker-compose.yml (production)
version: '3.9'

services:
  web:
    image: shop/web:latest
    container_name: shop-web
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_API_URL=${API_URL}
    depends_on:
      - api
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    image: shop/api:latest
    container_name: shop-api
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - MEILI_HOST=${MEILI_HOST}
    depends_on:
      - postgres
      - redis
      - meilisearch
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    container_name: shop-postgres
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=shop
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=shop_production
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shop"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: shop-redis
    restart: always
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  meilisearch:
    image: getmeili/meilisearch:v1.6
    container_name: shop-meilisearch
    restart: always
    volumes:
      - meilisearch_data:/meili_data
    environment:
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

---

## 🔍 ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### Checklist после деплоя:

```bash
# 1. Все контейнеры запущены
docker compose ps
# Все в статусе Up

# 2. Health checks проходят
docker compose ps
# health: healthy для всех

# 3. API работает
curl https://shop.am/api/v1/products | jq '.data | length'
# Должен вернуть количество товаров

# 4. Главная страница
curl -I https://shop.am
# HTTP/2 200

# 5. SSL работает
echo | openssl s_client -connect shop.am:443 2>/dev/null | grep "Verify return code"
# Verify return code: 0 (ok)

# 6. База данных
docker exec shop-api npx prisma db pull
# Должно работать без ошибок

# 7. Redis
docker exec shop-redis redis-cli ping
# PONG

# 8. Meilisearch
curl http://localhost:7700/health | jq
# {"status": "available"}

# 9. Логи чистые
docker compose logs --since 5m | grep -i error
# Не должно быть критичных ошибок

# 10. Критичный флоу (E2E)
# Открой браузер и пройди:
# Главная → Каталог → Товар → Добавить в корзину → Checkout
```

---

## 📈 МОНИТОРИНГ

### Метрики для отслеживания:

**Производительность:**
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate (5xx errors)

**Ресурсы:**
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network (in/out)

**Приложение:**
- Active users
- Cart conversions
- Order completions
- Payment success rate

**Инфраструктура:**
- Database connections
- Redis memory usage
- Queue length (BullMQ)
- Search index size

---

## 🎯 ИТОГОВАЯ ИНСТРУКЦИЯ (кратко)

```bash
# 1. Подключиться
ssh deployer@server

# 2. Резервная копия
cd /var/www/shop
cp -r . ../shop.backup-$(date +%Y%m%d-%H%M%S)

# 3. Обновить
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy

# 4. Собрать
rm -rf apps/web/.next
npm run build

# 5. Запустить
docker compose up -d
# или PM2

# 6. Проверить
curl http://localhost:3000
docker compose logs -f
```

**Время:** 5-10 минут

---

**Создан:** 2025-02-07  
**Версия:** 1.0  
**Последний деплой:** —  
**Успешных деплоев:** 0  
**Failed деплоев:** 0
