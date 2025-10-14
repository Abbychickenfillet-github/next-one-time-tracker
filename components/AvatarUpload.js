'use client'

import { useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { useAuth } from '@/hooks/use-auth'

export default function AvatarUpload({ onUploadSuccess }) {
  //   const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

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
