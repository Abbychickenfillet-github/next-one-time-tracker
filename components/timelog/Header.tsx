import OffcanvasNav from '@/components/timelog/OffcanvasNav'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import styles from './Header.module.css'
import NextBreadCrumb from '@/components/next-breadcrumb'

export default function Header() {
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  // const { auth, logout } = useAuth()
  // const { isAuth, userData } = auth
  // const [user_id, setUserId] = useState('')
  // const router = useRouter()
  // const getDefaultImage = (gender) => {
  //   switch (gender) {
  //     case 'male':
  //       return '/signup_login/undraw_profile_2.svg'
  //     case 'female':
  //       return '/signup_login/undraw_profile_1.svg'
  //     default:
  //       return '/Vector.svg'
  //   }
  // }
  return (
    <>
      {/* TimeLog 專用的側邊導航 */}
      <OffcanvasNav show={showOffcanvas} onHide={() => setShowOffcanvas(false)} />
      
      {/* Header 內容 - 使用 flexbox 讓標題和按鈕在同一列 */}
      <header className={`py-3 px-4 fs-3 fw-bold d-flex justify-content-between align-items-center ${styles.headerTheme}`}>
        {/* 左側：Logo + 標題 + Breadcrumb */}
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <Link href="/" className="logo-link d-flex align-items-center">
            <Image
              src="/timelog_and_analysis-logo-removebg-preview.png"
              alt="TimeLog & Analysis Logo"
              className="logo"
              width={50}
              height={50}
              style={{
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Link>
          <div className="d-flex flex-column">
            <span className="fw-bold fs-4 mb-0">TimeLog</span>
            <span className="fw-normal fs-6 opacity-75">Analysis</span>
          </div>
          
          {/* 整合的 Breadcrumb */}
          <div className="ms-4 flex-grow-1">
            <NextBreadCrumb />
          </div>
        </div>
        
        {/* 右側：側邊欄按鈕 */}
        <button 
          className={`btn btn-outline-light btn-sm d-flex align-items-center gap-2 ${styles.headerButton}`}
          onClick={() => setShowOffcanvas(true)}
          aria-label="開啟側邊欄"
        >
          <i className="bi bi-list"></i>
          <span className="d-none d-md-inline">開啟側邊</span>
        </button>
      </header>
    </>
  )
}