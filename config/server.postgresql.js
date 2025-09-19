import 'server-only' // 限制只能在伺服器端使用

import pkg from 'pg'
const { Pool } = pkg

// 讀取.env檔用
import 'dotenv/config.js'

// PostgreSQL 資料庫連接池
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // PostgreSQL 不需要 dateStrings 選項
})

// 導出連接池
export default pool
