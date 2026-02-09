# 🚀 SSH команды для деплоя на сервер

> Выполняйте команды по порядку, копируя и вставляя в терминал

---

## 📋 Шаг 1: Проверка подключения

```bash
ssh root@46.224.27.19 "echo 'SSH подключение работает'"
```

---

## 📋 Шаг 2: Создание резервной копии

```bash
ssh root@46.224.27.19 "cd /var/www/wl && [ -d . ] && cp -r /var/www/wl /var/www/wl.backup-\$(date +%Y%m%d-%H%M%S) && echo 'Резервная копия создана' || echo 'Директория не существует'"
```

---

## 📋 Шаг 3: Остановка старого процесса

```bash
ssh root@46.224.27.19 "cd /var/www/wl && pm2 stop wl-shop 2>/dev/null || true && pm2 delete wl-shop 2>/dev/null || true && echo 'Старый процесс остановлен'"
```

---

## 📋 Шаг 4: Создание директории (если не существует)

```bash
ssh root@46.224.27.19 "mkdir -p /var/www/wl && echo 'Директория создана'"
```

---

## 📋 Шаг 5: Копирование файлов проекта

**Вариант A: Если используете Git на сервере**

```bash
ssh root@46.224.27.19 "cd /var/www/wl && git init 2>/dev/null || true && git remote remove origin 2>/dev/null || true && git remote add origin https://github.com/kargabrielyan/wl.git && git fetch origin && git reset --hard origin/main 2>/dev/null || git reset --hard origin/master && echo 'Код обновлен из Git'"
```

**Вариант B: Если копируете файлы локально (с вашего компьютера)**

```bash
# Сначала загрузите файлы через rsync или scp
# Windows PowerShell:
scp -r -o StrictHostKeyChecking=no ./src ./public ./prisma ./package.json ./next.config.ts ./tsconfig.json root@46.224.27.19:/var/www/wl/

# Или через rsync (если установлен):
# rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' ./ root@46.224.27.19:/var/www/wl/
```

---

## 📋 Шаг 6: Установка зависимостей

```bash
ssh root@46.224.27.19 "cd /var/www/wl && npm install --production && echo 'Зависимости установлены'"
```

---

## 📋 Шаг 7: Генерация Prisma клиента

```bash
ssh root@46.224.27.19 "cd /var/www/wl && npx prisma generate && echo 'Prisma клиент сгенерирован'"
```

---

## 📋 Шаг 8: Очистка кэша и сборка

```bash
ssh root@46.224.27.19 "cd /var/www/wl && rm -rf .next && npm run build && echo 'Проект собран'"
```

---

## 📋 Шаг 9: Создание .env файла

```bash
ssh root@46.224.27.19 "cd /var/www/wl && cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=http://46.224.27.19:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL=postgresql://postgres:password@localhost:5432/wl_shop?schema=public
NEXT_PUBLIC_API_URL=http://46.224.27.19:3000/api
NEXT_PUBLIC_SITE_URL=http://46.224.27.19:3000
EOF
echo '.env файл создан'"
```

**⚠️ ВАЖНО:** Замените `password` на реальный пароль БД и сгенерируйте `NEXTAUTH_SECRET`:

```bash
# Сгенерировать секрет локально:
openssl rand -base64 32

# Затем обновить .env:
ssh root@46.224.27.19 "cd /var/www/wl && sed -i 's/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=ВАШ_СГЕНЕРИРОВАННЫЙ_СЕКРЕТ/' .env"
```

---

## 📋 Шаг 10: Создание PM2 конфигурации

```bash
ssh root@46.224.27.19 "cd /var/www/wl && cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'wl-shop',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/wl',
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
EOF
echo 'PM2 конфигурация создана'"
```

---

## 📋 Шаг 11: Запуск через PM2

```bash
ssh root@46.224.27.19 "cd /var/www/wl && pm2 start ecosystem.config.js && pm2 save && echo 'Приложение запущено'"
```

---

## 📋 Шаг 12: Проверка статуса

```bash
ssh root@46.224.27.19 "pm2 status"
```

---

