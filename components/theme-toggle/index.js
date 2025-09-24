'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './theme-toggle.module.css'

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState('green')

  // 使用 useCallback 優化主題切換函數，避免不必要的重新渲染
  const toggleTheme = useCallback((theme) => {
    setCurrentTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [])

  useEffect(() => {
    // 從 localStorage 讀取主題設定，避免水合錯誤
    const savedTheme = localStorage.getItem('theme') || 'green'
    setCurrentTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  return (
    <div className={styles.themeToggle}>
      <button
        className={`${styles.themeButton} ${styles.green} ${
          currentTheme === 'green' ? styles.active : ''
        }`}
        onClick={() => toggleTheme('green')}
        title="黑底白字 + Bootstrap bg-info"
      >
        <span className={styles.themeIcon}>🌿</span>
        <span className={styles.themeName}>Green theme</span>
      </button>
      <button
        className={`${styles.themeButton} ${styles.pink} ${
          currentTheme === 'pink' ? styles.active : ''
        }`}
        onClick={() => toggleTheme('pink')}
        title="粉字黑底 + 雲海效果"
      >
        <span className={styles.themeIcon}>🌸</span>
        <span className={styles.themeName}>Pink theme</span>
      </button>
    </div>
  )
}
