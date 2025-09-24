'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function DebugPage() {
  const { auth } = useAuth()
  const [cookies, setCookies] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    setCookies(document.cookie)
  }, [refreshCount])

  const refreshCookies = () => {
    setRefreshCount(prev => prev + 1)
    setCookies(document.cookie)
  }

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/local/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'password123' 
        })
      })
      
      const result = await response.json()
      console.log('登入測試結果:', result)
      refreshCookies()
    } catch (error) {
      console.error('登入測試失敗:', error)
    }
  }

  const testAuthCheck = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json()
      console.log('認證檢查結果:', result)
    } catch (error) {
      console.error('認證檢查失敗:', error)
    }
  }

  return (
    <div className="container py-4">
      <h1>🔧 認證調試頁面</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>📊 Auth 狀態</h5>
            </div>
            <div className="card-body">
              <pre>{JSON.stringify(auth, null, 2)}</pre>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>🍪 Cookie 資訊</h5>
              <button className="btn btn-sm btn-outline-primary" onClick={refreshCookies}>
                刷新
              </button>
            </div>
            <div className="card-body">
              <p><strong>Cookie 內容:</strong></p>
              <pre style={{fontSize: '12px', maxHeight: '200px', overflow: 'auto'}}>
                {cookies || '無 Cookie'}
              </pre>
              
              <div className="mt-3">
                <p><strong>Cookie 分析:</strong></p>
                <ul className="list-unstyled">
                  <li>ACCESS_TOKEN: {cookies.includes('ACCESS_TOKEN') ? '✅ 存在' : '❌ 不存在'}</li>
                  <li>LINE_LOGIN: {cookies.includes('LINE_LOGIN') ? '✅ 存在' : '❌ 不存在'}</li>
                  <li>總 Cookie 數量: {cookies.split(';').filter(c => c.trim()).length}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>🧪 測試功能</h5>
            </div>
            <div className="card-body">
              <div className="btn-group me-2">
                <button className="btn btn-primary" onClick={testLogin}>
                  測試登入
                </button>
                <button className="btn btn-info" onClick={testAuthCheck}>
                  測試認證檢查
                </button>
                <button className="btn btn-warning" onClick={refreshCookies}>
                  刷新 Cookie
                </button>
              </div>
              
              <div className="mt-3">
                <h6>📝 調試說明:</h6>
                <ul>
                  <li><strong>測試登入:</strong> 使用測試帳號進行登入測試</li>
                  <li><strong>測試認證檢查:</strong> 檢查當前認證狀態</li>
                  <li><strong>刷新 Cookie:</strong> 重新讀取瀏覽器 Cookie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>🔍 問題排查</h5>
            </div>
            <div className="card-body">
              <h6>常見問題:</h6>
              <ol>
                <li><strong>Cookie 無法設置:</strong> 檢查 secure 設定，開發環境應為 false</li>
                <li><strong>認證狀態不更新:</strong> 檢查 useAuth hook 的狀態管理</li>
                <li><strong>跳轉失敗:</strong> 檢查 router.replace 是否正確調用</li>
                <li><strong>API 路徑錯誤:</strong> 確認 API 路由是否正確設置</li>
              </ol>
              
              <h6 className="mt-3">當前狀態:</h6>
              <ul>
                <li>認證狀態: {auth.isAuth ? '✅ 已認證' : '❌ 未認證'}</li>
                <li>檢查完成: {auth.hasChecked ? '✅ 已完成' : '⏳ 進行中'}</li>
                <li>載入狀態: {auth.isLoading ? '⏳ 載入中' : '✅ 完成'}</li>
                <li>用戶 ID: {auth.userData.user_id || '未設定'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



