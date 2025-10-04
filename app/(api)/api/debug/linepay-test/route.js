// Line Pay v3 测试API端点
import { NextResponse } from 'next/server'
import { requestPayment } from '@/services/line-pay-v3-fetch.service'

export async function POST(request) {
  try {
    console.log('🧪 [DEBUG] Line Pay测试API调用')

    const body = await request.json()
    const { amount = 100 } = body

    console.log('🧪 [DEBUG]- Line Pay测试请求内容:', { amount })

    // 直接调用Line Pay服务
    const result = await requestPayment(amount)

    console.log('🧪 [DEBUG] Line Pay测试结果:', result)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        channelSet: !!process.env.LINE_PAY_CHANNEL_ID,
        secretSet: !!process.env.LINE_PAY_CHANNEL_SECRET,
      },
    })
  } catch (error) {
    console.error('🧪 [DEBUG] Line Pay测试失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Line Pay测试API - 请使用POST方法',
    usage: 'POST { "amount": 100 }',
  })
}
