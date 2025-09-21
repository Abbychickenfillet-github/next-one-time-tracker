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

    return NextResponse.json({
      logs,
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