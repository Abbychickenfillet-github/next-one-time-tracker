'use client'

import React, { useState } from 'react'
import {
  Navbar,
  Nav,
  Container,
  Dropdown,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap'
import { FaBars, FaUser } from 'react-icons/fa6'
import { FaSignOutAlt, FaCog } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/theme-toggle'
import { useAuth } from '@/hooks/use-auth'
import Swal from 'sweetalert2'
import AIAgentSidebar from '@/components/AIAgentSidebar'
// import NextBreadCrumb from '@/components/next-breadcrumb' // 已移除麵包屑功能
// import styles from '@/components/timelog/Header.module.css'
import { BsList } from 'react-icons/bs'
import styles from '@/styles/nav-link-arrow.module.scss'

export default function UnifiedNavbar() {
  const auth = useAuth()
  const isAuth = auth?.isAuth || false
  const user = auth?.user || null
  const logout = auth?.logout

  // 調試信息 - 已移除，避免打包時產生大量日誌
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showAIAgent, setShowAIAgent] = useState(false)

  // 判斷是否為 TimeLog 相關頁面（排除主頁）
  const isTimeLogPage = pathname?.includes('/timelog') && pathname !== '/'

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '確認登出',
      text: '您確定要登出嗎？',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '登出',
      cancelButtonText: '取消',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      setIsLoggingOut(true)
      try {
        await logout()
        await Swal.fire({
          title: '登出成功',
          text: '您已成功登出',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
        router.push('/')
      } catch (error) {
        console.error('登出失敗:', error)
        await Swal.fire({
          title: '登出失敗',
          text: '登出過程中發生錯誤',
          icon: 'error',
        })
      } finally {
        // finally確保無論成功或失敗，資料庫連線都會被正確關閉，避免記憶體洩漏與連線池耗盡
        setIsLoggingOut(false)
      }
    }
  }

  return (
    <>
      {/* AI Chatbox 側邊欄 - 所有頁面都可用 */}
      <AIAgentSidebar show={showAIAgent} onHide={() => setShowAIAgent(false)} />

      {/* 統一的導航欄 */}
      <Navbar
        expand="lg"
        className={`topnav-bootstrap ${pathname === '/' || isTimeLogPage ? 'timelog-navbar' : ''}`}
        style={{
          backgroundColor: 'var(--navbar-bg, #333)',
          position: 'relative',
        }}
      >
        <Container fluid>
          {/* 左側：Logo + 標題/導航連結 */}
          <div className="d-flex align-items-center">
            {/* Logo - 所有頁面都顯示 */}
            <Link href="/" className="logo-link d-flex align-items-center me-3">
              <Image
                src="/timelog_and_analysis-logo-removebg-preview.png"
                alt="TimeLog & Analysis Logo"
                className="logo"
                width={50}
                height={50}
                style={{
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
            </Link>

            {/* 統一顯示：標題 + 導航連結（所有頁面） */}
            <div className="d-flex flex-column">
              <span className="fw-bold fs-4 mb-0 text-white">TimeLog</span>
              <span className="fw-normal fs-6 opacity-75 text-white">
                Analysis
              </span>
            </div>

            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              className="border-0 me-3"
              style={{ color: 'var(--accent-color, #0dcaf0)' }}
            >
              <FaBars />
            </Navbar.Toggle>

            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto d-flex align-items-center">
                <Nav.Link
                  as={Link}
                  href="/intro"
                  className={`nav-link nav-link-custom ${styles['nav-link-arrow']}`}
                >
                  使用介紹
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href="/trial"
                  className={`nav-link nav-link-custom ${styles['nav-link-arrow']}`}
                >
                  免註冊試用
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href="/about"
                  className={`nav-link nav-link-custom ${styles['nav-link-arrow']}`}
                >
                  開發原因
                </Nav.Link>

                {/* 未登入用戶顯示註冊和登入連結 */}
                {!isAuth && (
                  <>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip
                          id="register-tooltip"
                          style={{
                            backgroundColor: 'var(--tooltip-bg, #2d3748)',
                            color: 'var(--tooltip-text, #ffffff)',
                            border: '1px solid var(--tooltip-border, #4a5568)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            padding: '0.75rem 1rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            maxWidth: '280px',
                            textAlign: 'justify',
                            lineHeight: '1.4',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                              }}
                            >
                              🌐 註冊後享受跨裝置同步
                            </div>
                            <div>
                              • <strong>雲端儲存</strong>
                              ：時間記錄自動同步到雲端
                            </div>
                            <div>
                              • <strong>多裝置存取</strong>
                              ：手機、電腦、平板無縫切換
                            </div>
                            <div>
                              • <strong>數據安全</strong>：重要記錄永不遺失
                            </div>
                          </div>
                        </Tooltip>
                      }
                    >
                      <Nav.Link
                        as={Link}
                        href="/user/register"
                        className={`nav-link nav-link-custom ${styles['nav-link-arrow']}`}
                        style={{ cursor: 'help' }}
                      >
                        註冊
                      </Nav.Link>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip
                          id="login-tooltip"
                          style={{
                            backgroundColor: 'var(--tooltip-bg, #2d3748)',
                            color: 'var(--tooltip-text, #ffffff)',
                            border: '1px solid var(--tooltip-border, #4a5568)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            padding: '0.75rem 1rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            maxWidth: '280px',
                            textAlign: 'justify',
                            lineHeight: '1.4',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                              }}
                            >
                              🔑 登入後即可享受完整功能
                            </div>
                            <div>
                              • <strong>訂閱服務</strong>：解鎖進階功能與專業
                              工具
                            </div>
                            <div>
                              • <strong>儀表板</strong>：管理您的時間記錄與數據
                              分析
                            </div>
                            <div>
                              • <strong>個人化設定</strong>：自訂您的使用體驗
                            </div>
                          </div>
                        </Tooltip>
                      }
                    >
                      <Nav.Link
                        as={Link}
                        href="/user/login"
                        className={`nav-link nav-link-custom ${styles['nav-link-arrow']}`}
                        style={{ cursor: 'help' }}
                      >
                        登入
                      </Nav.Link>
                    </OverlayTrigger>
                  </>
                )}

                {/* 已登入用戶顯示訂閱和儀表板連結 */}
                {isAuth && (
                  <>
                    <Nav.Link
                      as={Link}
                      href="/subscription"
                      className={`nav-link nav-link-custom ${styles['nav-link-arrow']}`}
                    >
                      訂閱
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      href="/dashboard"
                      className={`nav-link nav-link-custom ${styles['nav-link-arrow']}`}
                    >
                      📊 儀表板
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </div>

          {/* Breadcrumb 功能已移除 */}

          {/* 右側：功能按鈕 */}
          <div className="d-flex align-items-center gap-2 position-relative">
            {/* AI Chatbox 按鈕 - 所有頁面都顯示，支援 RWD */}
            <button
              className="btn btn-light btn-sm d-inline-flex align-items-center justify-content-center gap-2 px-2"
              onClick={() => setShowAIAgent(true)}
              aria-label="開啟 AI Chatbox"
              style={{
                minWidth: 'fit-content',
                transition: 'all 0.3s ease',
                lineHeight: 1.2,
                paddingInline: '8px',
              }}
            >
              <BsList />
              {/* RWD 文字顯示：小螢幕顯示"AI"，中螢幕顯示"AI Chatbox" */}
              <span className="d-none d-sm-inline d-inline-flex align-items-center justify-content-center">
                AI Chatbox
              </span>
            </button>

            {/* 主題切換 */}
            <ThemeToggle />

            {/* 用戶下拉選單 (僅在已登入時顯示) */}
            {isAuth && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-light"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent"
                  style={{
                    color: '#ffffff !important', // 強制使用白色，覆蓋主題變數
                    fontSize: '0.9rem',
                    padding: '0.5rem 0.75rem',
                    transition: 'all 0.6s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.color = '#ffffff' // 懸停時保持白色
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.color = '#ffffff' // 離開時保持白色
                  }}
                >
                  <FaUser className="me-1" style={{ color: '#ffffff' }} />
                  <span
                    className="d-none d-md-inline"
                    style={{ color: '#ffffff' }}
                  >
                    {user?.name || user?.email || '用戶'}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className="border-0 shadow-lg"
                  style={{
                    backgroundColor: 'var(--dropdown-bg,rgb(140, 178, 243))',
                    minWidth: '200px',
                    borderRadius: '12px',
                    padding: '0.5rem',
                  }}
                >
                  {/* 用戶資訊 */}
                  <Dropdown.Header
                    className="border-bottom border-secondary"
                    style={{
                      fontSize: '0.8rem',
                      color: '#1a1a1a', // 深色文字，提高對比度
                      backgroundColor: 'transparent',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <FaUser style={{ color: '#0d6efd' }} />{' '}
                      {/* Bootstrap primary 藍色 */}
                      <div>
                        <div className="fw-bold" style={{ color: '#1a1a1a' }}>
                          {user?.name || '未設定姓名'}
                        </div>
                        <div className="small" style={{ color: '#495057' }}>
                          {user?.email || '未設定信箱'}
                        </div>
                      </div>
                    </div>
                  </Dropdown.Header>

                  {/* 訂閱服務連結 */}
                  <Dropdown.Item
                    as={Link}
                    href="/subscription"
                    className="d-flex align-items-center gap-2 py-2"
                    style={{
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      color: '#1a1a1a', // 深色文字，提高對比度
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)' // 深色懸停效果
                      e.target.style.color = '#000000' // 懸停時更深的文字
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = '#1a1a1a' // 恢復原始文字顏色
                    }}
                  >
                    <FaCog style={{ color: '#0dcaf0' }} />{' '}
                    {/* Bootstrap info 青色 */}
                    訂閱服務
                  </Dropdown.Item>

                  {/* 分隔線 */}
                  <Dropdown.Divider
                    className="my-2"
                    style={{
                      borderColor: 'rgba(0, 0, 0, 0.2)', // 更明顯的分隔線
                      opacity: 1,
                    }}
                  />

                  {/* 登出按鈕 */}
                  <Dropdown.Item
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="d-flex align-items-center gap-2 text-danger py-2"
                    style={{
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                      opacity: isLoggingOut ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoggingOut) {
                        e.target.style.backgroundColor =
                          'rgba(226, 13, 34, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                    }}
                  >
                    <FaSignOutAlt className={isLoggingOut ? 'fa-spin' : ''} />
                    {isLoggingOut ? '登出中...' : '登出'}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Container>
      </Navbar>
    </>
  )
}
