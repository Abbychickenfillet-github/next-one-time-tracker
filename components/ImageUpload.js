'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function ImageUpload({
  onUploadSuccess,
  folder = 'general',
  transformations = null,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  buttonText = '上傳圖片',
  className = '',
  disabled = false,
}) {
  const { isAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 檢查是否已登入
    if (!isAuth) {
      setError('請先登入才能上傳圖片')
      return
    }

    // 檢查檔案類型
    if (!acceptedTypes.includes(file.type)) {
      setError(
        `僅支援 ${acceptedTypes.map((type) => type.split('/')[1].toUpperCase()).join('、')} 格式`
      )
      return
    }

    // 檢查檔案大小
    if (file.size > maxSize) {
      setError(`圖片大小不能超過 ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setLoading(true)
    setError('')

    // 創建預覽
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      if (transformations) {
        formData.append('transformations', JSON.stringify(transformations))
      }

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        // 成功上傳，觸發回調
        if (onUploadSuccess) {
          onUploadSuccess(result)
        }

        console.log('圖片上傳成功:', result.imageUrl)
      } else {
        setError(result.error || '上傳失敗')
        setPreview(null)
      }
    } catch (error) {
      console.error('上傳錯誤:', error)
      setError('上傳失敗，請檢查網路連線')
      setPreview(null)
    } finally {
      setLoading(false)
      // 清除 input 值，讓同一個檔案可以重新選擇
      e.target.value = ''
    }
  }

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }

  return (
    <div className={`image-upload ${className}`}>
      {/* 隱藏的檔案輸入 */}
      <input
        type="file"
        id={`image-upload-${folder}`}
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="d-none"
        disabled={loading || disabled}
      />

      {/* 預覽區域 */}
      {preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="預覽"
            className="img-thumbnail"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={clearPreview}
          >
            清除預覽
          </button>
        </div>
      )}

      {/* 自定義按鈕 */}
      <label
        htmlFor={`image-upload-${folder}`}
        className={`btn ${loading ? 'btn-secondary' : 'btn-outline-primary'} btn-sm`}
        style={{ cursor: loading || disabled ? 'not-allowed' : 'pointer' }}
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
          buttonText
        )}
      </label>

      {error && (
        <div className="mt-2">
          <small className="text-danger">{error}</small>
        </div>
      )}

      <div className="mt-2">
        <small className="text-muted">
          支援{' '}
          {acceptedTypes
            .map((type) => type.split('/')[1].toUpperCase())
            .join('、')}{' '}
          格式， 檔案大小 &lt; {Math.round(maxSize / 1024 / 1024)}MB
        </small>
      </div>
    </div>
  )
}

