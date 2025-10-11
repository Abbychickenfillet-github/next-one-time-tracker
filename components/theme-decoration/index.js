'use client'
import { useEffect, useState } from 'react'

export default function ThemeDecoration() {
  const [currentTheme, setCurrentTheme] = useState('sand-barbie')

  useEffect(() => {
    // 獲取當前主題
    const getCurrentTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      return theme || 'sand-barbie'
    }

    setCurrentTheme(getCurrentTheme())

    // 監聽主題變化
    const observer = new MutationObserver(() => {
      setCurrentTheme(getCurrentTheme())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  const renderDecoration = () => {
    switch (currentTheme) {
      case 'warm-tea':
        return (
          <>
            {/* 大螢幕版本 */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="d-none d-lg-block"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            >
              <ellipse cx="50" cy="75" rx="25" ry="8" fill="#8B4513" />
              <rect
                x="30"
                y="45"
                width="40"
                height="30"
                rx="5"
                fill="#A0522D"
              />
              <path
                d="M70 55 Q85 50 85 65 Q85 80 70 75"
                stroke="#8B4513"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M72 57 Q82 52 82 63 Q82 74 72 73"
                stroke="#A0522D"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="40" cy="60" r="2" fill="#654321" opacity="0.7" />
              <circle cx="55" cy="65" r="1.5" fill="#654321" opacity="0.6" />
              <circle cx="45" cy="70" r="1" fill="#654321" opacity="0.8" />
              <path
                d="M35 40 Q38 35 41 40"
                stroke="#D2691E"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M45 38 Q48 33 51 38"
                stroke="#D2691E"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M55 42 Q58 37 61 42"
                stroke="#D2691E"
                strokeWidth="1.5"
                fill="none"
                opacity="0.7"
              />
            </svg>
            {/* 小螢幕版本 */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              className="d-lg-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <ellipse cx="50" cy="75" rx="20" ry="6" fill="#8B4513" />
              <rect
                x="35"
                y="50"
                width="30"
                height="25"
                rx="4"
                fill="#A0522D"
              />
              <path
                d="M65 58 Q75 54 75 65 Q75 76 65 72"
                stroke="#8B4513"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M66 59 Q74 55 74 63 Q74 71 66 70"
                stroke="#A0522D"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="42" cy="62" r="1.5" fill="#654321" opacity="0.7" />
              <circle cx="52" cy="66" r="1" fill="#654321" opacity="0.6" />
              <circle cx="47" cy="70" r="0.8" fill="#654321" opacity="0.8" />
              <path
                d="M38 45 Q40 41 42 45"
                stroke="#D2691E"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M46 44 Q48 40 50 44"
                stroke="#D2691E"
                strokeWidth="1"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M54 46 Q56 42 58 46"
                stroke="#D2691E"
                strokeWidth="1"
                fill="none"
                opacity="0.7"
              />
            </svg>
          </>
        )

      case 'sand-barbie':
        return (
          <>
            {/* 大螢幕版本 - Barbie 皇冠 */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="d-none d-lg-block"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            >
              {/* 皇冠主體 */}
              <path
                d="M20 60 L30 40 L40 50 L50 30 L60 50 L70 40 L80 60 Z"
                fill="#FF69B4"
                stroke="#FF1493"
                strokeWidth="2"
              />
              {/* 皇冠裝飾 */}
              <circle cx="30" cy="45" r="3" fill="#FFB6C1" />
              <circle cx="50" cy="35" r="4" fill="#FFB6C1" />
              <circle cx="70" cy="45" r="3" fill="#FFB6C1" />
              {/* 皇冠底部 */}
              <rect x="25" y="60" width="50" height="8" fill="#FF69B4" />
              <rect x="30" y="68" width="40" height="4" fill="#FF1493" />
            </svg>
            {/* 小螢幕版本 */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              className="d-lg-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M25 65 L32 50 L40 55 L50 40 L60 55 L68 50 L75 65 Z"
                fill="#FF69B4"
                stroke="#FF1493"
                strokeWidth="1.5"
              />
              <circle cx="32" cy="52" r="2" fill="#FFB6C1" />
              <circle cx="50" cy="42" r="2.5" fill="#FFB6C1" />
              <circle cx="68" cy="52" r="2" fill="#FFB6C1" />
              <rect x="30" y="65" width="40" height="6" fill="#FF69B4" />
              <rect x="33" y="71" width="34" height="3" fill="#FF1493" />
            </svg>
          </>
        )

      case 'mint':
        return (
          <>
            {/* 大螢幕版本 - 可愛葉子 */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="d-none d-lg-block"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            >
              {/* 主葉子 */}
              <ellipse cx="50" cy="60" rx="20" ry="35" fill="#90EE90" />
              <ellipse cx="50" cy="60" rx="15" ry="30" fill="#98FB98" />
              {/* 葉脈 */}
              <path
                d="M50 25 L50 95"
                stroke="#228B22"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M35 45 Q50 50 65 45"
                stroke="#228B22"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M35 75 Q50 70 65 75"
                stroke="#228B22"
                strokeWidth="1.5"
                fill="none"
              />
              {/* 小葉子裝飾 */}
              <ellipse
                cx="30"
                cy="40"
                rx="8"
                ry="15"
                fill="#90EE90"
                opacity="0.7"
              />
              <ellipse
                cx="70"
                cy="40"
                rx="8"
                ry="15"
                fill="#90EE90"
                opacity="0.7"
              />
            </svg>
            {/* 小螢幕版本 */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              className="d-lg-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <ellipse cx="50" cy="65" rx="15" ry="25" fill="#90EE90" />
              <ellipse cx="50" cy="65" rx="12" ry="22" fill="#98FB98" />
              <path
                d="M50 30 L50 90"
                stroke="#228B22"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M38 50 Q50 55 62 50"
                stroke="#228B22"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M38 80 Q50 75 62 80"
                stroke="#228B22"
                strokeWidth="1"
                fill="none"
              />
              <ellipse
                cx="35"
                cy="45"
                rx="6"
                ry="12"
                fill="#90EE90"
                opacity="0.7"
              />
              <ellipse
                cx="65"
                cy="45"
                rx="6"
                ry="12"
                fill="#90EE90"
                opacity="0.7"
              />
            </svg>
          </>
        )

      case 'lavender':
        return (
          <>
            {/* 大螢幕版本 - 薰衣草 */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="d-none d-lg-block"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            >
              {/* 薰衣草主莖 */}
              <rect x="48" y="30" width="4" height="50" fill="#8A2BE2" />
              {/* 薰衣草花朵 */}
              <circle cx="45" cy="40" r="3" fill="#9370DB" />
              <circle cx="55" cy="40" r="3" fill="#9370DB" />
              <circle cx="42" cy="50" r="2.5" fill="#9370DB" />
              <circle cx="58" cy="50" r="2.5" fill="#9370DB" />
              <circle cx="50" cy="35" r="3.5" fill="#9370DB" />
              <circle cx="40" cy="60" r="2" fill="#9370DB" />
              <circle cx="60" cy="60" r="2" fill="#9370DB" />
              <circle cx="50" cy="45" r="4" fill="#9370DB" />
              <circle cx="50" cy="55" r="3" fill="#9370DB" />
              {/* 葉子 */}
              <ellipse cx="35" cy="70" rx="8" ry="3" fill="#90EE90" />
              <ellipse cx="65" cy="70" rx="8" ry="3" fill="#90EE90" />
            </svg>
            {/* 小螢幕版本 */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              className="d-lg-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <rect x="49" y="35" width="2" height="40" fill="#8A2BE2" />
              <circle cx="46" cy="45" r="2" fill="#9370DB" />
              <circle cx="54" cy="45" r="2" fill="#9370DB" />
              <circle cx="43" cy="55" r="1.5" fill="#9370DB" />
              <circle cx="57" cy="55" r="1.5" fill="#9370DB" />
              <circle cx="50" cy="40" r="2.5" fill="#9370DB" />
              <circle cx="41" cy="65" r="1.5" fill="#9370DB" />
              <circle cx="59" cy="65" r="1.5" fill="#9370DB" />
              <circle cx="50" cy="50" r="3" fill="#9370DB" />
              <circle cx="50" cy="60" r="2" fill="#9370DB" />
              <ellipse cx="38" cy="75" rx="6" ry="2" fill="#90EE90" />
              <ellipse cx="62" cy="75" rx="6" ry="2" fill="#90EE90" />
            </svg>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="position-absolute bottom-0 start-0 p-3"
      style={{ zIndex: 1 }}
    >
      {renderDecoration()}
    </div>
  )
}
