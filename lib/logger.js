import 'server-only' // 限制只能在伺服器端使用

// lib/logger.js
import { createLogger, format, transports } from 'winston'
//eslint-disable-next-line
import DailyRotateFile from 'winston-daily-rotate-file'

const timezoned = () => {
  return new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
  })
}

const logFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]:${message}`
})

const customFormat = format.combine(
  // format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
  format.timestamp({
    format: timezoned,
  }),
  format.align(),
  logFormat
)
const defaultOptions = {
  format: customFormat,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  frequency: '1m',
}

export const globalLogger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      level: 'info',
      ...defaultOptions,
    }),
    new transports.DailyRotateFile({
      filename: 'logs/debug-%DATE%.log',
      level: 'debug',
      ...defaultOptions,
    }),
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      ...defaultOptions,
    }),
  ],
  exitOnError: false,
  exceptionHandlers: [
    new transports.DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
    }),
  ],
})

export default class Logger {
  static error(e) {
    globalLogger.error(e.stack)
  }

  static info(...messages) {
    const msg = messages
      .map((msg) => {
        return typeof msg === 'object' ? JSON.stringify(msg) : msg
      })
      .join(' ')
    globalLogger.info(msg)
  }

  static warn(...messages) {
    const msg = messages
      .map((msg) => {
        return typeof msg === 'object' ? JSON.stringify(msg) : msg
      })
      .join(' ')
    globalLogger.warn(msg)
  }

  static debug(...messages) {
    const msg = messages
      .map((msg) => {
        return typeof msg === 'object' ? JSON.stringify(msg) : msg
      })
      .join(' ')
    globalLogger.debug(msg)
  }
}
