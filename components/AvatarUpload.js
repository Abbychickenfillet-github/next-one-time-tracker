'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function AvatarUpload({ onUploadSuccess }) {
  // ========================================
  // 📥 onUploadSuccess 參數說明
  // ========================================
  // onUploadSuccess 是從父組件傳入的回調函數
  // 流向：父組件 → AvatarUpload → 上傳成功時呼叫
  // 用途：讓父組件知道上傳成功，並可以處理後續邏輯
  const { isAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 檢查是否已登入
    if (!isAuth) {
      setError('請先登入才能上傳圖片')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      // ========================================
      // 🔍 詳細的 Response 和 Result 資訊
      // ========================================
      console.log('📡 Response 物件:', response)
      console.log('📊 Response 狀態:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        type: response.type,
        redirected: response.redirected,
      })

      const result = await response.json()
      console.log('📦 Result 資料:', result)
      console.log('🔗 Result 類型:', typeof result)
      console.log('📋 Result 鍵值:', Object.keys(result))

      if (response.ok) {
        // 成功上傳，觸發回調
        if (onUploadSuccess) {
          onUploadSuccess(result.avatarUrl)
        }

        // 這裡可以顯示成功訊息
        console.log('頭貼上傳成功:', result.avatarUrl)
      } else {
        setError(result.error || '上傳失敗')
      }
    } catch (error) {
      console.error('上傳錯誤:', error)
      setError('上傳失敗，請檢查網路連線')
    } finally {
      // finally確保無論成功或失敗，資料庫連線都會被正確關閉，避免記憶體洩漏與連線池耗盡
      setLoading(false)
      // 清除 input 值，讓同一個檔案可以重新選擇
      e.target.value = ''
    }
  }

  return (
    <div className="avatar-upload">
      {/* 隱藏的檔案輸入 */}
      <input
        type="file"
        id="avatar-upload"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="d-none"
        disabled={loading}
      />

      {/* 自定義按鈕 */}
      <label
        htmlFor="avatar-upload"
        className={`btn ${loading ? 'btn-secondary' : 'btn-outline-primary'} btn-sm`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            上傳中...
          </>
        ) : (
          '更換頭貼'
        )}
      </label>

      {error && (
        <div className="mt-2">
          <small className="text-danger">{error}</small>
        </div>
      )}

      <div className="mt-2">
        <small className="text-muted">
          支援 JPG、PNG、WebP 格式，檔案大小 &lt; 2MB
        </small>
      </div>
    </div>
  )
}
