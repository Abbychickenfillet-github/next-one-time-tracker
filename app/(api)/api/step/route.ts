// app/api/step/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  // 1. 解析請求
  const { timeLogId, title, description, startTime, endTime } = await req.json()
  
  // 2. 建立一筆新的 Step
  const newStep = await prisma.step.create({
    data: {
      timeLogId,
      title,
      description,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
    },
  })
  
  // 3. 回傳剛建立的步驟
  return NextResponse.json(newStep)
}

export async function GET() {
  // 回傳所有步驟，通常不一定要用到
  const steps = await prisma.step.findMany({
    orderBy: { startTime: 'asc' },
  })
  return NextResponse.json(steps)
}
