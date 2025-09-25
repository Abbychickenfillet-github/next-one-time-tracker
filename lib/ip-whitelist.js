// IP 白名單檢查工具
import { NextRequest } from 'next/server'

// LINE Pay 官方 IP 範圍
const LINE_PAY_IPS = [
  '211.249.40.1',
  '211.249.40.2',
  '211.249.40.3',
  '211.249.40.4',
  '211.249.40.5',
  '211.249.40.6',
  '211.249.40.7',
  '211.249.40.8',
  '211.249.40.9',
  '211.249.40.10',
  '211.249.40.11',
  '211.249.40.12',
  '211.249.40.13',
  '211.249.40.14',
  '211.249.40.15',
  '211.249.40.16',
  '211.249.40.17',
  '211.249.40.18',
  '211.249.40.19',
  '211.249.40.20',
  '211.249.40.21',
  '211.249.40.22',
  '211.249.40.23',
  '211.249.40.24',
  '211.249.40.25',
  '211.249.40.26',
  '211.249.40.27',
  '211.249.40.28',
  '211.249.40.29',
  '211.249.40.30',
]

/**
 * 檢查請求是否來自 LINE Pay 官方 IP
 * @param {NextRequest} request - Next.js 請求物件
 * @returns {boolean} - 是否為合法的 LINE Pay IP
 */
export function isLinePayIP(request) {
  // 獲取真實 IP（考慮代理和 CDN）
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = forwarded?.split(',')[0] || realIP || request.ip

  // 開發環境允許所有 IP
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // 檢查是否在 LINE Pay IP 範圍內
  return LINE_PAY_IPS.includes(clientIP)
}

/**
 * LINE Pay IP 白名單中間件
 * @param {NextRequest} request - Next.js 請求物件
 * @returns {Response|null} - 如果 IP 不合法則返回 403 響應
 */
export function linePayIPMiddleware(request) {
  if (!isLinePayIP(request)) {
    return new Response('Forbidden: Invalid IP address', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
  return null
}

/**
 * 更簡潔的 IP 範圍檢查（使用 CIDR 表示法）
 * @param {string} ip - 要檢查的 IP 地址
 * @param {string} cidr - CIDR 格式的 IP 範圍
 * @returns {boolean}
 */
export function isIPInRange(ip, cidr) {
  const [range, bits = 32] = cidr.split('/')
  const mask = -1 << (32 - bits)

  const ipNum = ipToNumber(ip)
  const rangeNum = ipToNumber(range)

  return (ipNum & mask) === (rangeNum & mask)
}

/**
 * 將 IP 地址轉換為數字
 * @param {string} ip - IP 地址字串
 * @returns {number}
 */
function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

// 使用範例：
// const isValid = isIPInRange('211.249.40.15', '211.249.40.1/28')
