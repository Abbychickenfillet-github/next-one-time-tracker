// 說明：處理 LINE Pay 通知的路由 (用於 Zeabur 無固定 IP 環境)
import { NextResponse } from 'next/server'
// 導入 IP 白名單檢查
import { linePayIPMiddleware } from '@/lib/ip-whitelist.js'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

/**
 * 處理 LINE Pay 通知
 * 這個路由專門用於接收 LINE Pay 的系統通知
 * 在 Zeabur 環境中，我們使用 IP 白名單來確保安全性
 */
export async function POST(request) {
  // 強制 IP 白名單檢查（生產環境必須）
  if (process.env.NODE_ENV === 'production') {
    const ipCheckResult = linePayIPMiddleware(request)
    if (ipCheckResult) {
      console.log('LINE Pay 通知被拒絕：IP 不在白名單中')
      return ipCheckResult // 返回 403 Forbidden
    }
  }

  try {
    // 解析 LINE Pay 通知資料
    const notificationData = await request.json()

    if (isDev) {
      console.log('收到 LINE Pay 通知:', notificationData)
    }

    // 驗證通知資料的完整性
    if (!notificationData.transactionId) {
      return errorResponse(NextResponse, {
        message: '缺少交易編號',
        code: 'MISSING_TRANSACTION_ID'
      })
    }

    // 這裡可以添加更多業務邏輯
    // 例如：更新資料庫中的訂單狀態、發送確認郵件等

    // 記錄通知到日誌
    console.log(`LINE Pay 通知處理完成: ${notificationData.transactionId}`)

    // 回傳成功響應給 LINE Pay
    return successResponse(NextResponse, {
      message: '通知處理成功',
      transactionId: notificationData.transactionId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('LINE Pay 通知處理失敗:', error)
    return errorResponse(NextResponse, {
      message: '通知處理失敗',
      error: error.message
    })
  }
}

/**
 * 處理 GET 請求（用於測試）
 */
export async function GET(request) {
  // 檢查 IP 白名單
  if (process.env.NODE_ENV === 'production') {
    const ipCheckResult = linePayIPMiddleware(request)
    if (ipCheckResult) {
      return ipCheckResult
    }
  }

  return successResponse(NextResponse, {
    message: 'LINE Pay 通知端點正常運作',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}

