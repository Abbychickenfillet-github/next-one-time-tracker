// 測試檔案：沒有 server-only 保護
import pkg from 'pg'
const { Pool } = pkg

console.log('這個檔案沒有 server-only 保護')
export default 'test'
