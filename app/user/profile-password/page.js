'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useUserUpdatePassword } from '@/services/rest-client/use-user'
import { useAuth } from '@/hooks/use-auth'

// 定義要在此頁呈現/編輯的會員資料初始物件
const initUserPassword = {
  current: '', // 原本密碼，要比對成功才能修改
  new: '', // 新密碼
  confirm: '', //確認新密碼用(前端檢查用，不送後端)
}

export default function PasswordPasswordPage() {
  const { updatePassword } = useUserUpdatePassword()
  // 需要會員登入時的id
  const { isAuth } = useAuth()
  // 本頁狀態用
  const [userPasswordInput, setUserPasswordInput] = useState(initUserPassword)

  // 輸入資料用
  const handleFieldChange = (e) => {
    setUserPasswordInput({
      ...userPasswordInput,
      [e.target.name]: e.target.value,
    })
  }

  // 送出表單用
  const handleSubmit = async (e) => {
    // 阻擋表單預設送出行為
    e.preventDefault()

    // 表單驗証 - START
    if (
      !userPasswordInput.new ||
      !userPasswordInput.current ||
      !userPasswordInput.confirm
    ) {
      toast.error('密碼欄位為必填')
      return // 跳出函式
    }

    if (userPasswordInput.new !== userPasswordInput.confirm) {
      toast.error('新密碼與確認密碼不同')
      return // 跳出函式
    }
    // 表單驗証 - END

    // 送到伺服器進行更新
    const password = {
      currentPassword: userPasswordInput.current,
      newPassword: userPasswordInput.new,
    }
    const res = await updatePassword(password)
    const resData = await res.json()

    console.log(resData)

    if (resData.status === 'success') {
      toast.success('會員密碼修改成功')
    } else {
      toast.error(`會員密碼修改失敗: ${resData?.message || ''}`)
    }
  }

  // 未登入時，不會出現頁面內容
  if (!isAuth) return <></>

  return (
    <>
      <h1>會員資料修改(密碼)</h1>
      <hr />
      <p>
        規則: 需要輸入目前密碼(原密碼)一併在伺服器上驗証通過後，才能更新密碼
      </p>
      <p>
        注意: 這頁面沒有初始載入的動作
        。一般會員個人資料不在這裡修改，因機制不一樣，會在
        <Link href="/user/profile">會員資料修改(一般)</Link>
      </p>
      <p>
        <Link href="/user">會員登入認証&授權測試(JWT)</Link>
      </p>
      <hr />
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            目前密碼
            <input
              type="text"
              name="current"
              value={userPasswordInput.current}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <p>
          <label>
            新密碼
            <input
              type="text"
              name="new"
              value={userPasswordInput.new}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <p>
          <label>
            新密碼確認
            <input
              type="text"
              name="confirm"
              value={userPasswordInput.confirm}
              onChange={handleFieldChange}
            />
          </label>
        </p>

        <br />
        <button type="submit">修改</button>
        <br />
      </form>

      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
