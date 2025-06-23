'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  useAuthGet,
  useAuthLogout,
  useAuthGetOtpToken,
  useAuthResetPassword,
} from '@/services/rest-client/use-user'
import Link from 'next/link'

// 載入loading元件
// import { RotatingLines } from 'react-loader-spinner'
import CssLoader from '@/components/css-loader'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ForgetPasswordPage() {
  // 登入後設定全域的會員資料用
  const { mutate } = useAuthGet()
  const { logout } = useAuthLogout()
  const { requestOtpToken, isMutating: isRequesting } = useAuthGetOtpToken()
  const { resetPassword, isMutating: isResetting } = useAuthResetPassword()
  const { isAuth } = useAuth()

  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')

  // 載入loading元件
  const [loadingStep1, setLoadingStep1] = useState(false)
  const [loadingStep2, setLoadingStep2] = useState(false)
  const [showStep1, setShowStep1] = useState(true)
  const [showStep2, setShowStep2] = useState(false)

  const router = useRouter()

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

  // 處理要求一次性驗証碼用
  const handleRequestOtpToken = async () => {
    const res = await requestOtpToken(email)
    const resData = await res.json()

    // 除錯用
    console.log(resData)

    if (resData.status === 'success') {
      toast.success('資訊 - 驗証碼已寄送到電子郵件中')
    } else {
      toast.error(`錯誤 - ${resData.message}`)
    }
  }

  // 處理重設密碼用
  const handleResetPassword = async () => {
    const res = await resetPassword(email, password, token)
    const resData = await res.json()
    // 除錯用
    console.log(resData)

    if (resData.status === 'success') {
      toast.success('資訊 - 密碼已成功修改，導向使用者登入頁面')

      setTimeout(() => {
        router.push('/user')
      }, 2000)
    } else {
      toast.error(`錯誤 - ${resData.message}`)
    }
  }

  // 用loading來控制spinner動畫的顯示
  useEffect(() => {
    if (isRequesting) {
      setLoadingStep1(true)
      setTimeout(() => {
        setLoadingStep1(false)
        setShowStep1(false)
        setShowStep2(true)
      }, 2000)
    }
  }, [isRequesting])

  useEffect(() => {
    if (isResetting) {
      setShowStep2(false)
      setLoadingStep2(false)
      setTimeout(() => {
        setLoadingStep2(false)
      }, 2000)
    }
  }, [isResetting])

  const spinner1 = (
    <>
      {/* <RotatingLines eight={40} width={40} /> */}
      <CssLoader />
      寄出郵件中，請稍後...
    </>
  )
  const spinner2 = (
    <>
      {/* <RotatingLines eight={40} width={40} />
       */}
      <CssLoader />
      更新密碼中，請稍後...
    </>
  )

  const sectionStep1 = (
    <section id="step1">
      <h3>第一步: 輸入註冊的電子郵件信箱</h3>
      <label>
        電子郵件信箱:
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!showStep1}
        />
      </label>
      <br />
      <button onClick={handleRequestOtpToken}>取得驗証碼</button>
      <p>
        注意驗証碼有效期間為
        <span style={{ fontWeight: 700, color: 'red' }}>5分鐘</span>
        ，需要到期後才能再重新寄送。
      </p>
    </section>
  )

  const sectionStep2 = (
    <section id="step2">
      <h3>第二步: 輸入在電子郵件信箱中獲得的一次性驗証碼，與新的密碼</h3>
      <label>
        一次性驗証碼:
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={!showStep2}
        />
      </label>
      <br />
      <label>
        新密碼:
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!showStep2}
        />
      </label>
      <br />
      <button onClick={handleResetPassword} disabled={!showStep2}>
        重設密碼
      </button>
    </section>
  )

  return (
    <>
      <h1>忘記密碼</h1>
      <hr />
      <Link href="/user">使用者首頁</Link>
      <p>
        測試前請先確認以下項目: <br />
        (a) 登出才能測試 <br />
        (b) SMTP寄信與可寄信的Email信箱 <br />
        (c) 資料表otp與user都有符合後端api路由 <br />
        (d) 後端api/auth/reset-password, api/auth/otp路由先測通
      </p>
      <p>
        {isAuth ? '已登入' : '未登入'}
        <button onClick={handleLogout}>登出(logout)</button>
      </p>

      <hr />
      {loadingStep1 ? spinner1 : sectionStep1}
      <hr />
      {loadingStep2 ? spinner2 : sectionStep2}
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
