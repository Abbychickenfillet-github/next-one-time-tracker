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
import OffcanvasNav from '@/components/timelog/OffcanvasNav'
// import NextBreadCrumb from '@/components/next-breadcrumb' // 已移除麵包屑功能
// import styles from '@/components/timelog/Header.module.css'
import { BsList } from 'react-icons/bs'

export default function UnifiedNavbar() {
  const auth = useAuth()
  const isAuth = auth?.isAuth || false
  const user = auth?.user || null
  const logout = auth?.logout

  // 調試信息
  console.log('🔍 UnifiedNavbar 認證狀態:', {
    isAuth,
    user: user?.name || user?.email || '無用戶資料',
    hasUser: !!user,
    authObject: auth,
  })
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showOffcanvas, setShowOffcanvas] = useState(false)

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
        setIsLoggingOut(false)
      }
    }
  }

  const handleDashboardClick = (e) => {
    if (!isAuth) {
      e.preventDefault()
      Swal.fire({
        title: '🔒 需要登入',
        text: '請先登入才能訪問儀表板',
        icon: 'info',
        confirmButtonText: '前往登入',
        confirmButtonColor: '#0dcaf0',
        showCancelButton: true,
        cancelButtonText: '取消',
        cancelButtonColor: '#6c757d',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/user/login')
        }
      })
    }
  }

  return (
    <>
      {/* 側邊導航 - 所有頁面都可用 */}
      <OffcanvasNav
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
      />

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
                  href="/"
                  className="nav-link-custom"
                  style={{ color: 'var(--text-primary, #f2f2f2)' }}
                >
                  首頁
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href="/about"
                  className="nav-link-custom"
                  style={{ color: 'var(--text-primary, #f2f2f2)' }}
                >
                  為什麼有這個網頁
                </Nav.Link>
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip
                      id="dashboard-tooltip-unified"
                      style={{
                        backgroundColor: 'var(--tooltip-bg, #2d3748)',
                        color: 'var(--tooltip-text, #ffffff)',
                        border: '1px solid var(--tooltip-border, #4a5568)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        padding: '0.5rem 0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {!isAuth
                        ? '🔒 請先登入才能訪問儀表板'
                        : '📊 查看您的時間記錄和分析'}
                    </Tooltip>
                  }
                >
                  <Nav.Link
                    as={Link}
                    href="/dashboard"
                    className="nav-link-custom"
                    style={{
                      color: 'var(--text-primary, #f2f2f2)',
                      cursor: !isAuth ? 'help' : 'pointer',
                      opacity: !isAuth ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                    }}
                    onClick={handleDashboardClick}
                    onMouseEnter={(e) => {
                      if (!isAuth) {
                        e.target.style.color = 'var(--warning-color, #ffc107)'
                        e.target.style.transform = 'scale(1.05)'
                      } else {
                        e.target.style.color = 'var(--accent-color, #0dcaf0)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--text-primary, #f2f2f2)'
                      e.target.style.transform = 'scale(1)'
                    }}
                  >
                    <span className="d-flex align-items-center gap-1">
                      📊 儀表板
                      {!isAuth && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--warning-color, #ffc107)',
                          }}
                        >
                          🔒
                        </span>
                      )}
                    </span>
                  </Nav.Link>
                </OverlayTrigger>
                {!isAuth && (
                  <>
                    <Nav.Link
                      as={Link}
                      href="/user/register"
                      className="nav-link-custom"
                      style={{ color: 'var(--text-primary, #f2f2f2)' }}
                    >
                      註冊
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      href="/user/login"
                      className="nav-link-custom"
                      style={{ color: 'var(--text-primary, #f2f2f2)' }}
                    >
                      登入
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </div>

          {/* Breadcrumb 功能已移除 */}

          {/* 右側：功能按鈕 */}
          <div className="d-flex align-items-center gap-2 position-relative">
            {/* 側邊欄按鈕 - 所有頁面都顯示，支援 RWD */}
            <button
              className="btn btn-light btn-sm d-inline-flex align-items-center justify-content-center gap-2 px-2"
              onClick={() => setShowOffcanvas(true)}
              aria-label="開啟側邊欄"
              style={{
                minWidth: 'fit-content',
                transition: 'all 0.3s ease',
                lineHeight: 1.2,
                paddingInline: '8px',
              }}
            >
              <BsList />
              {/* RWD 文字顯示：小螢幕顯示"側邊"，中螢幕顯示"開啟側邊" */}
              <span className="d-none d-sm-inline d-inline-flex align-items-center justify-content-center">
                側邊
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
                    color: 'var(--text-primary, #f2f2f2)',
                    fontSize: '0.9rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  <FaUser className="me-1" />
                  <span className="d-none d-md-inline">
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
                    className="text-light border-bottom border-secondary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <FaUser className="text-primary" />
                      <div>
                        <div className="fw-bold">
                          {user?.name || '未設定姓名'}
                        </div>
                        <div className="text-muted small">
                          {user?.email || '未設定信箱'}
                        </div>
                      </div>
                    </div>
                  </Dropdown.Header>

                  {/* LinePay連結 */}
                  <Dropdown.Item
                    as={Link}
                    href="/line-pay"
                    className="d-flex align-items-center gap-2 text-light py-2"
                    style={{
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor =
                        'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                    }}
                  >
                    <FaCog className="text-info" />
                    LinePay
                  </Dropdown.Item>

                  {/* 分隔線 */}
                  <Dropdown.Divider className="border-secondary my-2" />

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
                          'rgba(220, 53, 69, 0.1)'
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
