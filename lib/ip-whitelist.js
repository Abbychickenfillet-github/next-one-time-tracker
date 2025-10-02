// IP 白名單檢查工具

// LINE Pay 官方 IP 範圍（根據官方文件）
const LINE_PAY_IPS = {
  // LINE Pay 呼叫商家 Server 時的 IP（Inbound）
  inbound: {
    test: ['147.92.159.68'],
    production: [
      '147.92.220.5',
      '147.92.220.6',
      '147.92.220.7',
      '147.92.220.8',
    ],
  },
  // 商家呼叫 LINE Pay Server 時的 IP（Outbound）
  outbound: {
    test: '147.92.159.21',
    production: '147.92.224.9',
  },
}

// 根據環境獲取對應的 IP 列表
function getLinePayIPsForCurrentEnvironment() {
  if (process.env.NODE_ENV === 'development') {
    return LINE_PAY_IPS.inbound.test // 開發環境使用測試環境 IP
  } else {
    return LINE_PAY_IPS.inbound.production // 生產環境使用正式環境 IP
  }
}

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

  console.log('🔍 IP 檢查:', {
    forwarded,
    realIP,
    clientIP,
    userAgent: request.headers.get('user-agent'),
  })

  // 獲取當前環境對應的 LINE Pay IP 列表
  const allowedIPs = getLinePayIPsForCurrentEnvironment()

  // 檢查是否在允許的 IP 範圍內
  const isValidIP = allowedIPs.includes(clientIP)

  console.log('✅ IP 白名單檢查結果:', {
    clientIP,
    allowedIPs,
    isValidIP,
  })

  return isValidIP
}

/**
 * LINE Pay IP 白名單中間件
 * @param {NextRequest} request - Next.js 請求物件
 * @returns {Response|null} - 如果 IP 不合法則返回 403 響應
 */
export function linePayIPMiddleware(request) {
  // 在開發環境中暫時跳過 IP 檢查，方便 Zeabur 測試
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ 開發環境: 跳過 LINE Pay IP 白名單檢查')
    return null
  }

  if (!isLinePayIP(request)) {
    return new Response('Forbidden: Invalid IP address', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
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
  return (
    ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
  )
}

// 使用範例：
// const isValid = isIPInRange('211.249.40.15', '211.249.40.1/28')
