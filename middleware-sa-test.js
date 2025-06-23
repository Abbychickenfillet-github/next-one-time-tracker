import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

// 1. 指定受保護和公共路由
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/auth-ex/sign-in', '/auth-ex/sign-up', '/']

export default async function middleware(req) {
  // 2. 檢查當前路由是受保護還是公共路由
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  // 3. 從 cookie 中解密會話
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  // 5. 如果用戶未經身份驗證，重定向到 /login
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/auth-ex/sign-in', req.nextUrl))
  }

  // 6. 如果用戶已經身份驗證，重定向到 /dashboard
  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

// 中間件不應運行的路由
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
