'use client'

import { useState, useEffect } from 'react'
import { useUserRegister } from '@/services/rest-client/use-user'
import { useAuthLogin } from '@/services/rest-client/use-user'
import Swal from 'sweetalert2'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { MdOutlineEmail } from 'react-icons/md'
import Head from 'next/head'

export default function CombinationPage() {
  // 註冊相關狀態
  const { register } = useUserRegister()
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false)

  // 登入相關狀態
  const { login } = useAuthLogin()
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const { auth } = useAuth()

  // 表單焦點狀態
  const [activeForm, setActiveForm] = useState(null)

  // 多步驟表單狀態
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // 註冊表單狀態
  const [registerUser, setRegisterUser] = useState({
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

  const [registerErrors, setRegisterErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
    gender: '',
    agree: '',
  })

  const [registerSubmitError, setRegisterSubmitError] = useState('')

  // 登入表單狀態
  const [loginUser, setLoginUser] = useState({
    email: '',
    password: '',
  })

  const [loginErrors, setLoginErrors] = useState({
    email: '',
    password: '',
  })

  const [loginSubmitError, setLoginSubmitError] = useState('')

  // 表單焦點處理
  const handleFormFocus = (formType) => {
    setActiveForm(formType)
  }

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

  // 確保密碼符合規則的函式
  const validatePassword = (password) => {
    const rules = {
      length: {
        regex: /.{8,}/,
        message: '密碼長度至少8個字元',
      },
      uppercase: {
        regex: /[A-Z]/,
        message: '密碼需包含至少一個大寫字母',
      },
      lowercase: {
        regex: /[a-z]/,
        message: '密碼需包含至少一個小寫字母',
      },
      number: {
        regex: /[0-9]/,
        message: '密碼需包含至少一個數字',
      },
      specialChar: {
        regex: /[!@#$%^&*(),.?":{}|<>]/,
        message: '密碼需包含至少一個特殊符號',
      },
    }

    for (const rule in rules) {
      if (!rules[rule].regex.test(password)) {
        return rules[rule].message
      }
    }
    return ''
  }

  // 步驟驗證函數
  const validateCurrentStep = () => {
    let newErrors = { ...registerErrors }
    let isValid = true

    // 清除當前步驟的錯誤訊息
    for (const key in newErrors) {
      newErrors[key] = ''
    }

    if (currentStep === 1) {
      // 第一步：基本資訊驗證
      if (!registerUser.email) {
        newErrors.email = '信箱為必填'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(registerUser.email)) {
        newErrors.email = '信箱格式不正確'
        isValid = false
      }

      if (registerUser.name && registerUser.name.length > 20) {
        newErrors.name = '姓名不能超過20個字元'
        isValid = false
      }
    } else if (currentStep === 2) {
      // 第二步：密碼驗證
      const passwordError = validatePassword(registerUser.password)
      if (passwordError) {
        newErrors.password = passwordError
        isValid = false
      }

      if (!registerUser.confirmpassword) {
        newErrors.confirmpassword = '請再次輸入密碼'
        isValid = false
      } else if (registerUser.confirmpassword !== registerUser.password) {
        newErrors.confirmpassword = '兩次輸入的密碼不一致'
        isValid = false
      }
    } else if (currentStep === 3) {
      // 第三步：其他資訊驗證
      if (
        registerUser.gender &&
        !['female', 'male', 'undisclosed'].includes(registerUser.gender)
      ) {
        newErrors.gender = '請選擇有效的性別'
        isValid = false
      }

      if (!registerUser.agree) {
        newErrors.agree = '請同意網站會員註冊條款'
        isValid = false
      }
    }

    setRegisterErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep()
    }
  }

  // 登入表單驗證
  const validateLoginForm = () => {
    let newErrors = { email: '', password: '' }
    let isValid = true

    // Email validation
    if (!loginUser.email) {
      newErrors.email = '信箱為必填'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(loginUser.email)) {
      newErrors.email = '信箱格式不正確'
      isValid = false
    }

    // Password validation
    if (!loginUser.password) {
      newErrors.password = '密碼為必填'
      isValid = false
    }

    setLoginErrors(newErrors)
    return isValid
  }

  // 註冊表單欄位變更
  const handleRegisterFieldChange = (e) => {
    const { name, value, type, checked } = e.target
    setRegisterUser((prevUser) => ({
      ...prevUser,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // 清除特定欄位的錯誤訊息
    setRegisterErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
    setRegisterSubmitError('')
  }

  // 登入表單欄位變更
  const handleLoginFieldChange = (e) => {
    const { name, value } = e.target
    setLoginUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }))
    setLoginErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
    setLoginSubmitError('')
  }

  // 註冊提交
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegisterSubmitError('')

    // 在提交前，確保最後一步的驗證也通過
    if (!validateCurrentStep()) {
      setRegisterSubmitError('請檢查所有必填欄位')
      return
    }

    try {
      const res = await register(registerUser)
      console.log('註冊成功:', res)
      if (res.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: '註冊成功',
          text: '您已成功註冊，即將跳轉到登入頁面。',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = '/user'
        })
      } else {
        setRegisterSubmitError(res.message || '註冊失敗，請稍後再試。')
      }
    } catch (error) {
      console.error('註冊失敗:', error)
      setRegisterSubmitError(error.message || '註冊失敗，請稍後再試。')
    }
  }

  // 登入提交
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginSubmitError('')

    if (!validateLoginForm()) {
      setLoginSubmitError('請檢查所有必填欄位')
      return
    }

    try {
      const res = await login(loginUser)
      console.log('登入成功:', res)
      if (res.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: '登入成功',
          text: '您已成功登入，即將跳轉到儀表板。',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = '/dashboard'
        })
      } else {
        setLoginSubmitError(res.message || '登入失敗，請檢查帳號密碼。')
      }
    } catch (error) {
      console.error('登入失敗:', error)
      setLoginSubmitError(error.message || '登入失敗，請檢查帳號密碼。')
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
              <label htmlFor="register-name" className="text-white fw-semibold">
                姓名
              </label>
              <input
                type="text"
                id="register-name"
                name="name"
                className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                value={registerUser.name}
                onChange={handleRegisterFieldChange}
                placeholder="請輸入您的姓名 (可選填)"
                maxLength={20}
                style={{
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                }}
              />
              {registerErrors.name && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {registerErrors.name}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label
                htmlFor="register-email"
                className="text-white fw-semibold"
              >
                帳號(信箱)
              </label>
              <input
                type="email"
                id="register-email"
                name="email"
                className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                value={registerUser.email}
                onChange={handleRegisterFieldChange}
                placeholder="請輸入您的信箱"
                required
                style={{
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                }}
              />
              {registerErrors.email && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {registerErrors.email}
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
                htmlFor="register-password"
                className="form-label text-white fw-semibold"
              >
                密碼
              </label>
              <div className="position-relative">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  id="register-password"
                  name="password"
                  value={registerUser.password}
                  onChange={handleRegisterFieldChange}
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
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  style={{ background: 'none', border: 'none' }}
                >
                  {showRegisterPassword ? (
                    <AiOutlineEyeInvisible size={20} color="#E0B0FF" />
                  ) : (
                    <AiOutlineEye size={20} color="#E0B0FF" />
                  )}
                </button>
              </div>
              {registerErrors.password && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {registerErrors.password}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="register-confirmpassword" className="text-white">
                確認密碼
              </label>
              <input
                type={showRegisterConfirmPassword ? 'text' : 'password'}
                id="register-confirmpassword"
                name="confirmpassword"
                className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                value={registerUser.confirmpassword}
                onChange={handleRegisterFieldChange}
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
                  id="showRegisterConfirmpassword"
                  checked={showRegisterConfirmPassword}
                  onChange={() =>
                    setShowRegisterConfirmPassword(!showRegisterConfirmPassword)
                  }
                  className="form-check-input"
                />
                <label
                  htmlFor="showRegisterConfirmpassword"
                  className="text-white form-check-label"
                >
                  顯示密碼
                </label>
              </div>
              {registerErrors.confirmpassword && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {registerErrors.confirmpassword}
                </div>
              )}
            </div>
          </>
        )

      case 3:
        return (
          <>
            <div className="mb-3">
              <label
                htmlFor="register-phone"
                className="text-white fw-semibold"
              >
                手機
              </label>
              <input
                type="tel"
                id="register-phone"
                name="phone"
                className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                value={registerUser.phone}
                onChange={handleRegisterFieldChange}
                placeholder="請輸入您的手機號碼"
                style={{
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                }}
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="register-birthdate"
                className="text-white fw-semibold"
              >
                生日
              </label>
              <input
                type="date"
                id="register-birthdate"
                name="birthdate"
                className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                value={registerUser.birthdate}
                onChange={handleRegisterFieldChange}
                style={{
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                }}
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="register-gender"
                className="text-white fw-semibold"
              >
                性別
              </label>
              <select
                id="register-gender"
                name="gender"
                className="form-select form-select-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                value={registerUser.gender}
                onChange={handleRegisterFieldChange}
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
              <label
                htmlFor="register-avatar"
                className="text-white fw-semibold"
              >
                頭像路徑
              </label>
              <input
                type="text"
                id="register-avatar"
                name="avatar"
                className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                value={registerUser.avatar}
                onChange={handleRegisterFieldChange}
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
                  id="register-agree"
                  name="agree"
                  checked={registerUser.agree}
                  onChange={handleRegisterFieldChange}
                  className="form-check-input"
                />
                <label
                  htmlFor="register-agree"
                  className="text-white form-check-label"
                >
                  我同意網站會員註冊條款
                </label>
              </div>
              {registerErrors.agree && (
                <div className="alert alert-danger py-2 mt-2" role="alert">
                  {registerErrors.agree}
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
        <title>登入 & 註冊</title>
      </Head>

      <div className="gradient-bg min-vh-100">
        {/* 雲海效果 - 只在 Pink 主題時顯示 */}
        <div className="cloud-effect"></div>

        <div className="container position-relative h-100">
          <div className="row h-100 align-items-center justify-content-center">
            {/* 左側註冊表單 */}
            <div className="col-lg-6 col-md-12 mb-5 mb-lg-0">
              <div
                className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25 transition-all duration-300 ${
                  activeForm === 'login' ? 'opacity-50 pointer-events-none' : ''
                }`}
                onFocus={() => handleFormFocus('register')}
                onClick={() => handleFormFocus('register')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFormFocus('register')
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="text-center mb-4">
                  <h3 className="text-white fw-bold">註冊新帳號</h3>
                  <p className="text-white-50">
                    加入我們，開始成為時間管理大師
                  </p>
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
                {registerSubmitError && (
                  <div className="alert alert-danger py-2 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {registerSubmitError}
                  </div>
                )}

                {/* 註冊表單 */}
                <form
                  onSubmit={handleRegisterSubmit}
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
                        className="btn btn-primary px-4 py-2"
                        onClick={handleNext}
                        style={{
                          background:
                            'linear-gradient(45deg, #805AF5, #E0B0FF)',
                          border: 'none',
                          borderRadius: '12px',
                        }}
                      >
                        下一步
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-primary px-4 py-2"
                        style={{
                          background:
                            'linear-gradient(45deg, #805AF5, #E0B0FF)',
                          border: 'none',
                          borderRadius: '12px',
                        }}
                      >
                        完成註冊
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* 右側登入表單 */}
            <div className="col-lg-6 col-md-8 col-sm-12">
              <div
                className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25 transition-all duration-300 ${
                  activeForm === 'register'
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }`}
                onFocus={() => handleFormFocus('login')}
                onClick={() => handleFormFocus('login')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFormFocus('login')
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="text-center mb-4">
                  <h3 className="text-white fw-bold">登入帳號</h3>
                  <p className="text-white-50">
                    歡迎回來，繼續你的時間管理之旅
                  </p>
                </div>

                {/* 錯誤訊息 */}
                {loginSubmitError && (
                  <div className="alert alert-danger py-2 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {loginSubmitError}
                  </div>
                )}

                {/* 登入表單 */}
                <form
                  onSubmit={handleLoginSubmit}
                  className="needs-validation"
                  noValidate
                >
                  {/* 帳號(信箱)輸入 */}
                  <div className="mb-3">
                    <label
                      htmlFor="login-email"
                      className="text-white fw-semibold"
                    >
                      帳號(信箱)
                    </label>
                    <div className="position-relative">
                      <input
                        type="email"
                        id="login-email"
                        name="email"
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                        value={loginUser.email}
                        onChange={handleLoginFieldChange}
                        placeholder="請輸入您的信箱"
                        required
                        style={{
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                        }}
                      />
                      <MdOutlineEmail
                        className="position-absolute top-50 end-0 translate-middle-y me-3"
                        size={20}
                        style={{ color: '#E0B0FF' }}
                      />
                    </div>
                    {loginErrors.email && (
                      <div
                        className="alert alert-danger py-2 mt-2"
                        role="alert"
                      >
                        {loginErrors.email}
                      </div>
                    )}
                  </div>

                  {/* 密碼輸入 */}
                  <div className="mb-4">
                    <label
                      htmlFor="login-password"
                      className="form-label text-white fw-semibold"
                    >
                      密碼
                    </label>
                    <div className="position-relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        id="login-password"
                        name="password"
                        value={loginUser.password}
                        onChange={handleLoginFieldChange}
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                        placeholder="請輸入您的密碼"
                        required
                        style={{
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                        }}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y me-3 p-0"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        style={{ background: 'none', border: 'none' }}
                      >
                        {showLoginPassword ? (
                          <AiOutlineEyeInvisible size={20} color="#E0B0FF" />
                        ) : (
                          <AiOutlineEye size={20} color="#E0B0FF" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <div
                        className="alert alert-danger py-2 mt-2"
                        role="alert"
                      >
                        {loginErrors.password}
                      </div>
                    )}
                  </div>

                  {/* 登入按鈕 */}
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
                      登入
                    </button>
                  </div>

                  {/* 忘記密碼 */}
                  <div className="text-center">
                    <Link
                      href="./forget-password"
                      className="text-white text-decoration-none"
                    >
                      忘記密碼？
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-control:focus {
          background-color: rgba(255, 255, 255, 0.15) !important;
          border-color: #e0b0ff !important;
          box-shadow: 0 0 0 0.2rem rgba(224, 176, 255, 0.25) !important;
        }

        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        @media (max-width: 768px) {
          .display-4 {
            font-size: 2rem !important;
          }
          .display-3 {
            font-size: 2.5rem !important;
          }
        }
    </>
  )
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
