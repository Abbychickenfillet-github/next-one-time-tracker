import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔧 [DEBUG] 配置API调用')

    return NextResponse.json({
      success: true,
      environment: {
        nodeEnv: process.env.NODE_ENV,
      },
      config: {
        channelId: process.env.LINE_PAY_CHANNEL_ID || '未设置',
        channelSecretSet: !!process.env.LINE_PAY_CHANNEL_SECRET,
        baseUrl: process.env.NEXTAUTH_URL || '未设置',
      },
      urls: {
        confirmUrl:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3001/line-pay/callback'
            : 'https://insightful-timelog.zeabur.app/line-pay/callback',
        cancelUrl:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3001/line-pay/cancel'
            : 'https://insightful-timelog.zeabur.app/line-pay/cancel',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
