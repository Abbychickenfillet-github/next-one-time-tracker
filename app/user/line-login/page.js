'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import LineLogo from '../_components/line-logo'
import {
  useAuthGet,
  // useAuthLogout,
  lineLoginRequest,
  lineLogout,
  lineLoginCallback,
} from '@/services/rest-client/use-user'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// 載入loading元件
// import { Oval } from 'react-loader-spinner'
import CssLoader from '@/components/css-loader'

function LineLoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuth, user, isLoading } = useAuth()
  const { mutate } = useAuthGet()
  // const { logout } = useAuthLogout()

  // 處理登出
  const handleLineLogout = async () => {
    // 如果是已登入狀態，就不要再登入
    if (!isAuth) {
      toast.error('錯誤 - 會員未登入')
      return
    }

    // const resData = await lineLogout(user.lineUid)
    // const res = await logout()
    const res = await lineLogout()
    const resData = await res.json()

    console.log(resData)

    // 成功登出個回復初始會員狀態
    if (resData.status === 'success') {
      // 重新取得會員資料
      mutate()
      // 顯示成功訊息
      toast.success('已成功登出')
    } else {
      toast.error(`登出失敗`)
    }
  }

  // 處理line登入後，要向伺服器進行登入動作
  const callbackLineLogin = async (query) => {
    const resData = await lineLoginCallback(query)
    // const resData = await res.json()

    console.log(resData)

    if (resData.status === 'success') {
      // 重新取得會員資料
      mutate()

      toast.success('已成功登入')
    } else {
      toast.error('登入失敗')
    }
  }

  // 處理登入
  const goLineLogin = async () => {
    // 如果是已登入狀態，就不要再登入
    if (isAuth) {
      toast.error('錯誤 - 會員已登入')
      return
    }

    // 從後端伺服器取得line登入網址
    await lineLoginRequest()
  }

  // didMount後，取得商品資料
  useEffect(() => {
    // 如果已登入，就導向原本的頁面
    if (isAuth) {
      router.replace('/user/line-login')
      return
    }

    // 沒登入才會作以下，如果找到了給定的查詢參數，則傳回字串；否則傳回 null
    if (searchParams.get('code')) {
      // 發送至後端伺服器得到line會員資料
      const params = {
        code: searchParams.get('code'),
        state: searchParams.get('state'),
      }

      callbackLineLogin(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuth])

  if (isLoading) {
    return (
      <>
        <CssLoader />
        <p>載入中...請稍後</p>
      </>
    )
  }

  return (
    <>
      <h1>Line登入頁面+回調頁</h1>
      <p>注意: 進行登入時，應該要在會員登出狀態</p>
      <p>會員狀態:{isAuth ? '已登入' : '未登入'}</p>
      <p>
        <a href="/user">會員登入認証&授權測試(JWT)</a>
      </p>
      <hr />
      <p>會員資料:{JSON.stringify(user)}</p>
      <hr />
      <button onClick={goLineLogin}>
        <LineLogo /> 登入
      </button>
      <br />
      <button onClick={handleLineLogout}>LINE 登出(logout)</button>
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}

export default function LineLoginPage() {
  return (
    <Suspense fallback={<CssLoader />}>
      <LineLoginContent />
    </Suspense>
  )
}
