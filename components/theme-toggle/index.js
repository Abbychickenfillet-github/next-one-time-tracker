'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from 'react-bootstrap'

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState('sand-barbie')
  const [isOpen, setIsOpen] = useState(false)

  // 使用 useCallback 優化主題切換函數，避免不必要的重新渲染
  const toggleTheme = useCallback((theme) => {
    setCurrentTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (theme) {
      console.log(`🚀 設定在 HTML 根元素，屬性data-theme，屬性值${theme}`)
    }
    localStorage.setItem('theme', theme)
    setIsOpen(false) // 切換主題後關閉選單
  }, [])

  useEffect(() => {
    // 從 localStorage 讀取主題設定，避免水合錯誤
    const savedTheme = localStorage.getItem('theme') || 'sand-barbie'
    setCurrentTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.querySelector('.theme-toggle-container')
      if (container && !container.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 主題配置
  const themes = [
    {
      id: 'sand-barbie',
      name: 'Sand Barbie',
      icon: '🌸',
      title: 'Sand Barbie 風格 - 70% Pink + 30% Black',
    },
    { id: 'mint', name: 'Mint', icon: '🌿', title: '柔和薄荷綠 - 清新自然' },
    {
      id: 'warm-tea',
      name: 'Warm Tea',
      icon: '☕',
      title: '溫暖奶茶色 - 溫馨舒適',
    },
    {
      id: 'lavender',
      name: 'Lavender',
      icon: '💜',
      title: '柔和薰衣草 - 優雅浪漫',
    },
  ]

  const currentThemeData =
    themes.find((theme) => theme.id === currentTheme) || themes[0]

  return (
    <div className="theme-toggle-container position-relative">
      {/* 主要按鈕 - 顯示當前主題 */}
      <Button
        variant="outline-light"
        size="sm"
        className="d-flex align-items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minWidth: 'fit-content',
          transition: 'all 0.3s ease',
        }}
      >
        <span>{currentThemeData.icon}</span>
        <span className="d-none d-md-inline">{currentThemeData.name}</span>
        <span
          className={`ms-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </Button>

      {/* 點擊時顯示的主題選項 */}
      {isOpen && (
        <div
          className="theme-options"
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            zIndex: 1000,
            backgroundColor: 'var(--dropdown-bg, #2d3748)',
            borderRadius: '8px',
            padding: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            minWidth: '150px',
            marginTop: '0.25rem',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`btn btn-sm w-100 mb-1 d-flex align-items-center gap-2 ${
                currentTheme === theme.id ? 'btn-primary' : 'btn-outline-light'
              }`}
              onClick={() => toggleTheme(theme.id)}
              title={theme.title}
              style={{
                fontSize: '0.8rem',
                justifyContent: 'flex-start',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{theme.icon}</span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .transition-transform {
          transition: transform 0.2s ease;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  )
}
