import { NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/utils.js'

// 處理 OPTIONS 請求 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function GET() {
  return NextResponse.json(
    { status: 'success', data: null },
    {
      headers: corsHeaders,
    }
  )
}
