'use client'
import React, { useState, useEffect } from 'react'
// 樣式已移至全域 globals.scss
import Swal from 'sweetalert2'
// import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { MdOutlineEmail } from 'react-icons/md'
// import Header from '@/components/timelog/Header'
// import MyFooter from '@/components/layout/default-layout/my-footer'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useLoader } from '@/hooks/use-loader'
import Head from 'next/head'
import GlowingText from '@/components/glowing-text/glowing-text'
import { Col } from 'react-bootstrap'

export default function LogIn() {
  const [showpassword, setShowpassword] = useState(false)
  const router = useRouter()
  const { login, auth, isAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ error: ' ' })
  const { showLoader, hideLoader } = useLoader()
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    showLoader() // 開始載入時顯示

    try {
      // 直接調用 useAuth 的 login 函數，它會處理所有的登入邏輯
      await login(formData.get('email'), formData.get('password'))

      // 只有在真正成功時才顯示成功訊息
      if (isAuth) {
        console.log('登入成功，auth 狀態:', auth)
        setJustLoggedIn(true)

        // 顯示詳細的登入成功訊息，等待用戶關閉後再跳轉
        await Swal.fire({
          title: '🎉 登入成功！',
          html: `
            <div style="text-align: left; font-size: 14px;">
              <p><strong>🔐 JWT Token:</strong> 已設置並存儲在 Cookie 中</p>
              <p><strong>🍪 Cookie:</strong> ACCESS_TOKEN 已創建</p>
              <p><strong>📱 Session:</strong> 用戶會話已建立</p>
              <p><strong>🎫 Access Token:</strong> 有效期 3 天</p>
              <hr style="margin: 10px 0;">
              <p><strong>👤 用戶資訊:</strong></p>
              <p>• Email: ${formData.get('email')}</p>
              <p>• 認證狀態: 已登入</p>
              <p>• 即將跳轉到 Dashboard</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: '前往 Dashboard',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: true,
        })

        router.replace('/dashboard')
      }
    } catch (error) {
      console.error('登入失敗:', error)
      setErrors({
        message: error.message || '登入失敗，請檢查帳號密碼',
      })
      Swal.fire({
        title: '❌ 登入失敗',
        text: error.message || '請檢查帳號密碼是否正確',
        icon: 'error',
        confirmButtonText: '確定',
        confirmButtonColor: '#dc3545',
      })
    } finally {
      // finally確保無論成功或失敗，資料庫連線都會被正確關閉，避免記憶體洩漏與連線池耗盡
      hideLoader() // 不管成功失敗都要關閉 loader。不用寫$disconnect()因為由框架共同管理
    }
  }

  useEffect(() => {
    // 如果認證檢查還沒完成，不執行跳轉
    if (!auth.hasChecked) {
      console.log('Login 頁面: 認證檢查中...', auth)
      return
    }

    // 如果用戶已登入，重定向到儀表板
    console.log('Login 頁面 auth 狀態:', auth) // 加入 debug
    if (isAuth && !justLoggedIn) {
      // 使用 replace 而不是 push，避免歷史記錄問題
      router.replace('/dashboard')
      console.log('用戶已登入，跳轉到 dashboard')
      return
    }
  }, [isAuth, auth?.hasChecked, router, auth, justLoggedIn])
  return (
    <>
      <Head>
        <title>登入</title>
      </Head>
      <div className="gradient-bg ">
        {/* 雲海效果 - 根據當前主題顯示 */}
        <div className="cloud-effect"></div>

        <div className="container-fluid position-relative geometricShape">
          <div className="mt-5 row align-items-center justify-content-center">
            {/* 左側歡迎區域 */}
            <Col lg={7} className="mb-5 mb-lg-0">
              <div className="text-center text-lg-start position-relative m-0 d-flex flex-column justify-content-center">
                {/* 背景圖片 - 先不放因為會導致畫面有點雜亂*/}
                {/* <Image
                  src="/7-Reasons-To-Keep-Jade-Plant-At-Your-Entrance.jpg"
                  alt="背景圖片"
                  fill
                  style={{
                    objectFit: 'cover',
                    opacity: 0.3,
                    zIndex: -1,
                    borderRadius: '15px',
                    minHeight: '100vh',
                  }}
                /> */}

                <div className="mb-5 mx-auto">
                  <GlowingText
                    text="登入"
                    className="text-white display-4 fw-bold mb-4"
                  />
                </div>
                {/* <div className="mb-5">
                  <GlowingText
                    text="成為時間分析師"
                    className="text-white display-3 fw-bold"
                  />
                </div> */}

                <p className="text-white-50 fs-6 mb-4 mx-auto">
                  智能分析你的時間使用，提升工作效率
                </p>

                {/* 功能特色 */}
                <div className="mb-4">
                  <div className="d-flex flex-wrap gap-4 mb-3 justify-content-center">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-clock-history text-white fs-4"></i>
                      <span className="text-white-50">智能追蹤</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-graph-up text-white fs-4"></i>
                      <span className="text-white-50">深度分析</span>
                    </div>
                  </div>

                  {/* 統計數據 */}
                  <div className="row g-3">
                    <div className="col-4 text-center">
                      <div className="text-white fs-4 fw-bold">10K+</div>
                      <div className="text-white-50 small">用戶</div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="text-white fs-4 fw-bold">50M+</div>
                      <div className="text-white-50 small">小時</div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="text-white fs-4 fw-bold">99%</div>
                      <div className="text-white-50 small">滿意度</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* 右側登入表單 */}
            <Col lg={5} md={8} sm={12} className="mx-auto">
              <div
                className="bg-transparent backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25"
                style={{ zIndex: 100 }}
              >
                {/* 3 日登入持久化提示 */}
                <div
                  className="theme-callout d-flex align-items-start gap-2 mb-4"
                  role="note"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="theme-callout-icon flex-shrink-0"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 7V13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="16" r="1.25" fill="currentColor" />
                  </svg>
                  <div>
                    <div className="fw-semibold text-white">
                      登入狀態將維持 3 天
                    </div>
                    <small className="theme-callout-body">
                      為了方便使用，除非您主動登出，系統會保持登入狀態 3 天。
                    </small>
                  </div>
                </div>
                {/* 頁籤切換 */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="btn-group" role="group">
                    <Link
                      href="/user/login"
                      className="btn btn-outline-light active px-4 py-2"
                    >
                      登入
                    </Link>
                    <Link
                      href="/user/register"
                      className="btn btn-outline-light px-4 py-2"
                    >
                      註冊
                    </Link>
                  </div>
                </div>
                <form className="position-relative" onSubmit={handleSubmit}>
                  <div className="inputs-group">
                    <div className="inputs position-relative">
                      <div className="position-relative mb-3">
                        <label
                          htmlFor="email"
                          className="form-label text-white fw-semibold d-flex align-items-center gap-2"
                        >
                          <svg
                            className="label-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            width="20"
                            height="20"
                          >
                            <path
                              d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M22 6L12 13L2 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          帳號(信箱)
                        </label>
                        <div className="position-relative">
                          <input
                            type="email"
                            id="login-email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                            }}
                            className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                            name="email"
                            placeholder="請輸入您的信箱"
                            required
                            style={{
                              backdropFilter: 'blur(10px)',
                              color: 'white',
                            }}
                          />
                          <MdOutlineEmail
                            className="position-absolute top-50 end-0 translate-middle-y me-3 email-icon"
                            size={20}
                          />
                        </div>
                      </div>

                      <div className="position-relative mb-4">
                        <label
                          htmlFor="password"
                          className="form-label text-white fw-semibold d-flex align-items-center gap-2"
                        >
                          <svg
                            className="label-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            width="20"
                            height="20"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="16"
                              r="1"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          密碼
                        </label>
                        <div className="position-relative">
                          <input
                            type={showpassword ? 'text' : 'password'}
                            value={password}
                            autoComplete="new-password"
                            onChange={(e) => {
                              setPassword(e.target.value)
                            }}
                            id="login-password"
                            name="password"
                            className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                            placeholder="請輸入您包含英文大小寫、數字、特殊符號的密碼"
                            required
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
                              <AiOutlineEyeInvisible
                                size={20}
                                className="eye-icon"
                              />
                            ) : (
                              <AiOutlineEye size={20} className="eye-icon" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div
                        id="Error_message"
                        className={`form-text text-white p-5`}
                      >
                        {errors.message && (
                          <div className="error">{errors.message}</div>
                        )}
                      </div>

                      <div className="d-flex flex-wrap justify-content-between align-items-center mt-4">
                        <Link
                          className="text-white text-decoration-none d-flex align-items-center gap-2"
                          href="./forget-password"
                          style={{ fontSize: '14px' }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>忘記密碼？</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M7 17L17 7M17 7H7M17 7V17"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>

                        <button
                          className="btn theme-button fw-semibold px-4 py-2"
                          type="submit"
                          style={{
                            borderRadius: '8px',
                            fontSize: '16px',
                          }}
                        >
                          <span>登入</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="ms-2"
                          >
                            <path
                              d="M5 12H19M19 12L12 5M19 12L12 19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </Col>
          </div>
        </div>
      </div>

      <style jsx>{`
        .error {
          color: red;
          font-size: 16px;
          margin-top: 0.25rem;
        }

        /* Placeholder styling fix - CSS selector specificity was not high enough */
        /* The global styles in globals.scss were overriding the placeholder color */
        /* Using ID selectors and type selectors to increase CSS specificity */
        #login-email.form-control::placeholder,
        #login-email.form-control::-webkit-input-placeholder,
        #login-email.form-control::-moz-placeholder,
        #login-email.form-control:-ms-input-placeholder,
        #login-password.form-control::placeholder,
        #login-password.form-control::-webkit-input-placeholder,
        #login-password.form-control::-moz-placeholder,
        #login-password.form-control:-ms-input-placeholder,
        input[type='email'].form-control::placeholder,
        input[type='email'].form-control::-webkit-input-placeholder,
        input[type='email'].form-control::-moz-placeholder,
        input[type='email'].form-control:-ms-input-placeholder,
        input[type='password'].form-control::placeholder,
        input[type='password'].form-control::-webkit-input-placeholder,
        input[type='password'].form-control::-moz-placeholder,
        input[type='password'].form-control:-ms-input-placeholder,
        input.form-control::placeholder,
        input.form-control::-webkit-input-placeholder,
        input.form-control::-moz-placeholder,
        input.form-control:-ms-input-placeholder {
          color: #ffffff !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
}
