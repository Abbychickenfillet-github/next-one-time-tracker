// IP 白名單檢查工具

// LINE Pay 官方 IP 範圍（根據官方文件）
export const LINE_PAY_IPS = {
  // LINE Pay 呼叫商家 Server 時的 IP（Inbound：LINE Pay → 商家）
  inbound: {
    test: ['147.92.159.68'],
    production: [
      '147.92.220.5',
      '147.92.220.6',
      '147.92.220.7',
      '147.92.220.8',
      // 使用 CIDR 表示法：211.249.40.0/27 涵蓋 211.249.40.0 到 211.249.40.31（32 個 IP，包含 211.249.40.1-30）
      // /27 表示前 27 位是網路位（子網遮罩），後 5 位是主機位（2^5 = 32 個 IP）
      '211.249.40.0/27',
    ],
  },
  // 商家呼叫 LINE Pay Server 時的 IP（Outbound：商家 → LINE Pay）
  // 這些 IP 需要在 LINE Pay 後台加入白名單
  outbound: {
    test: ['147.92.159.21', '43.167.203.158'], // Zeabur 伺服器 IP（已加入 LINE Pay 後台白名單）
    production: [
      '147.92.224.9', // LINE Pay 官方 Outbound IP（參考用）
      '43.167.203.158', // Zeabur 伺服器 IP（已加入 LINE Pay 後台白名單）
    ],
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

// 導出 IP 白名單資訊，供 LINE Pay 相關設定使用
export function getLinePayOutboundIPs() {
  if (process.env.NODE_ENV === 'development') {
    return LINE_PAY_IPS.outbound.test
  } else {
    return LINE_PAY_IPS.outbound.production
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

  // 檢查是否在允許的 IP 範圍內（支援單個 IP 和 CIDR 格式）
  const isValidIP = allowedIPs.some((allowedIP) => {
    // 如果是 CIDR 格式（包含 /），使用 CIDR 檢查
    if (allowedIP.includes('/')) {
      return isIPInRange(clientIP, allowedIP)
    }
    // 否則使用精確匹配
    return allowedIP === clientIP
  })

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
    ip
      .split('.')
      .reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0
  )
}

// 使用範例：
// const isValid = isIPInRange('211.249.40.15', '211.249.40.0/27')
// 211.249.40.0/27 涵蓋 211.249.40.0 到 211.249.40.31（32 個 IP，包含 211.249.40.1-30）
// /27 中的 27 是子網遮罩位數（prefix length），表示前 27 位是網路位
