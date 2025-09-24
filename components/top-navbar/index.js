'use client'

import React, { useState } from 'react'
import styles from './top-navbar.module.css'
import { FaBars } from 'react-icons/fa6'
import Link from 'next/link'
import ThemeToggle from '@/components/theme-toggle'

export default function TopNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <>
      <header>
        <div
          className={`${styles.topnav} ${menuOpen ? styles.responsive : ''}`}
        >
          <Link href="/" className="active">
            首頁
          </Link>
          <Link
            href="https://github.com/mfee-react/project-guide"
            target="_blank"
          >
            教學文件
          </Link>
          <Link
            href="/user/register"
            target="_self"
          >
            註冊
          </Link>
          <Link
            href="/user/login"
            target="_self"
          >
            登入
          </Link>
          <Link href="#" className={styles.icon} onClick={toggleMenu}>
            <FaBars color="#0dcaf0" />
          </Link>
        </div>
        
        {/* 主題切換按鈕 */}
        <div className={styles.themeToggleContainer}>
          <ThemeToggle />
        </div>
      </header>
    </>
  )
}
