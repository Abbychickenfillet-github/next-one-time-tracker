'use client'

import Link from 'next/link'
import { useEffect } from 'react'

// Not Found 頁面 - 處理 404 錯誤
export default function NotFound() {
  useEffect(() => {
    // 在開發環境中記錄 404 錯誤
    if (process.env.NODE_ENV === 'development') {
      console.log('404 - 頁面不存在')
    }
  }, [])

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card shadow">
            <div className="card-body p-5">
              <h1 className="display-1 text-primary mb-4">404</h1>
              <h2 className="h4 mb-3">頁面不存在</h2>
              <p className="text-muted mb-4">
                抱歉，您要尋找的頁面不存在或已被移除。
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <Link href="/" className="btn btn-primary">
                  <i className="bi bi-house-door me-2"></i>
                  返回首頁
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  返回上頁
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
