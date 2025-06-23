// app/(api)/api/timelog/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  // 1. 解析請求
  const { title, startTime, endTime } = await req.json()
  // 2. 建立一筆新的 TimeLog
  const newLog = await prisma.TimeLog.create({
    data: {
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  })
  // 3. 回傳剛建立的資料
  return NextResponse.json(newLog)
}

export async function GET() {
  // 回傳所有活動，並連帶查出它的步驟
  const logs = await prisma.TimeLog.findMany({
    include: { steps: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(logs)
}
