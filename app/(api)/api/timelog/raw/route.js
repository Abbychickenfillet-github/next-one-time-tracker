import { NextResponse } from 'next/server'
import pool from '@/config/server.postgresql.js'
// 這個檔案室用來測試API的
export async function GET() {
  try {
    // 使用原生 SQL 查詢
    const result = await pool.query(`
      SELECT
        tl.id,
        tl.title,
        tl.start_time,
        tl.end_time,
        COUNT(s.id) as step_count
      FROM "TimeLog" tl
      LEFT JOIN "Step" s ON tl.id = s.time_log_id
      GROUP BY tl.id, tl.title, tl.start_time, tl.end_time
      ORDER BY tl.start_time DESC
      LIMIT 10
    `)

    return NextResponse.json({
      status: 'success',
      data: result.rows,
    })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { status: 'error', message: '查詢失敗' },
      { status: 500 }
    )
  }
}
