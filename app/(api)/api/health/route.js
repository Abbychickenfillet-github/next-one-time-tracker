import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma.js'

// 保活用：由 Vercel Cron 定時呼叫，查詢資料庫避免 Supabase 因閒置被暫停
// force-dynamic 避免建置時被預先渲染成靜態頁面
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[health] 資料庫連線失敗:', error?.name, error?.code)
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}