## 📋 Шаг 13: Просмотр логов

```bash
ssh root@46.224.27.19 "cd /var/www/wl && pm2 logs wl-shop --lines 20 --nostream"
```

---

## 📋 Шаг 14: Проверка доступности

```bash
ssh root@46.224.27.19 "sleep 5 && curl -I http://localhost:3000 2>/dev/null | head -1 || echo 'Приложение еще запускается...'"
```

---

## 🔄 Обновление проекта (когда нужно обновить код)

```bash
# 1. Остановить
ssh root@46.224.27.19 "cd /var/www/wl && pm2 stop wl-shop"

# 2. Обновить код (если Git)
ssh root@46.224.27.19 "cd /var/www/wl && git pull origin main"

# 3. Установить зависимости
ssh root@46.224.27.19 "cd /var/www/wl && npm install --production"

# 4. Пересобрать
ssh root@46.224.27.19 "cd /var/www/wl && rm -rf .next && npm run build"

# 5. Перезапустить
ssh root@46.224.27.19 "cd /var/www/wl && pm2 restart wl-shop"
```

---

## 🛠️ Полезные команды

### Просмотр логов в реальном времени
```bash
ssh root@46.224.27.19 "cd /var/www/wl && pm2 logs wl-shop"
```

### Перезапуск приложения
```bash
ssh root@46.224.27.19 "cd /var/www/wl && pm2 restart wl-shop"
```

### Остановка приложения
```bash
ssh root@46.224.27.19 "cd /var/www/wl && pm2 stop wl-shop"
```

### Проверка использования ресурсов
```bash
ssh root@46.224.27.19 "pm2 monit"
```

### Проверка порта 3000
```bash
ssh root@46.224.27.19 "netstat -tlnp | grep :3000"
```

### Проверка .env файла
```bash
ssh root@46.224.27.19 "cd /var/www/wl && cat .env"
```

### Проверка подключения к БД
```bash
ssh root@46.224.27.19 "cd /var/www/wl && npx prisma db pull"
```

---

## 🚨 Устранение проблем

### Если порт 3000 занят:
```bash
ssh root@46.224.27.19 "netstat -tlnp | grep :3000"
ssh root@46.224.27.19 "pm2 stop wl-shop && pm2 delete wl-shop"
```

### Если приложение не запускается:
```bash
ssh root@46.224.27.19 "cd /var/www/wl && pm2 logs wl-shop --lines 50 --nostream"
```

### Если нужно пересобрать проект:
```bash
ssh root@46.224.27.19 "cd /var/www/wl && rm -rf .next node_modules && npm install --production && npm run build"
```

### Если нужно проверить переменные окружения:
```bash
ssh root@46.224.27.19 "cd /var/www/wl && cat .env | grep -E 'NEXTAUTH_SECRET|DATABASE_URL|PORT'"
```

---

## 📝 Полный деплой одной командой (для опытных)

```bash
ssh root@46.224.27.19 "
cd /var/www/wl && \
pm2 stop wl-shop 2>/dev/null || true && \
pm2 delete wl-shop 2>/dev/null || true && \
git pull origin main 2>/dev/null || echo 'Git pull пропущен' && \
npm install --production && \
npx prisma generate && \
rm -rf .next && \
npm run build && \
pm2 start ecosystem.config.js && \
pm2 save && \
echo 'Деплой завершен!' && \
sleep 3 && \
pm2 status
"
```

---

## ✅ Чеклист деплоя

- [ ] SSH подключение работает
- [ ] Резервная копия создана
- [ ] Старый процесс остановлен
- [ ] Код обновлен/скопирован
- [ ] Зависимости установлены
- [ ] Prisma клиент сгенерирован
- [ ] Проект собран
- [ ] .env файл создан с правильными значениями
- [ ] PM2 конфигурация создана
- [ ] Приложение запущено через PM2
- [ ] Статус проверен (pm2 status)
- [ ] Логи проверены (нет ошибок)
- [ ] Приложение доступно (curl localhost:3000)

---

**Готово!** 🎉 Теперь вы можете выполнять команды по одной, копируя их в терминал.


