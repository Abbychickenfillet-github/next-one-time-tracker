'use client'

import { useState, useEffect } from 'react'
// countdown use
import useInterval from '@/hooks/use-interval'
import { useAuth } from '@/hooks/use-auth'
import {
  useAuthGet,
  useAuthLogout,
  useAuthGetOtpToken,
} from '@/services/rest-client/use-user'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 載入loading元件
// import { RotatingLines } from 'react-loader-spinner'
import CssLoader from '@/components/css-loader'
import { toast, ToastContainer } from 'react-toastify'

export default function ForgetPassword2PPage() {
  // 登入後設定全域的會員資料用
  const { mutate } = useAuthGet()
  const { logout } = useAuthLogout()
  const { requestOtpToken, isMutating: isRequesting } = useAuthGetOtpToken()
  const { isAuth } = useAuth()
  const router = useRouter()

  const [disableBtn, setDisableBtn] = useState(false)
  const [disableGo2Btn, setDisableGo2Btn] = useState(true)
  // 載入loading元件
  const [loadingStep1, setLoadingStep1] = useState(false)
  const [showStep1, setShowStep1] = useState(true)
  // 輸入的電子郵件信箱
  const [email, setEmail] = useState('')
  const [hashToken, setHashToken] = useState('')
  // 倒數計時 countdown use
  const [count, setCount] = useState(60) // 60s
  const [delay, setDelay] = useState(null) // delay=null可以停止, delay是數字時會開始倒數

  // 倒數計時 countdown use
  useInterval(() => {
    setCount(count - 1)
  }, delay)
  // 倒數計時 countdown use
  useEffect(() => {
    if (count <= 0) {
      setDelay(null)
      setDisableBtn(false)
    }
  }, [count])

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
    if (delay !== null) {
      toast.error('錯誤 - 60s內無法重新獲得驗証碼')
      return
    }

    const res = await requestOtpToken(email)
    const resData = await res.json()

    // 除錯用
    console.log(resData)

    if (resData.status === 'success') {
      toast.success('資訊 - 驗証碼已寄送到電子郵件中')
      setCount(300) // 倒數 300秒
      setDelay(1000) // 每 1000ms = 1s 減1
      setDisableBtn(true)
      setDisableGo2Btn(false)
      setHashToken(resData.data.hashToken)
    } else {
      toast.error(`錯誤 - ${resData.message}`)
    }
  }

  const handleGoStep2 = () => {
    if (!hashToken) {
      toast.error('錯誤 - 請先取得驗証碼')
      return
    }

    router.push(`/user/forget-password-2p/reset?secret=${hashToken}`)
  }

  // 用loading來控制spinner動畫的顯示
  useEffect(() => {
    if (isRequesting) {
      setLoadingStep1(true)
      setTimeout(() => {
        setLoadingStep1(false)
        setShowStep1(false)
      }, 2000)
    }
  }, [isRequesting])

  const spinner1 = (
    <>
      {/* <RotatingLines eight={40} width={40} /> */}
      <CssLoader />
      寄出郵件中，請稍後...
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
      <button onClick={handleRequestOtpToken} disabled={disableBtn}>
        {delay ? count + '秒後可以再次取得驗証碼' : '取得驗証碼'}
      </button>
      <hr />
      <button onClick={handleGoStep2} disabled={disableGo2Btn}>
        下一步: 輸入驗証碼與新密碼
      </button>
    </section>
  )

  return (
    <>
      <h1>忘記密碼:第一步</h1>
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

      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
