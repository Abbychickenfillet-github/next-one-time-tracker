import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

// 1. 指定受保護和公共路由
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/user', '/user/login', '/user/register', '/']

export default async function middleware(req) {
  // 2. 檢查當前路由是受保護還是公共路由
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  // 3. 從 cookie 中解密會話
  // 🔧 修改原因：使用 'ACCESS_TOKEN' 而不是 'session'
  // 原因：我們的認證系統在 /api/auth/local/login 中設置的是 ACCESS_TOKEN cookie
  // 如果使用 'session'，會導致認證檢查失敗，因為找不到對應的 cookie
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  const session = await decrypt(cookie)

  // 4. 如果用戶未經身份驗證且訪問受保護路由，重定向到登入頁面
  // 🔧 修改原因：重定向到 '/user' 而不是 '/auth-ex/sign-in'
  // 原因：我們的登入頁面實際位置在 /user，與 client.config.js 中的 loginRoute = '/user' 保持一致
  // 如果重定向到不存在的 '/auth-ex/sign-in'，會導致 404 錯誤
  if (isProtectedRoute && !session?.payload?.userId) {
    return NextResponse.redirect(new URL('/user', req.nextUrl))
  }

  // 5. 如果用戶已經身份驗證且訪問登入頁面，重定向到 dashboard
  // 🔧 修改原因：檢查具體的登入頁面路由而不是使用 startsWith('/dashboard')
  // 原因：
  // 1. 防止已登入用戶重複訪問登入頁面，提升用戶體驗
  // 2. 使用具體路由檢查比 startsWith 更精確，避免誤判
  // 3. 確保只有訪問登入相關頁面時才重定向，其他公共頁面不受影響
  if (
    isPublicRoute &&
    session?.payload?.userId &&
    (path === '/user' || path === '/user/login')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

// 中間件不應運行的路由
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
