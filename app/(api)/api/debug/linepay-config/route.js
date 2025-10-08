// 調試 LINE Pay 配置
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = {
      NODE_ENV: process.env.NODE_ENV,
      LINE_PAY_CHANNEL_ID: process.env.LINE_PAY_CHANNEL_ID,
      LINE_PAY_CHANNEL_SECRET: process.env.LINE_PAY_CHANNEL_SECRET
        ? '已設定'
        : '未設定',
      channelSecretLength: process.env.LINE_PAY_CHANNEL_SECRET?.length || 0,
    }

    console.log('🔧 LINE Pay 配置檢查:', config)

    return NextResponse.json({
      success: true,
      config,
      message: '配置檢查完成',
    })
  } catch (error) {
    console.error('❌ 配置檢查失敗:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
