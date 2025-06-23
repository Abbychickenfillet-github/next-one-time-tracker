'use client'

import useFirebase from '../_hooks/use-firebase'
import { useAuth } from '@/hooks/use-auth'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import GoogleLogo from '../_components/google-logo'
import {
  useAuthGoogleLogin,
  useAuthGet,
  useAuthLogout,
} from '@/services/rest-client/use-user'

// 因瀏覽器安全限制，改用signInWithPopup，詳見以下討論
// https://github.com/orgs/mfee-react/discussions/129
export default function GoogleLoginPopup() {
  const { loginGoogle, logoutFirebase } = useFirebase()
  const { isAuth } = useAuth()
  const { googleLogin } = useAuthGoogleLogin()
  const { mutate } = useAuthGet()
  const { logout } = useAuthLogout()

  // 處理google登入後，要向伺服器進行登入動作
  const callbackGoogleLoginPopup = async (providerData) => {
    console.log(providerData)

    // 向伺服器進行登入動作
    const res = await googleLogin(providerData)
    const resData = await res.json()

    console.log(resData)

    if (resData.status === 'success') {
      // 重新取得會員資料
      mutate()
      // 顯示成功訊息
      toast.success('已成功登入')
    } else {
      toast.error(`登入失敗`)
    }
  }

  // 處理登出(包含firebase登出)
  const handleLogout = async () => {
    // firebase logout(注意，這並不會登出google帳號，是登出firebase的帳號)
    logoutFirebase()

    const res = await logout()
    const resData = await res.json()

    // 成功登出後，回復初始會員狀態
    if (resData.status === 'success') {
      // 重新取得會員資料
      mutate()
      // 顯示成功訊息
      toast.success('已成功登出')
    } else {
      toast.error(`登出失敗`)
    }
  }

  return (
    <>
      <h1>Google Login跳出視窗(popup)測試頁</h1>
      <p>注意: 進行登入時，應該要在會員登出狀態</p>
      <p>會員狀態:{isAuth ? '已登入' : '未登入'}</p>
      <p>
        <a href="/user">會員登入認証&授權測試(JWT)</a>
      </p>
      <hr />
      <button
        onClick={() => {
          // 如果是已登入狀態，就不要再登入
          if (isAuth) {
            toast.error('錯誤 - 會員已登入')
            return
          }
          loginGoogle(callbackGoogleLoginPopup)
        }}
      >
        <GoogleLogo /> Google登入
      </button>
      <br />
      <button onClick={handleLogout}>登出</button>
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
