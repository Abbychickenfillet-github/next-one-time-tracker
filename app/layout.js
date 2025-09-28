'use client'
import { Suspense } from 'react'
import { Providers } from './providers'
import TopNavbar from '@/components/top-navbar'
import '@/app/globals.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css'

import Header from '@/components/timelog/Header'

// RootLayout 元件 - 定義整個應用程式的根布局結構
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        {/* 頂部導航欄 */}
        <TopNavbar />
        {/* TimeLog 專用的 Header 元件 (已整合 Breadcrumb) */}
        <Header />
        <Suspense>
          {/* 全域 Context Providers 包裝器 */}
          <Providers>
            <Suspense>
              {/* 頁面內容 - 這裡會渲染各個頁面的 children */}
              {children}
            </Suspense>
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
