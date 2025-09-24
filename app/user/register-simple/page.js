'use client'

import { useState } from 'react'
import { useUserRegister } from '@/services/rest-client/use-user'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/hooks/use-auth'

// newUser資料範例(物件) - 已更新為新的資料結構
// {
//     "name":"金妮",
//     "password":"123456",
//     "email":"ginny@test.com",
//     "phone":"0912345678",
//     "birthdate":"1992-05-15",
//     "gender":"female"
// }

export default function RegisterPage() {
  const { register } = useUserRegister()
  const [userInput, setUserInput] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birthdate: '',
    gender: '',
    avatar: '',
  })

  const { isAuth } = useAuth()

  // 輸入帳號 密碼用
  const handleFieldChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    // 阻擋表單預設送出行為
    e.preventDefault()
    // 檢查是否有登入，如果有登入就不能註冊
    if (isAuth) {
      toast.error('錯誤 - 會員已登入')
      return
    }

    // 基本驗證 - name 為可選填
    if (!userInput.email || !userInput.password) {
      toast.error('錯誤 - 請填寫必要欄位 (Email 和密碼)')
      return
    }

    try {
      const res = await register(userInput)
      const resData = await res.json()

      console.log('註冊回應:', resData)
      
      if (resData.status === 'success') {
        toast.success('資訊 - 會員註冊成功')
        // 清空表單
        setUserInput({
          name: '',
          email: '',
          password: '',
          phone: '',
          birthdate: '',
          gender: '',
          avatar: '',
        })
      } else {
        toast.error(`錯誤 - 註冊失敗: ${resData.message}`)
      }
    } catch (error) {
      console.error('註冊錯誤:', error)
      toast.error('錯誤 - 註冊過程中發生錯誤')
    }
  }

  return (
    <>
      <h1>會員註冊</h1>
      <hr />
      <p>
        規則:
        註冊時，email不能與目前資料庫有相同的值。所有資料都儲存在 User 表中。
      </p>
      <p>注意: 進行註冊時，應該要在會員登出狀態</p>
      <p>會員狀態:{isAuth ? '已登入' : '未登入'}</p>
      <p>
        <a href="/user">會員登入認証&授權測試(JWT)</a>
      </p>
      <hr />
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            姓名 (可選填):
            <input
              type="text"
              name="name"
              value={userInput.name}
              onChange={handleFieldChange}
              placeholder="請輸入您的姓名 (可選填)"
            />
          </label>
        </p>
        <p>
          <label>
            電子郵件信箱:
            <input
              type="email"
              name="email"
              value={userInput.email}
              onChange={handleFieldChange}
              required
            />
          </label>
        </p>
        <p>
          <label>
            密碼:
            <input
              type="password"
              name="password"
              value={userInput.password}
              onChange={handleFieldChange}
              required
            />
          </label>
        </p>
        <p>
          <label>
            手機號碼:
            <input
              type="tel"
              name="phone"
              value={userInput.phone}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <p>
          <label>
            生日:
            <input
              type="date"
              name="birthdate"
              value={userInput.birthdate}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <p>
          <label>
            性別:
            <select
              name="gender"
              value={userInput.gender}
              onChange={handleFieldChange}
            >
              <option value="">請選擇</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </label>
        </p>
        <p>
          <label>
            頭像路徑:
            <input
              type="text"
              name="avatar"
              value={userInput.avatar}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <br />
        <button type="submit">註冊</button>
        <br />
        <button
          type="button"
          onClick={() => {
            // 測試帳號
            setUserInput({
              name: '榮恩',
              email: 'ron@test.com',
              password: '99999',
              phone: '0912345678',
              birthdate: '1990-01-01',
              gender: 'male',
              avatar: 'default-avatar.jpg',
            })
          }}
        >
          一鍵輸入範例
        </button>
      </form>
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
