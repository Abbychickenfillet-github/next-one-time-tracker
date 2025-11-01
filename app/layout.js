'use client'
import { Suspense } from 'react'
// - Suspense 邊界處理非同步載入
import Script from 'next/script'
import { Providers } from './providers'
import UnifiedNavbar from '@/components/UnifiedNavbar'
import '@/styles/globals.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bs-icon/icons.css'
import 'animate.css'
import { Noto_Sans_TC } from 'next/font/google'
import Footer from '@/components/footer'

// 思源黑體 - 支援繁體中文
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
})
// RootLayout 元件 - 定義整個應用程式的根布局結構
export default function RootLayout({ children }) {
  return (
    <html lang="zh-tw">
      <head />
      <body className={`${notoSansTC.variable} ${notoSansTC.className}`}>
        {/* Bootstrap JavaScript - 使用 Next.js Script 組件 */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />

        {/* 全域 Context Providers 包裝器 */}
        <Suspense>
          <Providers>
            {/* 統一的導航欄 (整合 TopNavbar 和 Header) */}
            <UnifiedNavbar />
            {/* 主內容區域 - 使用 flex: 1 佔滿剩餘空間 */}
            <main style={{ flex: 1 }}>
              {/* 頁面內容 - 這裡會渲染各個頁面的 children */}
              {children}
            </main>
          </Providers>
        </Suspense>

        {/* Footer 元件 */}
        <Footer />
      </body>
    </html>
  )
}
