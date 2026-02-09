#!/bin/bash

# Скрипт для исправления конфигурации Nginx на сервере
# Использование: ./fix-nginx-on-server.sh

SSH_HOST="server"  # или "root@46.224.27.19"

echo "🔧 Исправляем конфигурацию Nginx на сервере..."

# Обновление конфигурации Nginx на сервере
ssh ${SSH_HOST} << 'ENDSSH'
# Обновить конфигурацию Nginx
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

    # Статические файлы (изображения, шрифты, CSS, JS)
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

# Активировать конфигурацию
ln -sf /etc/nginx/sites-available/welcomebaby.neetrino.com /etc/nginx/sites-enabled/

# Проверить конфигурацию
echo "Проверяем конфигурацию Nginx..."
nginx -t

# Перезагрузить Nginx
if [ $? -eq 0 ]; then
    echo "Перезагружаем Nginx..."
    systemctl reload nginx
    echo "✅ Nginx обновлен!"
else
    echo "❌ Ошибка в конфигурации Nginx!"
    exit 1
fi

# Обновить переменные окружения проекта (если проект существует)
if [ -d "/var/www/welcomebaby.neetrino.com" ]; then
    echo "Обновляем переменные окружения проекта..."
    cd /var/www/welcomebaby.neetrino.com
    
    # Обновить .env
    if [ -f .env ]; then
        # Добавить или обновить переменные
        grep -q "NEXTAUTH_URL=" .env && \
            sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://welcomebaby.neetrino.com|' .env || \
            echo "NEXTAUTH_URL=https://welcomebaby.neetrino.com" >> .env
        
        grep -q "NEXT_PUBLIC_API_URL=" .env && \
            sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://welcomebaby.neetrino.com/api|' .env || \
            echo "NEXT_PUBLIC_API_URL=https://welcomebaby.neetrino.com/api" >> .env
        
        grep -q "NEXT_PUBLIC_SITE_URL=" .env && \
            sed -i 's|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://welcomebaby.neetrino.com|' .env || \
            echo "NEXT_PUBLIC_SITE_URL=https://welcomebaby.neetrino.com" >> .env
        
        echo "✅ Переменные окружения обновлены"
    fi
    
    # Перезапустить PM2 процесс (если используется)
    if command -v pm2 &> /dev/null; then
        echo "Перезапускаем PM2 процессы..."
        pm2 restart all || true
        echo "✅ PM2 процессы перезапущены"
    fi
fi

echo ""
echo "🎉 Готово! Проверьте https://welcomebaby.neetrino.com/"
echo "💡 Не забудьте очистить кэш браузера (Ctrl + Shift + R)"
ENDSSH

echo ""
echo "✅ Скрипт выполнен!"

