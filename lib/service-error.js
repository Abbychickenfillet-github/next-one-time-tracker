// 把 service 層 catch 到的例外歸類
// 詳細原因只寫進伺服器 log(Vercel runtime log)，回給前端的只有分類後的簡短訊息

// Prisma 連線類錯誤碼
// P1000: 資料庫帳號密碼驗證失敗 / P1001: 連不到資料庫主機
// P1002: 連線逾時 / P1008: 操作逾時 / P1017: 連線被伺服器關閉
const DB_CONNECTION_CODES = ['P1000', 'P1001', 'P1002', 'P1008', 'P1017']

/**
 * 歸類例外並寫入伺服器 log
 * @param {string} scope - 發生位置，例如 'login'、'createUser'
 * @param {unknown} error - catch 到的例外
 * @returns {{ reason: 'db_unavailable' | 'unique_violation' | 'unknown', message: string }}
 */
export const classifyServiceError = (scope, error) => {
  // PrismaClientInitializationError 的錯誤碼在 errorCode，其他 Prisma 錯誤在 code
  const code = error?.code || error?.errorCode
  const name = error?.name

  let result = {
    reason: 'unknown',
    message: '系統發生錯誤，請稍後再試',
  }

  if (
    name === 'PrismaClientInitializationError' ||
    DB_CONNECTION_CODES.includes(code)
  ) {
    // 包含 DATABASE_URL 沒設定、主機連不到、帳密錯誤
    result = {
      reason: 'db_unavailable',
      message: '系統暫時無法連線資料庫，請稍後再試',
    }
  } else if (code === 'P2002') {
    // 唯一欄位重覆(例如兩個請求同時用同一個 email 註冊)
    result = { reason: 'unique_violation', message: '會員資料重覆' }
  }

  // 只記錄錯誤本身，不記錄使用者輸入的資料，避免洩漏密碼
  console.error(`[${scope}] ${result.reason}`, {
    name,
    code,
    message: error?.message,
  })

  return result
}
