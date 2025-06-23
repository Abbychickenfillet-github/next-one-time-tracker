// 此檔案只能在伺服器上使用，用來放置一些常用的函式，例如轉換時區、轉換字串、檢查空物件等等
import ms from 'ms'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// 導入dotenv 使用 .env 檔案中的設定值 process.env
import dotenv from 'dotenv'
import { readFile, writeFile } from 'fs/promises'
import { z } from 'zod'

// 判斷是否為開發環境
export const isDev = process.env.NODE_ENV === 'development'

// 轉換命名用(大駝峰->小駝峰) convert CamelCase to camelCase for Prisma modelName
export function convertToCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

// 轉換時間戳記為多久前
export const timeAgo = (timestamp, timeOnly) => {
  if (!timestamp) return 'never'
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? '' : ' ago'
  }`
}

/**
 * Fetching data from the JSON file and parse to JS data
 * @param {string} pathname
 * @returns {Promise<object>} A promise that contains json parse object
 */
export const readJsonFile = async (pathname) => {
  const data = await readFile(path.join(process.cwd(), pathname))
  return JSON.parse(data)
}

export const writeJsonFile = async (pathname, jsonOrObject, folder = './') => {
  try {
    // we need string
    const data =
      typeof jsonOrObject === 'object'
        ? JSON.stringify(jsonOrObject)
        : jsonOrObject

    await writeFile(path.join(process.cwd(), folder + pathname), data)
    return true
  } catch (e) {
    // 如果是開發環境，顯示錯誤訊息
    if (isDev) console.log(e)
    return false
  }
}

// 讓console.log可以呈現檔案與行號
//https://stackoverflow.com/questions/45395369/how-to-get-console-log-line-numbers-shown-in-nodejs
export const extendLog = () => {
  ;['log', 'warn', 'error'].forEach((methodName) => {
    const originalMethod = console[methodName]
    console[methodName] = (...args) => {
      try {
        throw new Error()
      } catch (error) {
        originalMethod.apply(console, [
          error.stack // Grabs the stack trace
            .split('\n')[2] // Grabs third line
            .trim() // Removes spaces
            .substring(3) // Removes three first characters ("at ")
            .replace(__dirname, '') // Removes script folder path
            .replace(/\s\(./, ' at ') // Removes first parentheses and replaces it with " at "
            .replace(/\)/, ''), // Removes last parentheses
          '\n',
          ...args,
        ])
      }
    }
  })
}

/**
 * 檢查空物件
 * @param {object} obj
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  for (var i in obj) return false
  return true
}

// 轉換字串為kebab-case
export const toKebabCase = (str) => {
  return (
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.toLowerCase())
      .join('-')
  )
}

// 載入.env檔用
export const loadEnv = (fileExt = '') => {
  dotenv.config({ path: `${fileExt ? '.env' : '.env' + fileExt}` })
}

/**
 * 轉換時區: 回傳新的日期物件，預設為從UTC轉為台北時區
 * convertTimeZone(new Date(), 'UTC', 'Asia/Taipei')
 * @param {Date} date
 * @param {string|null} [timeZoneFrom='UTC']
 * @param {string|null} [timeZoneTo='Asia/Taipei']
 * @returns {Date} new Date object
 */
export function convertTimeZone(
  date, // Date object
  timeZoneFrom = 'UTC', // default timezone is Local : string | null
  timeZoneTo = 'Asia/Taipei' // default timezone is Local: string | null
) {
  const dateFrom =
    timeZoneFrom == null
      ? date
      : new Date(
          date.toLocaleString('en-US', {
            timeZone: timeZoneFrom,
          })
        )

  const dateTo =
    timeZoneTo == null
      ? date
      : new Date(
          date.toLocaleString('en-US', {
            timeZone: timeZoneTo,
          })
        )

  const result = new Date(
    date.getTime() + dateTo.getTime() - dateFrom.getTime()
  )

  return result
}

/**
 * 轉換日期為字串，預設為台北時區
 * dateToString(new Date(), 'Asia/Taipei')
 * @param {Date} date Date object
 * @param {string} [timeZone='Asia/Taipei'] string
 * @returns {string} '2021-08-01 12:00:00'
 */
export function dateToStringWithTimeZone(
  date, // Date object
  timeZone = 'Asia/Taipei' // string
) {
  date = convertTimeZone(date, 'UTC', timeZone)

  const year = date.getUTCFullYear().toString().padStart(4, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 日期格式轉為字串 yyyy-mm-dd
export const dateToString = (date = null) => {
  if (!date) return ''

  return date.toISOString().split('T')[0]
}
/**
 * 用來處理成功回應
 * @param {Response} res
 * @param {Error} data=null
 * @param {number} [status=200]
 * @returns {any}
 */
export const successResponse = (res, data = null, status = 200) => {
  //express
  //return res.status(status).json({ status: 'success', data })
  // next route handler
  return res.json({ status: 'success', data }, { status })
}

/**
 * 用來處理錯誤回應
 * @param {Response} res
 * @param {Error} error
 * @param {number} [status=200]
 * @returns {any}
 */
export const errorResponse = (res, error, status = 200) => {
  // 如果是開發環境，顯示錯誤訊息
  if (isDev) console.log(error)
  // 顯示錯誤訊息，但不顯示Prisma資料庫查詢的錯誤訊息到REST前端
  let message = error?.name?.includes('Prisma')
    ? '資料庫查詢錯誤'
    : error?.message

  //return res.status(status).json({ status: 'error', message })
  // next route handler
  return res.json({ status: 'error', message }, { status })
}

/**
 * 驗證參數是否為正整數，發生錯誤時拋出錯誤
 * @param {any} id
 * @returns {void}
 */
export const validatedParamId = (id) => {
  // 驗証用的schema，id必須為正整數
  const paramIdSchema = z.number().int().positive()

  const validated = paramIdSchema.safeParse(id)

  if (!validated.success) {
    // 如果是開發環境，顯示錯誤訊息
    if (isDev) console.log(validated.error)
    // 拋出錯誤
    throw new Error('缺少必要參數，或參數格式不正確')
  }
}

/**
 * Zod安全解析，用來綁定的Schema物件，回傳檢驗函式，發生錯誤時會傾印錯誤與拋出固定錯誤訊息
 *
 * @param {object} schemaObject Zod Schema Object
 * @returns { (validatedObj:object) => void } A function that takes an object and returns void
 */
export const safeParseBindSchema =
  (schemaObj = null) =>
  (validatedObj = null) => {
    if (!schemaObj || !validatedObj) {
      throw new Error('檢驗函式缺少必要參數，或參數格式不正確')
    }

    const prop = Object.keys(validatedObj)[0]
    const data = validatedObj[prop]

    const validated = schemaObj[prop]?.safeParse(data)

    if (!validated?.success) {
      if (isDev) console.log(validated?.error)
      throw new Error('資料格式不正確')
    }
  }

// 以下是console.log的前綴上色用法
const log = [
  'background: green',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const info = [
  'background: blue',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const warn = [
  'background: orange',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const error = [
  'background: red',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const emoji = ['🏄', '🚀', '🔥', '❌', '🎉', '😄', '🐞', '🎯', '⛔', '💪🏾']

export const logPrefix = {
  log: [`%c${emoji[1]}LOG`, log],
  info: [`%c${emoji[4]}INFO`, info],
  warn: [`%c${emoji[2]}WARN`, warn],
  error: [`%c${emoji[3]}ERROR`, error],
}
