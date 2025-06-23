'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function StatusPage() {
  const { user, isAuth } = useAuth()

  // 未登入時，不會出現頁面內容
  if (!isAuth) return <></>

  return (
    <>
      <h1>會員隱私資料(未登入會跳轉回來)</h1>
      <hr />
      <p>
        <Link href="/user">會員登入認証&授權測試(JWT)</Link>
      </p>
      <p>會員姓名:{user?.profile?.name}</p>
      <p>會員電子郵件:{user?.email}</p>
    </>
  )
}
