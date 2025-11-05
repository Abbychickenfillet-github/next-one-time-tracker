import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'

export async function GET() {
  try {
    // ========================================
    // 🍪 1. 從 Cookie 中取得 JWT Token
    // ========================================
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    const session = await decrypt(cookie)

    if (!session?.payload?.userId) {
      return NextResponse.json(
        { status: 'error', message: '授權失敗' },
        { status: 401 }
      )
    }

    const userId = session.payload.userId

    // ========================================
    // 📊 2. 查詢用戶資訊和實際記錄數量
    // ========================================
    const user = await prisma.user.findUnique({
      where: { user_id: userId }, // UUID 已經是字串，不需要轉換
      select: {
        // select: 指定要查詢的欄位，只返回需要的資料
        user_id: true, // 用戶ID
        email: true, // 用戶信箱
        level: true, // 用戶等級（0=未付費, 1=已付費）
        current_log_count: true, // 當前記錄數量（我們維護的計數器）
        _count: {
          // _count: Prisma 的特殊語法，用於計算關聯記錄的數量
          select: {
            timeLogs: true, // 計算 timeLogs 關聯的記錄數量（實際的 TimeLog 記錄數量）
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: '用戶不存在' },
        { status: 404 }
      )
    }

    // ========================================
    // 📋 3. 查詢最近的 TimeLog 記錄
    // ========================================
    const recentLogs = await prisma.timeLog.findMany({
      where: { userId: userId }, // UUID 已經是字串，不需要轉換
      select: {
        // select: 指定要查詢的欄位
        id: true, // 記錄ID
        title: true, // 活動標題
        startTime: true, // 開始時間
        endTime: true, // 結束時間
      },
      orderBy: { startTime: 'desc' }, // 按開始時間降序排列（最新的在前）
      take: 5, // 只取最近5筆記錄
    })

    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          userId: user.user_id, // 用戶ID
          email: user.email, // 用戶信箱
          level: user.level, // 用戶等級
          current_log_count: user.current_log_count, // 我們維護的計數器
          actual_count: user._count.timeLogs, // 實際的 TimeLog 記錄數量
          isConsistent: user.current_log_count === user._count.timeLogs, // 檢查是否一致
        },
        recentLogs: recentLogs,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('檢查用戶記錄數量失敗:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: '檢查失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
