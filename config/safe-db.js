// 測試檔案：有 server-only 保護
import 'server-only'
import pkg from 'pg'
const { Pool } = pkg

console.log('這個檔案有 server-only 保護')
export default 'test'



