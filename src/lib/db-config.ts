/**
 * Валидация конфигурации БД: запрет локальной БД.
 * Проект работает ТОЛЬКО с PostgreSQL Neon.
 *
 * Локальная БД (запрещена): localhost, 127.0.0.1, docker-local, и т.д.
 * Допустимо: строка подключения к Neon (*.neon.tech).
 */

const NEON_HOST_PATTERN = /\.neon\.tech$/i

const LOCAL_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.0\.0\.1$/,
  /^::1$/,
  /^0\.0\.0\.0$/,
  /^host\.docker\.internal$/i,
  /^postgres$/i,
  /^db$/i,
  /\.local$/i,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Docker default bridge
  /^192\.168\./,                        // Локальная сеть
  /^10\./,                              // Частная сеть (часто local dev)
]

/**
 * Проверяет, что host из DATABASE_URL указывает на Neon, а не на локальную БД.
 * @throws Error если URL отсутствует, некорректен или указывает на локальную БД
 */
function parseDatabaseHost(url: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error(
      'DATABASE_URL is required. Set it in .env to your Neon database connection string.'
    )
  }

  try {
    const parseable = url.replace(/^postgres(ql)?:/i, 'https:')
    const parsed = new URL(parseable)
    const host = (parsed.hostname || '').toLowerCase().trim()
    return host
  } catch {
    throw new Error(
      'DATABASE_URL is invalid. Expected format: postgresql://user:pass@host.neon.tech/db?sslmode=require'
    )
  }
}

function isLocalHost(host: string): boolean {
  return LOCAL_HOST_PATTERNS.some((p) => p.test(host))
}

function isNeonHost(host: string): boolean {
  return NEON_HOST_PATTERN.test(host)
}

/**
 * Проверяет конфигурацию БД. Проект не должен работать с локальной БД.
 * При локальном DATABASE_URL выбрасывает Error — приложение/скрипт не должен запускаться.
 *
 * @throws Error если DATABASE_URL указывает на локальную БД
 */
export function assertNeonDatabaseUrl(): void {
  const url = process.env.DATABASE_URL
  const host = parseDatabaseHost(url!)

  if (isLocalHost(host)) {
    throw new Error(
      `[DB Config] Local database is not allowed. DATABASE_URL points to local host "${host}". ` +
        'Use Neon PostgreSQL connection string (e.g. postgresql://...@ep-xxx-pooler.xxx.aws.neon.tech/neondb?sslmode=require).'
    )
  }

  if (!isNeonHost(host)) {
    throw new Error(
      `[DB Config] Only Neon database is allowed. DATABASE_URL host "${host}" is not a Neon endpoint (*.neon.tech). ` +
        'Use your Neon connection string.'
    )
  }
}
