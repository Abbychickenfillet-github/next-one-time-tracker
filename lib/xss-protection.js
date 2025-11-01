/**
 * XSS 防護工具函數
 *
 * 用途：清理和驗證用戶輸入，防止 Cross-Site Scripting (XSS) 攻擊
 */

/**
 * 移除 HTML 標籤和潛在危險字符
 * @param {string} input - 用戶輸入的原始字串
 * @returns {string} - 清理後的安全字串
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return ''
  }

  return (
    input
      // 移除所有 HTML 標籤
      .replace(/<[^>]*>/g, '')
      // 移除 JavaScript 事件處理器（onclick, onerror 等）
      .replace(/on\w+\s*=/gi, '')
      // 移除 javascript: 協議
      .replace(/javascript:/gi, '')
      // 移除 data: 協議（可能包含惡意 payload）
      .replace(/data:/gi, '')
      // 移除 vbscript: 協議
      .replace(/vbscript:/gi, '')
      // 轉義 HTML 實體
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  )
}

/**
 * 驗證輸入是否包含惡意內容
 * @param {string} input - 要檢查的輸入
 * @returns {boolean} - true 表示安全，false 表示可能包含惡意內容
 */
export function isSafeInput(input) {
  if (typeof input !== 'string') {
    return false
  }

  // 檢查常見的 XSS payload 模式
  const dangerousPatterns = [
    /<script[^>]*>/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /on\w+\s*=/i, // onclick, onerror 等
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /expression\s*\(/i, // CSS expression (IE)
    /&#x[0-9a-f]+;?/i, // 可疑的 HTML 實體編碼
    /alert\s*\(/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /document\.write/i,
    /window\.location/i,
  ]

  return !dangerousPatterns.some((pattern) => pattern.test(input))
}

/**
 * 安全地渲染用戶輸入（用於顯示）
 * React 會自動轉義，但此函數提供額外的清理層級
 *
 * @param {string} input - 用戶輸入
 * @returns {string} - 安全清理後的字串
 */
export function safeRender(input) {
  if (input == null) {
    return ''
  }

  // 如果是數字，直接轉為字串
  if (typeof input === 'number') {
    return String(input)
  }

  // 如果是字串，進行清理
  if (typeof input === 'string') {
    // React 會自動轉義，但我們做額外清理以防萬一
    return sanitizeInput(input)
  }

  // 其他類型返回空字串
  return ''
}

/**
 * 驗證並清理物件中的所有字串屬性
 * @param {object} obj - 要清理的物件
 * @returns {object} - 清理後的物件
 */
export function sanitizeObject(obj) {
  if (obj == null || typeof obj !== 'object') {
    return obj
  }

  const sanitized = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
  }

  return sanitized
}

/**
 * React Hook：在渲染前驗證 props 中的用戶輸入
 *
 * @example
 * const safeTitle = useSafeInput(title)
 *
 * @param {string} input - 要驗證的輸入
 * @returns {string} - 安全的輸入值
 */
export function useSafeInput(input) {
  // 注意：這不是真正的 React Hook，只是命名約定
  // 真正的 Hook 需要使用 useMemo
  return safeRender(input)
}
