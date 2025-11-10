'use client'

import { useState, useEffect } from 'react'
import { useUserRegister } from '@/services/rest-client/use-user'
// 樣式已移至全域 theme-system.scss
import Swal from 'sweetalert2'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
// import { MdOutlineEmail } from 'react-icons/md'
// import Header from '@/components/layout/default-layout/header'
// import MyFooter from '@/components/layout/default-layout/my-footer'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import Head from 'next/head'

// import axios from 'axios' // 已移除，改用 useUserRegister hook
// import { apiBaseUrl } from '@/configs/index.js'
import { Col } from 'react-bootstrap'
export default function RegisterPage() {
  const { register } = useUserRegister()
  const [showpassword, setShowpassword] = useState(false)
  const [showConfirmpassword, setShowConfirmpassword] = useState(false)
  const { auth } = useAuth()

  // 多步驟表單狀態
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
    phone: '',
    birthdate: '',
    gender: '',
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

  // 步驟導航函數
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 步驟驗證函數
  const validateCurrentStep = () => {
    let newErrors = { ...errors }
    let isValid = true

    if (currentStep === 1) {
      // 第一步：基本資訊驗證
      if (!user.email) {
        newErrors.email = '信箱為必填'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(user.email)) {
        newErrors.email = '信箱格式不正確'
        isValid = false
      }

      if (user.name && user.name.length > 20) {
        newErrors.name = '姓名不能超過20個字元'
        isValid = false
      }
    } else if (currentStep === 2) {
      // 第二步：密碼驗證
      const passwordErrors = validatePassword(user.password)
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0]
        isValid = false
      }

      if (!user.confirmpassword) {
        newErrors.confirmpassword = '請再次輸入密碼'
        isValid = false
      } else if (user.confirmpassword !== user.password) {
        newErrors.confirmpassword = '兩次輸入的密碼不一致'
        isValid = false
      }
    } else if (currentStep === 3) {
      // 第三步：其他資訊驗證
      if (
        user.gender &&
        !['female', 'male', 'undisclosed'].includes(user.gender)
      ) {
        newErrors.gender = '請選擇有效的性別'
        isValid = false
      }

      if (!user.agree) {
        newErrors.agree = '請同意網站會員註冊條款'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep()
    }
  }

  // 確保密碼符合規則的函式
  const validatePassword = (password) => {
    //函式內宣告2個變數
    const rules = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const messages = {
      minLength: '密碼至少需要8個字元',
      hasUpperCase: '需要包含大寫字母',
      hasLowerCase: '需要包含小寫字母',
      hasNumber: '需要包含數字',
      hasSpecialChar: '需要包含特殊符號',
    }

    // 函式的返回值
    //  Object.entries() 是產生新的陣列，不會影響到原物件
    return (
      Object.entries(rules)
        .filter(([, valid]) => !valid)
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
      // eslint-disable-next-line no-unused-vars
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

        // 使用 window.location 進行頁面跳轉到登入頁面
        window.location.href = '/user/login'
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
  // 渲染步驟內容
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* 姓名輸入 */}
            <div className="mb-3">
              <label htmlFor="name" className="text-white fw-semibold">
                姓名<span className="text-white-50">(選填)</span>
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
                <div className="alert alert-danger py-2 mt-2" role="alert">
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
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {errors.email}
                </div>
              )}
            </div>
          </>
        )

      case 2:
        return (
          <>
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
                    <AiOutlineEyeInvisible size={20} className="eye-icon" />
                  ) : (
                    <AiOutlineEye size={20} className="eye-icon" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="confirmpassword" className="text-white">
                確認密碼
              </label>
              <div className="position-relative">
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
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y me-3 p-0"
                  onClick={() => setShowConfirmpassword(!showConfirmpassword)}
                  style={{ background: 'none', border: 'none' }}
                  aria-label={
                    showConfirmpassword ? '隱藏確認密碼' : '顯示確認密碼'
                  }
                >
                  {showConfirmpassword ? (
                    <AiOutlineEyeInvisible size={20} className="eye-icon" />
                  ) : (
                    <AiOutlineEye size={20} className="eye-icon" />
                  )}
                </button>
              </div>
              {errors.confirmpassword && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {errors.confirmpassword}
                </div>
              )}
            </div>
          </>
        )

      case 3:
        return (
          <>
            <div className="mb-3">
              <label htmlFor="phone" className="text-white fw-semibold">
                手機<span className="text-white-50">(選填)</span>
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
              <label htmlFor="birthdate" className="text-white fw-semibold">
                生日 <span className="text-white-50">(選填)</span>
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
                性別 <span className="text-white-50">(選填)</span>
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
                <option value="">請選擇性別 (選填)</option>
                <option value="female">女</option>
                <option value="male">男</option>
                <option value="undisclosed">不透漏</option>
              </select>
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
                <label htmlFor="agree" className="text-white form-check-label">
                  我同意{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    className="text-info text-decoration-underline"
                  >
                    服務條款
                  </a>
                  、{' '}
                  <a
                    href="/return-policy"
                    target="_blank"
                    className="text-info text-decoration-underline"
                  >
                    退換貨政策
                  </a>
                  、{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="text-info text-decoration-underline"
                  >
                    隱私權政策
                  </a>
                </label>
              </div>
              {errors.agree && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {errors.agree}
                </div>
              )}
            </div>
          </>
        )

      default:
        return null
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
      {/* 我想要做一個按鈕來切換主題顏色 */}

      <div className="gradient-bg geometricShape">
        {/* 雲海效果 - 根據當前主題顯示 */}
        <div className="cloud-effect"></div>

        <div className="container-fluid position-relative">
          <div className="row mt-5 align-items-center justify-content-center">
            {/* 左側歡迎區域 */}
            <Col
              lg={6}
              md={12}
              sm={12}
              className="d-flex align-items-center justify-content-center mb-4 mb-lg-0"
            >
              <div
                className="text-center text-lg-start px-4 px-lg-5"
                style={{ zIndex: 100 }}
              >
                <div className="mb-4">
                  <h1
                    className="display-4 fw-bold text-white mb-4"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    歡迎加入我們
                  </h1>
                  <div
                    className="bg-white bg-opacity-10 backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25"
                    style={{
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="mb-3">
                      <h3 className="text-white fw-semibold mb-3">
                        <span className="d-inline-block me-2">💭</span>
                        就算是I人
                      </h3>
                      <p
                        className="text-white fs-5 lh-lg mb-0"
                        style={{ opacity: 0.95 }}
                      >
                        這邊也能接納您所有的心情活動狀態，
                        <br />
                        並給予您想聽到的回饋
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-top border-white border-opacity-25">
                      <p className="text-white-50 small mb-0">
                        ✨ any time, any thought, sharing everything you want
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* 右側註冊表單 */}
            <Col
              lg={6}
              md={9}
              sm={10}
              className="d-flex align-items-center justify-content-center"
            >
              <div
                className="bg-transparent backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25 w-75"
                style={{ zIndex: 100 }}
              >
                {/* 頁籤切換 */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="btn-group" role="group">
                    <Link
                      href="/user/login"
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

                {/* 步驟指示器 */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="d-flex align-items-center">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="d-flex align-items-center">
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center ${
                            currentStep >= step
                              ? 'bg-primary text-white'
                              : 'bg-secondary text-white'
                          }`}
                          style={{
                            width: '30px',
                            height: '30px',
                            fontSize: '14px',
                          }}
                        >
                          {step}
                        </div>
                        {step < 3 && (
                          <div
                            className={`mx-2 ${
                              currentStep > step
                                ? 'text-primary'
                                : 'text-secondary'
                            }`}
                            style={{ width: '30px', height: '2px' }}
                          >
                            <div
                              className={`h-100 ${
                                currentStep > step
                                  ? 'bg-primary'
                                  : 'bg-secondary'
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 步驟標題 */}
                <div className="text-center mb-4">
                  <h5 className="text-white">
                    {currentStep === 1 && '基本資訊'}
                    {currentStep === 2 && '密碼設定'}
                    {currentStep === 3 && '個人資料'}
                  </h5>
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
                  {/* 步驟內容 */}
                  {renderStepContent()}

                  {/* 步驟導航按鈕 */}
                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className={`btn btn-outline-light px-4 py-2 ${
                        currentStep === 1 ? 'invisible' : ''
                      }`}
                      onClick={prevStep}
                    >
                      上一步
                    </button>

                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        className="btn theme-button px-4 py-2"
                        onClick={handleNext}
                        style={{
                          borderRadius: '12px',
                        }}
                      >
                        下一步
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn theme-button px-4 py-2"
                        style={{
                          borderRadius: '12px',
                        }}
                      >
                        完成註冊
                      </button>
                    )}
                  </div>
                </form>

                {/* 登入提示 */}
                <div className="text-center mt-4">
                  <span className="text-white-50">已經有帳號？</span>
                  <Link
                    href="/user/login"
                    className="text-white text-decoration-none ms-1 fw-semibold"
                  >
                    立即登入
                  </Link>
                </div>
              </div>
            </Col>
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

        /* Placeholder styling fix - CSS selector specificity was not high enough */
        /* The global styles in globals.scss were overriding the placeholder color */
        /* Using ID selectors and type selectors to increase CSS specificity */
        /* 最強制的 placeholder 樣式 - 使用更高優先級 */
        #name.form-control::placeholder,
        #email.form-control::placeholder,
        #password.form-control::placeholder,
        #confirmpassword.form-control::placeholder,
        #phone.form-control::placeholder,
        #birthdate.form-control::placeholder,
        input#name.form-control::placeholder,
        input#email.form-control::placeholder,
        input#password.form-control::placeholder,
        input#confirmpassword.form-control::placeholder,
        input#phone.form-control::placeholder,
        input#birthdate.form-control::placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        {/* webkit瀏覽器 */}
        #name.form-control::-webkit-input-placeholder,
        #email.form-control::-webkit-input-placeholder,
        #password.form-control::-webkit-input-placeholder,
        #confirmpassword.form-control::-webkit-input-placeholder,
        #phone.form-control::-webkit-input-placeholder,
        #birthdate.form-control::-webkit-input-placeholder,
        input#name.form-control::-webkit-input-placeholder,
        input#email.form-control::-webkit-input-placeholder,
        input#password.form-control::-webkit-input-placeholder,
        input#confirmpassword.form-control::-webkit-input-placeholder,
        input#phone.form-control::-webkit-input-placeholder,
        input#birthdate.form-control::-webkit-input-placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        #name.form-control::-moz-placeholder,
        #email.form-control::-moz-placeholder,
        #password.form-control::-moz-placeholder,
        #confirmpassword.form-control::-moz-placeholder,
        #phone.form-control::-moz-placeholder,
        #birthdate.form-control::-moz-placeholder,
        input#name.form-control::-moz-placeholder,
        input#email.form-control::-moz-placeholder,
        input#password.form-control::-moz-placeholder,
        input#confirmpassword.form-control::-moz-placeholder,
        input#phone.form-control::-moz-placeholder,
        input#birthdate.form-control::-moz-placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        /* 通用 placeholder 樣式 */
        input.form-control::placeholder,
        input.form-control::-webkit-input-placeholder,
        input.form-control::-moz-placeholder,
        input.form-control:-ms-input-placeholder,
        input.form-control:-moz-placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        input[type='text'].form-control::placeholder,
        input[type='email'].form-control::placeholder,
        input[type='password'].form-control::placeholder,
        input[type='tel'].form-control::placeholder,
        input[type='date'].form-control::placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        input[type='text'].form-control::-webkit-input-placeholder,
        input[type='email'].form-control::-webkit-input-placeholder,
        input[type='password'].form-control::-webkit-input-placeholder,
        input[type='tel'].form-control::-webkit-input-placeholder,
        input[type='date'].form-control::-webkit-input-placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        input[type='text'].form-control::-moz-placeholder,
        input[type='email'].form-control::-moz-placeholder,
        input[type='password'].form-control::-moz-placeholder,
        input[type='tel'].form-control::-moz-placeholder,
        input[type='date'].form-control::-moz-placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
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
