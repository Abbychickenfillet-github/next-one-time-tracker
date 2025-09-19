// app/(api)/api/timelog/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
// Prisma是指用JS直接操作資料庫

// ===== POST 方法：接收前端資料並儲存到資料庫 =====
// 這是 Next.js App Router 的 API 路由格式，不是 default export
export async function POST(req: Request) {
  try {
    // 1. 解析請求 - 從前端接收 JSON 資料
    const { title, description, startTime, endTime, userId } = await req.json()
    
    // 2. 建立一筆新的 TimeLog 記錄
    // Prisma 是 ORM (Object-Relational Mapping)，讓 JavaScript 可以像操作物件一樣操作資料庫
    const newLog = await prisma.timeLog.create({
      data: {
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        userId: userId || null, // 支援匿名用戶
      },
    })
    
    // 3. 回傳剛建立的資料給前端
    return NextResponse.json(newLog)
  } catch (error) {
    console.error('TimeLog API Error:', error)
    return NextResponse.json({ error: 'Failed to create TimeLog' }, { status: 500 })
  }
}

// ===== GET 方法：查詢用戶的時間記錄 =====
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 查詢條件 - 使用正確的 Prisma 語法
    const whereCondition = userId ? { userId: parseInt(userId) } : {}

    // 查詢資料
    const [logs, total] = await Promise.all([
      prisma.timeLog.findMany({
        where: whereCondition,
        include: { 
          steps: true,
          user: {
            select: { username: true, email: true }
          }
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.timeLog.count({ where: whereCondition })
    ])

    // 計算 AI 分析
    const logsWithAnalysis = await Promise.all(
      logs.map(async (log: any) => {
        if (!log.aiAnalysis && log.endTime) {
          // 計算活動時長
          const duration = log.endTime.getTime() - log.startTime.getTime()
          const durationMinutes = Math.floor(duration / (1000 * 60))
          
          // 簡單的 AI 分析（可以後續整合真正的 LLM）
          const analysis = generateAIAnalysis(log, durationMinutes)
          
          // 更新資料庫
          await prisma.timeLog.update({
            where: { id: log.id },
            data: { aiAnalysis: analysis }
          })
          
          return { ...log, aiAnalysis: analysis }
        }
        return log
      })
    )

    return NextResponse.json({
      logs: logsWithAnalysis,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('TimeLog GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch TimeLogs' }, { status: 500 })
  }
}

// ===== AI 分析生成函數 =====
function generateAIAnalysis(log: any, durationMinutes: number) {
  const insights = []
  
  // 時長分析
  if (durationMinutes < 30) {
    insights.push('短時間專注活動')
  } else if (durationMinutes < 120) {
    insights.push('中等時長活動')
  } else {
    insights.push('長時間深度工作')
  }
  
  // 時間段分析
  const hour = log.startTime.getHours()
  if (hour >= 6 && hour < 12) {
    insights.push('早晨時段')
  } else if (hour >= 12 && hour < 18) {
    insights.push('下午時段')
  } else {
    insights.push('晚間時段')
  }
  
  // 步驟分析
  if (log.steps && log.steps.length > 3) {
    insights.push('多階段複雜任務')
  } else {
    insights.push('簡單直接任務')
  }
  
  return insights.join(' | ')
}