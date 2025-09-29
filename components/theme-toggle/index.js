'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './theme-toggle.module.css'

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState('green')

  // 使用 useCallback 優化主題切換函數，避免不必要的重新渲染
  const toggleTheme = useCallback((theme) => {
    setCurrentTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
    // 設定在 HTML 根元素
    if (theme) {
      console.log(`🚀 設定在 HTML 根元素，屬性data-theme，屬性值${theme}`)
    }
    localStorage.setItem('theme', theme)
  }, [])

  useEffect(() => {
    // 從 localStorage 讀取主題設定，避免水合錯誤
    const savedTheme = localStorage.getItem('theme') || 'green'
    setCurrentTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    // 幫HTML標籤元素設定屬性data-theme，屬性值savedTheme是變數嗎？
  }, [])

  return (
    <div className={styles.themeToggle}>
      // 綠色主題按鈕
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
      // 粉紅色主題按鈕
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
