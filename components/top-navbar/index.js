'use client'

import React, { useState } from 'react'
import styles from './top-navbar.module.css'
import { FaBars } from 'react-icons/fa'
import Link from 'next/link'

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
          <Link href="#" className={styles.icon} onClick={toggleMenu}>
            <FaBars />
          </Link>
        </div>
      </header>
    </>
  )
}
