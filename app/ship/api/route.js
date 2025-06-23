import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request) {
  let body = null

  try {
    body = await request.formData()
    console.log('body', body)
  } catch (error) {
    return NextResponse.json({ message: 'Error', error }, { status: 200 })
  }

  // 使用表單資料重新導向到回調頁面
  // redirect 內部一定會拋出錯誤，因此應該在 try/catch 區塊之外呼叫執行。
  redirect(`/ship/callback?${new URLSearchParams(body).toString()}`)
}

// 測試用
// export async function GET(request) {
//   return NextResponse.json({ message: 'hello' }, { status: 200 })
// }
