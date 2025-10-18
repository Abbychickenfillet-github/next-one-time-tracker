'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dropdown } from 'react-bootstrap'

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState('sand-barbie')

  // 使用 useCallback 優化主題切換函數，避免不必要的重新渲染
  const toggleTheme = useCallback((theme) => {
    setCurrentTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (theme) {
      console.log(`🚀 設定在 HTML 根元素，屬性data-theme，屬性值${theme}`)
    }
    localStorage.setItem('theme', theme)
  }, [])

  useEffect(() => {
    // 從 localStorage 讀取主題設定，避免水合錯誤
    const savedTheme = localStorage.getItem('theme') || 'sand-barbie'
    setCurrentTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

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
      id: 'warm',
      name: 'warm',
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
    <Dropdown className="theme-toggle-container" align="end">
      {/* 添加 align="end" 屬性：
這會讓下拉選單從右側對齊，避免超出右邊界
Bootstrap 會自動調整下拉選單的位置 */}
      <Dropdown.Toggle
        variant="outline-light"
        size="sm"
        className="d-flex align-items-center gap-2"
        title="選取主題"
        aria-label="選取主題"
        style={{
          minWidth: 'fit-content',
          transition: 'all 0.3s ease',
        }}
      >
        <span>{currentThemeData.icon}</span>
        <span className="d-none d-md-inline">{currentThemeData.name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="border-0 shadow-lg"
        style={{
          backgroundColor: 'var(--dropdown-bg, #2d3748)',
          borderRadius: '8px',
          padding: '0.5rem',
          minWidth: '180px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        <style jsx>{`
          .dropdown-item:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
          .dropdown-item:focus {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
          .dropdown-item.active {
            background-color: rgba(0, 123, 255, 0.2) !important;
            color: white !important;
          }
        `}</style>
        {/* 說明文字 - disabled item */}
        <Dropdown.Header
          className="text-center border-bottom border-secondary pb-2 mb-2"
          style={{
            fontSize: '0.7rem',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          🎨 選擇您喜歡的主題風格
        </Dropdown.Header>

        {themes.map((theme) => (
          <Dropdown.Item
            key={theme.id}
            onClick={() => toggleTheme(theme.id)}
            className={`d-flex text-white align-items-center gap-2 py-2 ${
              currentTheme === theme.id ? 'active' : ''
            }`}
            style={{
              fontSize: '0.8rem',
              borderRadius: '6px',
              marginBottom: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            <span>{theme.icon}</span>
            <span>{theme.name}</span>
            {currentTheme === theme.id && (
              <span
                className={`ms-auto ${currentTheme === theme.id ? 'text-success' : 'text-white'}`}
              >
                ✓
              </span>
            )}
          </Dropdown.Item>
        ))}

        {/* 底部說明 */}
        <Dropdown.Divider className="border-secondary my-2" />
        <Dropdown.Header
          className="text-center text-white"
          style={{
            fontSize: '0.65rem',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          💡 主題會自動保存
        </Dropdown.Header>
      </Dropdown.Menu>
    </Dropdown>
  )
}
