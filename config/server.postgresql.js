import 'server-only' // 限制只能在伺服器端使用
// ❌ 沒有 'server-only' 保護，這個檔案可能被意外地在客戶端載入！

import pkg from 'pg'
const { Pool } = pkg

// 讀取.env檔用
import 'dotenv/config.js'

// 使用單例模式，確保只建立一次連接池
let pool = null

function createPool() {
  if (pool) {
    return pool
  }

  let poolConfig

  if (process.env.NODE_ENV === 'production') {
    // 生產環境：使用 Zeabur 連線字串
    poolConfig = {
      connectionString: process.env.ZEABUR_CONNECTION_STRING,
    }
    console.log('🚀 使用 Zeabur 生產環境連線')
  } else {
    // 開發環境：使用本地資料庫
    poolConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'timelog_db',
      password: process.env.DB_PASSWORD || 'abc123',
      port: process.env.DB_PORT || 5432,
    }
    // 只在第一次建立時顯示
    console.log(poolConfig)
    console.log('🛠️ 使用開發環境連線配置')
  }

  pool = new Pool(poolConfig)
  return pool
}

// 導出連接池
export default createPool()
