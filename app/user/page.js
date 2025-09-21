'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import {
  useAuthGet,
  useAuthLogout,
  useAuthLogin,
} from '@/services/rest-client/use-user'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function UserPage() {
  // 輸入表單用的狀態
  const [userInput, setUserInput] = useState({ name: '', password: '' })

  // 登入後設定全域的會員資料用
  const { mutate } = useAuthGet()
  const { login } = useAuthLogin()
  const { logout } = useAuthLogout()

  // 取得登入狀態
  const { isAuth, isLoading } = useAuth()

  // 輸入帳號與密碼框用
  const handleFieldChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value })
  }

  // 處理登入
  const handleLogin = async () => {
    // 如果是已登入狀態，就不要再登入
    if (isAuth) {
      toast.error('錯誤 - 會員已登入')
      return
    }

    const res = await login(userInput)
    const resData = await res.json()

    console.log(resData)

    if (resData?.status === 'success') {
      // 呼叫useAuthGet的mutate方法
      // 將會進行重新驗證(revalidation)(將資料標記為已過期並觸發重新請求)
      mutate()

      toast.success('已成功登入')
    } else {
      toast.error(`登入失敗`)
    }
  }

  // 處理登出
  const handleLogout = async () => {
    const res = await logout()
    const resData = await res.json()
    // 成功登出
    if (resData.status === 'success') {
      // 呼叫useAuthGet的mutate方法
      // 將會進行重新驗證(revalidation)(將資料標記為已過期並觸發重新請求)
      mutate()

      toast.success('已成功登出')
    } else {
      toast.error(`登出失敗`)
    }
  }

  // 處理檢查登入狀態
  const handleCheckAuth = async () => {
    if (isAuth) {
      toast.success('已登入會員')
    } else {
      toast.error(`非會員身份`)
    }
  }

  if (isLoading) {
    return (
      <div>
        <h3>載入中...</h3>
      </div>
    )
  }

  return (
    <>
      <h1>會員登入認証&授權測試(JWT)</h1>
      <p>會員狀態:{isAuth ? '已登入' : '未登入'}</p>
      <hr />
      <label>
        帳號:
        <input
          type="text"
          name="username"
          value={userInput.username}
          onChange={handleFieldChange}
        />
      </label>
      <label>
        密碼:
        <input
          type="text"
          name="password"
          value={userInput.password}
          onChange={handleFieldChange}
        />
      </label>
      <br />
      <button
        onClick={() => {
          // 測試帳號 harry/11111
          setUserInput({ username: 'harry', password: '11111' })
        }}
      >
        一鍵輸入範例
      </button>
      <button onClick={handleLogin}>登入(login)</button>
      <hr />
      <button onClick={handleLogout}>登出(logout)</button>
      <button onClick={handleCheckAuth}>檢查登入狀況(check login)</button>
      <hr />
      <p>以下連結為測試會員註冊與更新個人資料</p>
      <p>
        <Link href="/user/register">註冊(不需登入)</Link>
      </p>
      <p>
        <Link href="/user/profile">修改個人資料(一般)(需登入)</Link>
      </p>
      <p>
        <Link href="/user/profile-password">修改個人資料(密碼)(需登入)</Link>
      </p>
      <p>
        以下連結為測試會員隱私資料頁，如果未登入完成會跳轉回登入頁(本頁)，實作程式碼詳見useAuth勾子
      </p>
      <p>
        <Link href="/user/status">存取會員隱私資料</Link>
      </p>
      <p>以下連結為第三方整合，在測試或整合前，務必先看說明文件先準備好資料</p>
      <p>
        <Link href="/user/google-login">
          Google第三方登入(firebase+跳出視窗)
        </Link>
      </p>
      <p>
        <Link href="/user/line-login">Line第三方登入(重定向)</Link>
      </p>
      <p>
        以下連結為忘記密碼與OTP整合，在測試或整合前，務必先看說明文件先準備好資料
      </p>
      <p>
        <Link href="/user/forget-password">
          忘記密碼(OTP, 一次性密碼) - 單頁
        </Link>
      </p>
      <p>
        <Link href="/user/forget-password-2p">
          忘記密碼(OTP, 一次性密碼) - 兩頁
        </Link>
      </p>
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
