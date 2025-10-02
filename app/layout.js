'use client'
import { Suspense } from 'react'
import { Providers } from './providers'
import UnifiedNavbar from '@/components/UnifiedNavbar'
import '@/styles/globals.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css'

import Footer from '@/components/footer'

// RootLayout 元件 - 定義整個應用程式的根布局結構
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Suspense>
          {/* 全域 Context Providers 包裝器 */}
          <Providers>
            {/* 統一的導航欄 (整合 TopNavbar 和 Header) */}
            <UnifiedNavbar />
            <Suspense>
              {/* 頁面內容 - 這裡會渲染各個頁面的 children */}
              {children}
            </Suspense>
            {/* Footer 元件 */}
            <Footer />
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
