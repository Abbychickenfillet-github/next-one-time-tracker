import Swal from 'sweetalert2'

/**
 * 顯示速率限制錯誤的 SweetAlert 提示
 * @param {Object} errorData - 錯誤資料
 * @param {string} errorData.message - 錯誤訊息
 * @param {string} errorData.resetTime - 重置時間
 * @param {number} errorData.limit - 限制次數
 */
export function showRateLimitAlert(errorData) {
  const { message, resetTime, limit } = errorData

  // 計算剩餘時間
  const resetDate = new Date(resetTime)
  const now = new Date()
  const timeDiff = resetDate.getTime() - now.getTime()
  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  let timeText = ''
  if (hours > 0) {
    timeText = `${hours}小時${minutes}分鐘`
  } else {
    timeText = `${minutes}分鐘`
  }

  Swal.fire({
    title: '🚦 請求過於頻繁',
    html: `
      <div style="text-align: left;">
        <p><strong>${message}</strong></p>
        <hr style="margin: 15px 0;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <h6 style="color: #495057; margin-bottom: 10px;">📊 限制詳情：</h6>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>每小時限制：</strong> ${limit} 次 API 呼叫</li>
            <li><strong>重置時間：</strong> ${resetDate.toLocaleString()}</li>
            <li><strong>剩餘時間：</strong> ${timeText}</li>
          </ul>
        </div>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <h6 style="color: #1976d2; margin-bottom: 10px;">💡 建議：</h6>
          <ul style="margin: 0; padding-left: 20px;">
            <li>減少頁面重新整理頻率</li>
            <li>避免快速連續操作</li>
            <li>考慮升級到付費方案獲得更高限制</li>
          </ul>
        </div>
      </div>
    `,
    icon: 'warning',
    confirmButtonText: '我知道了',
    confirmButtonColor: '#3085d6',
    width: '500px',
    customClass: {
      popup: 'rate-limit-popup',
      title: 'rate-limit-title',
      content: 'rate-limit-content',
    },
  })
}

/**
 * 顯示速率限制警告（接近限制時）
 * @param {Object} status - 速率限制狀態
 * @param {number} status.remaining - 剩餘次數
 * @param {number} status.limit - 限制次數
 */
export function showRateLimitWarning(status) {
  const { remaining, limit } = status
  const percentage = (remaining / limit) * 100

  if (percentage <= 20 && percentage > 0) {
    Swal.fire({
      title: '⚠️ 速率限制警告',
      html: `
        <div style="text-align: center;">
          <p>您的 API 呼叫次數即將達到限制</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>剩餘次數</span>
              <span><strong>${remaining}/${limit}</strong></span>
            </div>
            <div style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden;">
              <div style="background: ${percentage <= 10 ? '#dc3545' : '#ffc107'}; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
            </div>
          </div>
          <p style="color: #6c757d; font-size: 14px;">建議減少操作頻率或考慮升級方案</p>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: '我知道了',
      confirmButtonColor: '#ffc107',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: true,
    })
  }
}

// ========================================
// 🔧 ESLint 修復注意事項
// ========================================
// 問題：匿名預設匯出警告 - 直接匯出匿名物件
// 原因：ESLint import/no-anonymous-default-export 規則要求具名匯出
// 修復：先將物件賦值給變數 rateLimitUtils，再匯出
// 影響：提升模組可讀性和工具支援
// ========================================
const rateLimitUtils = {
  showRateLimitAlert,
  showRateLimitWarning,
}

export default rateLimitUtils
