/**
 * Система логирования для приложения
 * Заменяет console.log/error/warn для production окружения
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // В development логируем всё
    if (this.isDevelopment) return true

    // В production логируем только warn и error
    return level === 'warn' || level === 'error'
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return
    const entry = this.formatMessage('debug', message, data)
    console.debug('[DEBUG]', entry.message, data || '')
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return
    const entry = this.formatMessage('info', message, data)
    console.info('[INFO]', entry.message, data || '')
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return
    const entry = this.formatMessage('warn', message, data)
    console.warn('[WARN]', entry.message, data || '')
  }

  error(message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return
    const entry = this.formatMessage('error', message, error)
    
    if (error instanceof Error) {
      console.error('[ERROR]', entry.message, {
        message: error.message,
        stack: error.stack,
        ...entry.data
      })
    } else {
      console.error('[ERROR]', entry.message, error || '')
    }
  }
}

// Экспортируем singleton instance
export const logger = new Logger()

// Экспортируем класс для тестирования
export { Logger }
