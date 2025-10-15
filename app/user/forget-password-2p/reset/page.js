'use client'

import React, { useState, useEffect, Suspense } from 'react'
import {
  useAuthResetPasswordHash,
  useAuthCheckSecret,
} from '@/services/rest-client/use-user'
import { useAuth } from '@/hooks/use-auth'
import { useSearchParams, useRouter } from 'next/navigation'
import { isDev } from '@/config/client.config'
// 載入loading元件
// import { RotatingLines } from 'react-loader-spinner'
import CssLoader from '@/components/css-loader'
import { toast, ToastContainer } from 'react-toastify'
import Link from 'next/link'

function HashTokenContent() {
  const { resetPasswordHash, isMutating: isResetting } =
    useAuthResetPasswordHash()
  const { checkSecret } = useAuthCheckSecret()
  // 輸入表單用的狀態
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loadingStep2, setLoadingStep2] = useState(false)
  const [isSecretValid, setIsSecretValid] = useState(false)

  const { isAuth } = useAuth()
  // 取得網址參數，例如: ?secret=xxxxxx
  const searchParams = useSearchParams()
  const router = useRouter()

  if (isDev) console.log(searchParams)

  const secret = searchParams.get('secret')

  // 處理重設密碼用
  const handleResetPassword = async () => {
    if (isAuth) {
      toast.error('已登入會員')
      return
    }
    const res = await resetPasswordHash(secret, password, token)
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

  const handleCheckSecret = async (secret) => {
    const res = await checkSecret(secret)
    const resData = await res.json()
    // 除錯用
    console.log(resData)

    if (resData.status === 'success') {
      setIsSecretValid(true)
    } else {
      toast.error('錯誤 - 安全字串驗證錯誤，無法進行重設密碼，請重新申請')
    }
  }

  useEffect(() => {
    handleCheckSecret(secret)
    // eslint-disable-next-line
  }, [secret])

  useEffect(() => {
    if (isResetting) {
      setLoadingStep2(true)
      setTimeout(() => {
        setLoadingStep2(false)
      }, 2000)
    }
  }, [isResetting])

  const spinner2 = (
    <>
      {/* <RotatingLines eight={40} width={40} /> */}
      <CssLoader />
      更新密碼中 ，請稍後...
    </>
  )
  const sectionStep2 = (
    <section id="step2">
      <h3>第二步: 輸入在電子郵件信箱中獲得的一次性驗証碼，與新的密碼</h3>
      <Link href="/user">使用者首頁</Link>
      <hr />
      <label>
        一次性驗証碼:
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </label>
      <br />
      <label>
        新密碼:
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleResetPassword}>重設密碼</button>
    </section>
  )

  if (!isSecretValid)
    return (
      <>
        {/* <RotatingLines eight={40} width={40} /> */}
        <CssLoader />
        驗証安全字串中，請稍後...
        <ToastContainer />
      </>
    )

  return (
    <>
      <h1>忘記密碼:第二步</h1>
      <hr />
      {loadingStep2 ? spinner2 : sectionStep2}
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}

export default function HashTokenPage() {
  return (
    <Suspense fallback={<CssLoader />}>
      <HashTokenContent />
    </Suspense>
  )
}
