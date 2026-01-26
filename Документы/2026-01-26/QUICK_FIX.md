# 🚀 Быстрое исправление ошибок 404

## Проблема
Статические файлы Next.js не загружаются через домен `https://welcomebaby.neetrino.com/`

## ✅ Решение (2 способа)

### Способ 1: Автоматический (рекомендуется)

**На Windows (Git Bash или WSL):**

```bash
# Запустить скрипт
bash fix-nginx-on-server.sh
```

Скрипт автоматически:
- ✅ Обновит конфигурацию Nginx на сервере
- ✅ Добавит обработку `/_next/static/` файлов
- ✅ Обновит переменные окружения проекта
- ✅ Перезапустит Nginx и PM2

### Способ 2: Ручной (через SSH)

**Подключиться к серверу:**

```bash
ssh server
```

**Выполнить команды:**

```bash
# 1. Обновить конфигурацию Nginx
cat > /etc/nginx/sites-available/welcomebaby.neetrino.com << 'EOF'
# Редирект HTTP → HTTPS
server {
    listen 80;
    server_name welcomebaby.neetrino.com www.welcomebaby.neetrino.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    server_name welcomebaby.neetrino.com www.welcomebaby.neetrino.com;

    ssl_certificate /etc/letsencrypt/live/welcomebaby.neetrino.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/welcomebaby.neetrino.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    access_log /var/log/nginx/welcomebaby.neetrino.com.access.log;
    error_log /var/log/nginx/welcomebaby.neetrino.com.error.log;

    # КРИТИЧНО: Статические файлы Next.js
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Статические файлы
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot|css|js)$ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API роуты
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Основное приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 2. Активировать конфигурацию
ln -sf /etc/nginx/sites-available/welcomebaby.neetrino.com /etc/nginx/sites-enabled/

# 3. Проверить конфигурацию
nginx -t

# 4. Перезагрузить Nginx
systemctl reload nginx

# 5. Обновить переменные окружения проекта
cd /var/www/welcomebaby.neetrino.com
# или где находится ваш проект

# Обновить .env
cat >> .env << 'EOF'
NEXTAUTH_URL=https://welcomebaby.neetrino.com
NEXT_PUBLIC_API_URL=https://welcomebaby.neetrino.com/api
NEXT_PUBLIC_SITE_URL=https://welcomebaby.neetrino.com
EOF

# 6. Перезапустить проект
pm2 restart all

echo "✅ Готово!"
```

## 🔍 Проверка

После применения:

1. **Откройте в браузере:** https://welcomebaby.neetrino.com/
2. **Нажмите `Ctrl + Shift + R`** (жесткая перезагрузка)
3. **Откройте консоль (F12)** - ошибки 404 должны исчезнуть

## ⚠️ Важно

- Конфигурация Nginx находится на сервере, не в Git
- Изменения нужно применять через SSH на сервере
- После изменений Nginx нужно перезагрузить: `systemctl reload nginx`

## 📝 Если используется Git для деплоя

Если вы хотите автоматизировать это через Git, можно:

1. Добавить скрипт в репозиторий (например, `scripts/fix-nginx.sh`)
2. После `git pull` на сервере запускать этот скрипт
3. Или добавить в `package.json` скрипт `postinstall`, который будет обновлять Nginx

Но обычно конфигурация Nginx не хранится в Git репозитории проекта, а настраивается один раз на сервере.

