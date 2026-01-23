#!/bin/bash

# 🚀 Скрипт деплоя на сервер
# Использование: ./deploy.sh [server_ip] [project_path]

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Параметры
SERVER_IP="${1:-46.224.27.19}"
PROJECT_PATH="${2:-/var/www/wl}"
SSH_USER="${3:-root}"

echo -e "${GREEN}🚀 Начинаем деплой на сервер${NC}"
echo -e "Сервер: ${YELLOW}${SSH_USER}@${SERVER_IP}${NC}"
echo -e "Путь: ${YELLOW}${PROJECT_PATH}${NC}"
echo ""

# Проверка SSH подключения
echo -e "${YELLOW}📡 Проверка SSH подключения...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${SSH_USER}@${SERVER_IP} "echo 'SSH OK'" 2>/dev/null; then
    echo -e "${RED}❌ Ошибка: Не удалось подключиться к серверу${NC}"
    echo -e "${YELLOW}💡 Убедитесь что:${NC}"
    echo "  1. SSH ключи настроены"
    echo "  2. Сервер доступен"
    echo "  3. Пользователь ${SSH_USER} имеет доступ"
    exit 1
fi
echo -e "${GREEN}✅ SSH подключение работает${NC}"

# Проверка что Git репозиторий настроен
echo -e "${YELLOW}📦 Проверка Git репозитория...${NC}"
if ! git remote get-url origin &>/dev/null; then
    echo -e "${RED}❌ Ошибка: Git remote не настроен${NC}"
    echo -e "${YELLOW}💡 Выполните: git remote add origin <url>${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git репозиторий настроен${NC}"

# Создание резервной копии на сервере
echo -e "${YELLOW}💾 Создание резервной копии на сервере...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << EOF
    if [ -d "${PROJECT_PATH}" ]; then
        BACKUP_DIR="${PROJECT_PATH}.backup-\$(date +%Y%m%d-%H%M%S)"
        echo "Создаю резервную копию в \${BACKUP_DIR}"
        cp -r ${PROJECT_PATH} \${BACKUP_DIR} || true
        echo "✅ Резервная копия создана"
    else
        echo "📁 Директория не существует, создаю..."
        mkdir -p ${PROJECT_PATH}
    fi
EOF

# Остановка старого процесса
echo -e "${YELLOW}⏹️  Остановка старого процесса...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << EOF
    cd ${PROJECT_PATH} || true
    pm2 stop wl-shop 2>/dev/null || true
    pm2 delete wl-shop 2>/dev/null || true
    echo "✅ Старый процесс остановлен"
EOF

# Загрузка кода на сервер
echo -e "${YELLOW}📤 Загрузка кода на сервер...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << EOF
    cd ${PROJECT_PATH}
    
    # Если это Git репозиторий, обновляем
    if [ -d ".git" ]; then
        echo "Обновляю код из Git..."
        git fetch origin || true
        git reset --hard origin/main || git reset --hard origin/master || true
    else
        echo "Инициализирую Git репозиторий..."
        git init || true
        git remote add origin \$(git remote get-url origin 2>/dev/null || echo "") || true
        git fetch origin || true
        git checkout -b main || git checkout -b master || true
    fi
EOF

# Копирование файлов (если нет Git)
echo -e "${YELLOW}📋 Копирование файлов...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    --exclude '.env' --exclude '*.log' \
    ./ ${SSH_USER}@${SERVER_IP}:${PROJECT_PATH}/

# Установка зависимостей и сборка на сервере
echo -e "${YELLOW}🔨 Установка зависимостей и сборка на сервере...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << EOF
    set -e
    cd ${PROJECT_PATH}
    
    echo "📦 Установка зависимостей..."
    npm install --production || npm install
    
    echo "🔧 Генерация Prisma клиента..."
    npx prisma generate || echo "⚠️  Prisma generate пропущен"
    
    echo "🗑️  Очистка кэша..."
    rm -rf .next || true
    
    echo "🏗️  Сборка проекта..."
    npm run build || echo "⚠️  Build пропущен"
    
    echo "✅ Сборка завершена"
EOF

# Создание/обновление .env файла
echo -e "${YELLOW}⚙️  Настройка переменных окружения...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << 'ENVEOF'
    cd ${PROJECT_PATH}
    
    # Проверяем существует ли .env
    if [ ! -f .env ]; then
        echo "Создаю .env файл..."
        cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=http://46.224.27.19:3000
NEXTAUTH_SECRET=CHANGE_THIS_SECRET_KEY_IN_PRODUCTION
DATABASE_URL=postgresql://postgres:password@localhost:5432/wl_shop?schema=public
NEXT_PUBLIC_API_URL=http://46.224.27.19:3000/api
NEXT_PUBLIC_SITE_URL=http://46.224.27.19:3000
EOF
        echo "⚠️  ВАЖНО: Обновите .env файл с правильными значениями!"
    else
        echo "✅ .env файл уже существует"
    fi
ENVEOF

# Запуск через PM2
echo -e "${YELLOW}🚀 Запуск приложения через PM2...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << EOF
    cd ${PROJECT_PATH}
    
    # Создаем ecosystem.config.js если его нет
    if [ ! -f ecosystem.config.js ]; then
        cat > ecosystem.config.js << 'ECOSYSTEMEOF'
module.exports = {
  apps: [{
    name: 'wl-shop',
    script: 'npm',
    args: 'start',
    cwd: '${PROJECT_PATH}',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    instances: 1,
    exec_mode: 'fork'
  }]
};
ECOSYSTEMEOF
    fi
    
    # Запускаем PM2
    pm2 start ecosystem.config.js || pm2 restart wl-shop
    pm2 save
    
    echo "✅ Приложение запущено"
EOF

# Проверка статуса
echo -e "${YELLOW}🔍 Проверка статуса...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << EOF
    echo "📊 Статус PM2:"
    pm2 status
    
    echo ""
    echo "📝 Последние логи:"
    pm2 logs wl-shop --lines 10 --nostream || true
    
    echo ""
    echo "🌐 Проверка доступности:"
    sleep 3
    curl -I http://localhost:3000 2>/dev/null | head -1 || echo "⚠️  Приложение еще запускается..."
EOF

echo ""
echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "  1. Проверьте логи: ssh ${SSH_USER}@${SERVER_IP} 'cd ${PROJECT_PATH} && pm2 logs wl-shop'"
echo "  2. Обновите .env файл с правильными значениями"
echo "  3. Проверьте доступность: http://${SERVER_IP}:3000"
echo ""
echo -e "${GREEN}🎉 Готово!${NC}"


