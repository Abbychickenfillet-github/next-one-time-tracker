// app/api/step/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  // 1. 解析請求
  const { text, type, ended, timeLogId } = await req.json()
  // 2. 建立一筆新的 Step
  const newStep = await prisma.step.create({
    data: {
      text,
      type,
      ended,
      timeLog: { connect: { id: timeLogId } },
    },
  })
  // 3. 回傳剛建立的步驟
  return NextResponse.json(newStep)
}

export async function GET() {
  // 回傳所有步驟，通常不一定要用到
  const steps = await prisma.step.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(steps)
}
