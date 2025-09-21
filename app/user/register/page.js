'use client'

import { useState, useEffect } from 'react'
import { useUserRegister } from '@/services/rest-client/use-user'

import styles from './styles/signUpForm.module.scss'
import Swal from 'sweetalert2'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
// import { MdOutlineEmail } from 'react-icons/md'
// import Header from '@/components/layout/default-layout/header'
// import MyFooter from '@/components/layout/default-layout/my-footer'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import Head from 'next/head'
import GlowingText from '@/components/glowing-text/glowing-text'
// import axios from 'axios' // 已移除，改用 useUserRegister hook
// import { apiBaseUrl } from '@/configs/index.js'

export default function RegisterPage() {
  const { register } = useUserRegister()
  const [showpassword, setShowpassword] = useState(false)
  const [showConfirmpassword, setShowConfirmpassword] = useState(false)
  const { auth } = useAuth()
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
    phone: '',
    birthdate: '',
    gender: '',
    avatar: '',
    agree: false,
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
    gender: '',
    agree: '',
  })

  const [submitError, setSubmitError] = useState('')
// 確保密碼符合規則的函式
  const validatePassword = (password) => {
    //函式內宣告2個變數
    const rules = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password), //2
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    }

    const messages = {
      minLength: '密碼至少需要8個字元',
      hasUpperCase: '需要包含大寫字母', //2
      hasLowerCase: '需要包含小寫字母',
      hasNumber: '需要包含數字',
    }

    // 函式的返回值
    //  Object.entries() 是產生新的陣列，不會影響到原物件
    return (
      Object.entries(rules)
        .filter(([rule, valid]) => !valid)
        // !valid 意思是找出值是 false 的規則，也就是找出錯誤沒有依照規則填寫密碼的牴觸項目對嗎
        .map(([rule]) => messages[rule])
    )
    // 用 rule 當作 key 去 messages 物件找對應的訊息
  }

  

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target
    setUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // name 欄位為可選填，但如果填寫了需要符合長度限制
    if (user.name && user.name.length > 20) {
      newErrors.name = '姓名不能超過20個字元'
    }

    if (!user.email) {
      newErrors.email = 'Email為必填'
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = '請輸入有效的Email格式'
    }

    if (!user.password) {
      newErrors.password = '密碼為必填'
    } else if (user.password.length < 8) {
      newErrors.password = '密碼長度至少8個字元'
    }

    if (!user.confirmpassword) {
      newErrors.confirmpassword = '確認密碼為必填'
    } else if (user.password !== user.confirmpassword) {
      newErrors.confirmpassword = '密碼與確認密碼不相符'
    }

    if (!user.agree) {
      newErrors.agree = '請先同意會員註冊條款'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitError('')

      if (!validateForm()) {
        return
      }
      const passwordErrors = validatePassword(user.password)
      if (passwordErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          password: passwordErrors[0],
        }))
        return
      }

      // 過濾掉不需要發送到後端的欄位
      const { confirmpassword, agree, ...userData } = user
      
      const response = await register(userData)
      const resData = await response.json()

      if (resData.status === 'success') {
        setUser({
          name: '',
          email: '',
          password: '',
          confirmpassword: '',
          phone: '',
          birthdate: '',
          gender: '',
          avatar: '',
          agree: false,
        })

        setErrors({})
        setSubmitError('')

        await Swal.fire({
          title: '註冊成功！',
          text: '歡迎加入我們！',
          icon: 'success',
          confirmButtonText: '前往登入',
          confirmButtonColor: '#3085d6',
        })

        // 使用 window.location 進行頁面跳轉
        window.location.href = '/user'
      } else {
        await Swal.fire({
          title: '註冊失敗',
          text: resData.message,
          icon: 'error',
          confirmButtonText: '確定',
          confirmButtonColor: '#3085d6',
        })
        setSubmitError(resData.message)
      }
    } catch (error) {
      console.error('註冊請求失敗:', error)
      const errorMessage = error.message || '註冊過程中發生錯誤'

      await Swal.fire({
        title: '註冊失敗',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: '確定',
        confirmButtonColor: '#3085d6',
      })

      setSubmitError(errorMessage)
    }
  }
  useEffect(() => {
    // 如果用戶已登入，重定向到儀表板
    if (auth.isAuth) {
      window.location.href = '/dashboard'
    }
  }, [auth.isAuth])
  return (
    <>
      <Head>
        <title>註冊</title>
      </Head>

      {/* <Header /> */}

      <div
        className={`${styles['gradient-bg']} ${styles['signup-bg']} min-vh-100`}
      >
        {/* <Image
          src="/bgi/signup_bgi.png"
          alt="background"
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
        /> */}

        <div className="container position-relative h-100">
          <div className="row h-100 align-items-center justify-content-center">
            {/* 左側歡迎區域 */}
            <div className="col-lg-6 col-md-12 mb-5 mb-lg-0">
              <div className="text-center text-lg-start">
                <div className="mb-4">
                  <GlowingText
                    text="Welcome"
                    className="text-white display-4 fw-bold mb-3"
                  />
                </div>
                <div className="mb-4">
                  <GlowingText
                    text="Signing up to Timelog"
                    className="text-white display-3 fw-bold"
                  />
                </div>
                <p className="text-white-50 fs-5">
                  加入我們，開啟你的筆電探索之旅
                </p>
              </div>
            </div>

            {/* 右側註冊表單 */}
            <div className="col-lg-5 col-md-8 col-sm-12">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25">
                {/* 頁籤切換 */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="btn-group" role="group">
                    <Link
                      href="/user"
                      className="btn btn-outline-light px-4 py-2"
                    >
                      登入
                    </Link>
                    <Link
                      href="/user/register"
                      className="btn btn-outline-light active px-4 py-2"
                    >
                      註冊
                    </Link>
                  </div>
                </div>

                {/* 錯誤訊息 */}
                {submitError && (
                  <div className="alert alert-danger py-2 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {submitError}
                  </div>
                )}

                {/* 註冊表單 */}
                <form
                  onSubmit={handleSubmit}
                  className="needs-validation"
                  noValidate
                >
                  {/* 姓名輸入 */}
                  <div className="mb-3">
                    <label htmlFor="name" className="text-white fw-semibold">
                      姓名
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                      value={user.name}
                      onChange={handleFieldChange}
                      placeholder="請輸入您的姓名 (可選填)"
                      maxLength={20}
                      style={{
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                      }}
                    />
                    {errors.name && (
                      <div
                        className="alert alert-danger py-2 mt-2"
                        role="alert"
                      >
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="text-white fw-semibold">
                      帳號(信箱)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                      value={user.email}
                      onChange={handleFieldChange}
                      placeholder="請輸入您的信箱"
                      required
                      style={{
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                      }}
                    />
                    {errors.email && (
                      <div
                        className="alert alert-danger py-2 mt-2"
                        role="alert"
                      >
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* 密碼輸入 */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label text-white fw-semibold"
                    >
                      密碼
                    </label>
                    <div className="position-relative">
                      <input
                        type={showpassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={user.password}
                        onChange={handleFieldChange}
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                        placeholder="請輸入您的密碼"
                        required
                        maxLength={62}
                        style={{
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                        }}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y me-3 p-0"
                        onClick={() => setShowpassword(!showpassword)}
                        style={{ background: 'none', border: 'none' }}
                      >
                        {showpassword ? (
                          <AiOutlineEyeInvisible size={20} color="#E0B0FF" />
                        ) : (
                          <AiOutlineEye size={20} color="#E0B0FF" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div
                        className="alert alert-danger py-2 mt-2"
                        role="alert"
                      >
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmpassword" className="text-white">
                      確認密碼
                    </label>
                    <input
                      type={showConfirmpassword ? 'text' : 'password'}
                      id="confirmpassword"
                      name="confirmpassword"
                      className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                      value={user.confirmpassword}
                      onChange={handleFieldChange}
                      placeholder="請再次輸入您的密碼"
                      required
                      style={{
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                      }}
                    />
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="showConfirmpassword"
                        checked={showConfirmpassword}
                        onChange={() =>
                          setShowConfirmpassword(!showConfirmpassword)
                        }
                        className="form-check-input"
                      />
                      <label
                        htmlFor="showConfirmpassword"
                        className="text-white form-check-label"
                      >
                        顯示密碼
                      </label>
                    </div>
                    {errors.confirmpassword && (
                      <div
                        className="alert alert-danger py-2 mt-2"
                        role="alert"
                      >
                        {errors.confirmpassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="text-white fw-semibold">
                      手機
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                      value={user.phone}
                      onChange={handleFieldChange}
                      placeholder="請輸入您的手機號碼"
                      style={{
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="birthdate"
                      className="text-white fw-semibold"
                    >
                      生日
                    </label>
                    <div className="">
                      <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                        value={user.birthdate}
                        onChange={handleFieldChange}
                        style={{
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="gender" className="text-white fw-semibold">
                      性別
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="form-select form-select-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                      value={user.gender}
                      onChange={handleFieldChange}
                      style={{
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                      }}
                    >
                      <option value="">請選擇</option>
                      <option value="female">女</option>
                      <option value="male">男</option>
                      <option value="undisclosed">不透漏</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="avatar" className="text-white fw-semibold">
                      頭像路徑
                    </label>
                    <input
                      type="text"
                      id="avatar"
                      name="avatar"
                      className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                      value={user.avatar}
                      onChange={handleFieldChange}
                      placeholder="請輸入頭像路徑 (可選)"
                      style={{
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="agree"
                        name="agree"
                        checked={user.agree}
                        onChange={handleFieldChange}
                        className="form-check-input"
                      />
                      <label
                        htmlFor="agree"
                        className="text-white form-check-label"
                      >
                        我同意網站會員註冊條款
                      </label>
                    </div>
                    {errors.agree && (
                      <div
                        className="alert alert-danger py-2 mt-2"
                        role="alert"
                      >
                        {errors.agree}
                      </div>
                    )}
                  </div>

                  {/* 送出按鈕 */}
                  <div className="d-grid mb-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg fw-semibold py-3"
                      style={{
                        background: 'linear-gradient(45deg, #805AF5, #E0B0FF)',
                        border: 'none',
                        borderRadius: '12px',
                      }}
                    >
                      註冊
                    </button>
                  </div>

                  {/* 登入提示 */}
                  <div className="text-center">
                    <span className="text-white-50">已經有帳號？</span>
                    <Link
                      href="/user"
                      className="text-white text-decoration-none ms-1 fw-semibold"
                    >
                      立即登入
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <MyFooter /> */}

      <style jsx>{`
        .hover-text-white:hover {
          color: white !important;
        }

        .form-control:focus {
          background-color: rgba(255, 255, 255, 0.15) !important;
          border-color: #e0b0ff !important;
          box-shadow: 0 0 0 0.2rem rgba(224, 176, 255, 0.25) !important;
        }

        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .btn-outline-light.active {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }

        .btn-outline-light:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        @media (max-width: 768px) {
          .display-4 {
            font-size: 2rem !important;
          }
          .display-3 {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </>
  )
}
