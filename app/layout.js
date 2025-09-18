'use client'
import { Suspense, useState } from 'react'
import { Providers } from './providers'
import TopNavbar from '@/components/top-navbar'
import NextBreadCrumb from '@/components/next-breadcrumb'
import '@/app/globals.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import OffcanvasNav from '@/components/timelog/OffcanvasNav'
import Header from '@/components/timelog/Header'
import { Button } from 'react-bootstrap'


// RootLayout 元件 - 定義整個應用程式的根布局結構
export default function RootLayout({ children }) {
  const [showOffcanvas, setShowOffcanvas] = useState(false)

  return (
    <html lang="en">
      <head />
      <body>
        {/* 頂部導航欄 */}
        <TopNavbar />
        {/* TimeLog 專用的 Header 元件 */}
        <Header />
        <Suspense>
          {/* 全域 Context Providers 包裝器 */}
          <Providers>
            {/* 側邊導航觸發按鈕 */}
            <div className="p-3">
              <Button 
                variant="outline-primary" 
                onClick={() => setShowOffcanvas(true)}
              >
                Sidebar
              </Button>
            </div>
            
            {/* TimeLog 專用的側邊導航 */}
            <OffcanvasNav show={showOffcanvas} onHide={() => setShowOffcanvas(false)} />
            
            <Suspense>
              {/* 麵包屑導航 */}
              <NextBreadCrumb />
              {/* 頁面內容 - 這裡會渲染各個頁面的 children */}
              {children}
            </Suspense>
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
