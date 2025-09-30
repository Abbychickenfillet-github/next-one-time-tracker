'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from 'react-bootstrap'

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
    <div className="themeToggle">
      {/* 綠色主題按鈕 */}
      <Button
        variant="outline-primary"
        className={`themeButton green ${
          currentTheme === 'green' ? 'active' : ''
        }`}
        onClick={() => toggleTheme('green')}
        title="黑底白字 + Bootstrap bg-info"
      >
        <span className="themeIcon">🌿</span>
        <span className="themeName">Green theme</span>
      </Button>
      {/* 粉紅色主題按鈕 */}
      <Button
        variant="outline-primary"
        className={`themeButton pink ${
          currentTheme === 'pink' ? 'active' : ''
        }`}
        onClick={() => toggleTheme('pink')}
        title="粉字黑底 + 雲海效果"
      >
        <span className="themeIcon">🌸</span>
        <span className="themeName">Pink theme</span>
      </Button>
    </div>
  )
}
