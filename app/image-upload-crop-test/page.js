'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import Image from 'next/image'
import styles from '@/styles/image-upload-crop-test.module.css'

// ReactCrop 需要使用原生 img 標籤，無法使用 Next.js Image 元件
/* eslint-disable @next/next/no-img-element */

export default function ImageUploadTestPage() {
  const { isAuth } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [crop, setCrop] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const imgRef = useRef(null)

  // ========================================
  // 📁 檔案選擇處理
  // ========================================
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案')
      return
    }

    // 檢查檔案大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('圖片大小不能超過 5MB')
      return
    }

    setError('')
    setSelectedFile(file)
    setCrop(null)
    setCroppedImage(null)
    setUploadResult(null)

    // 創建預覽（使用 FileReader 創建 data URL）
    const reader = new FileReader()
    reader.onload = () => {
      // FileReader 創建的 data URL 不需要 revoke
      setPreview(reader.result)
    }
    reader.onerror = () => {
      setError('讀取檔案失敗')
    }
    reader.readAsDataURL(file)
  }, [])

  // ========================================
  // ✂️ 裁切完成處理
  // ========================================
  const onCropComplete = useCallback(
    async (crop) => {
      if (!imgRef.current || !crop || !crop.width || !crop.height) {
        return
      }

      const image = imgRef.current
      const canvas = document.createElement('canvas')
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const ctx = canvas.getContext('2d')

      // 計算實際裁切尺寸
      const cropWidth = crop.width * scaleX
      const cropHeight = crop.height * scaleY
      const cropX = crop.x * scaleX
      const cropY = crop.y * scaleY

      canvas.width = cropWidth
      canvas.height = cropHeight

      // 繪製裁切後的圖片
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      )

      // 將裁切後的圖片轉換為 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // 清除舊的 URL
            if (croppedImage) {
              URL.revokeObjectURL(croppedImage)
            }
            const croppedUrl = URL.createObjectURL(blob)
            setCroppedImage(croppedUrl)
          }
        },
        'image/jpeg',
        0.95
      )
    },
    [croppedImage]
  )

  // ========================================
  // 📤 上傳圖片
  // ========================================
  const handleUpload = useCallback(async () => {
    if (!isAuth) {
      setError('請先登入才能上傳圖片')
      return
    }

    if (!selectedFile) {
      setError('請先選擇圖片')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()

      // 如果有裁切後的圖片，使用裁切後的；否則使用原始圖片
      if (croppedImage) {
        // 將裁切後的 URL 轉換為 Blob
        const response = await fetch(croppedImage)
        const blob = await response.blob()
        // 使用原始檔案名稱，但改為 .jpg 格式（因為裁切後是 JPEG）
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '.jpg')
        formData.append('image', blob, fileName)
      } else {
        formData.append('image', selectedFile)
      }

      formData.append('folder', 'test-uploads')

      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await uploadResponse.json()

      if (uploadResponse.ok) {
        setUploadResult(result)
        setError('')
      } else {
        setError(result.error || '上傳失敗')
      }
    } catch (err) {
      console.error('上傳錯誤:', err)
      setError('上傳失敗，請檢查網路連線')
    } finally {
      setUploading(false)
    }
  }, [isAuth, selectedFile, croppedImage])

  // ========================================
  // 🗑️ 清除選擇
  // ========================================
  const handleClear = useCallback(() => {
    // 釋放記憶體（只有 blob URL 需要 revoke）
    if (croppedImage) {
      URL.revokeObjectURL(croppedImage)
    }

    setSelectedFile(null)
    setPreview(null)
    setCrop(null)
    setCroppedImage(null)
    setUploadResult(null)
    setError('')
    if (imgRef.current) {
      imgRef.current.src = ''
    }
  }, [croppedImage])

  // ========================================
  // 🔄 重置裁切
  // ========================================
  const handleResetCrop = useCallback(() => {
    if (croppedImage) {
      URL.revokeObjectURL(croppedImage)
    }
    setCrop(null)
    setCroppedImage(null)
  }, [croppedImage])

  // ========================================
  // 🧹 清理記憶體
  // ========================================
  useEffect(() => {
    return () => {
      // 組件卸載時清理 blob URL（只有 blob URL 需要 revoke）
      // FileReader 創建的 data URL 不需要 revoke
      if (croppedImage) {
        URL.revokeObjectURL(croppedImage)
      }
    }
  }, [croppedImage])

  if (!isAuth) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <h4>請先登入</h4>
          <p>您需要先登入才能測試圖片上傳功能。</p>
        </Alert>
      </Container>
    )
  }

  return (
    <div className={styles.imageUploadCropTest}>
      <Container className="mt-5 mb-5">
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h2>📸 圖片上傳測試（含預覽與裁切）</h2>
              </Card.Header>
              <Card.Body>
                {/* 檔案選擇區域 */}
                <div className="mb-4">
                  <label htmlFor="file-input" className="form-label">
                    <strong>選擇圖片檔案</strong>
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="form-control"
                    disabled={uploading}
                  />
                  <small className="form-text text-muted">
                    支援 JPG、PNG、WebP、GIF 格式，檔案大小 &lt; 5MB
                  </small>
                </div>

                {error && (
                  <Alert variant="danger" className="mt-3">
                    {error}
                  </Alert>
                )}

                {/* 預覽與裁切區域 */}
                {preview && (
                  <div className="mt-4">
                    <Row>
                      <Col md={6}>
                        <Card>
                          <Card.Header>
                            <h5>📷 原始圖片預覽</h5>
                          </Card.Header>
                          <Card.Body>
                            <div
                              style={{
                                position: 'relative',
                                width: '100%',
                                maxHeight: '500px',
                                overflow: 'auto',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                              }}
                            >
                              <ReactCrop
                                crop={crop}
                                onChange={(newCrop) => setCrop(newCrop)}
                                onComplete={onCropComplete}
                                aspect={null}
                                minWidth={100}
                                minHeight={100}
                              >
                                {/* ReactCrop 需要使用原生 img 標籤，無法使用 Next.js Image 元件 */}
                                <img
                                  ref={imgRef}
                                  src={preview}
                                  alt="預覽"
                                  style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block',
                                  }}
                                  onLoad={() => {
                                    // 圖片載入完成後，設定初始裁切區域
                                    if (imgRef.current && !crop) {
                                      const { width, height } = imgRef.current
                                      setCrop({
                                        unit: 'px',
                                        width: Math.min(width, 400),
                                        height: Math.min(height, 400),
                                        x: 0,
                                        y: 0,
                                      })
                                    }
                                  }}
                                />
                              </ReactCrop>
                            </div>
                            <div className="mt-3">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleResetCrop}
                                className="me-2"
                              >
                                🔄 重置裁切
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleClear}
                              >
                                🗑️ 清除選擇
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6}>
                        <Card>
                          <Card.Header>
                            <h5>✂️ 裁切後預覽</h5>
                          </Card.Header>
                          <Card.Body>
                            {croppedImage ? (
                              <div
                                style={{
                                  border: '1px solid #dee2e6',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  backgroundColor: '#f8f9fa',
                                  textAlign: 'center',
                                }}
                              >
                                {/* 裁切後的 blob URL 無法使用 Next.js Image 元件優化 */}
                                <img
                                  src={croppedImage}
                                  alt="裁切後"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    height: 'auto',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                            ) : (
                              <Alert variant="info">
                                <p className="mb-0">
                                  請在左側圖片上拖曳選擇裁切區域
                                </p>
                              </Alert>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* 上傳按鈕 */}
                {selectedFile && (
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-100"
                    >
                      {uploading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          上傳中...
                        </>
                      ) : (
                        <>
                          📤 上傳圖片
                          {croppedImage ? '（裁切後）' : '（原始）'}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* 上傳結果 */}
                {uploadResult && (
                  <Card className="mt-4">
                    <Card.Header>
                      <h5>✅ 上傳成功</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong>圖片 URL:</strong>
                        <br />
                        <a
                          href={uploadResult.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-break"
                        >
                          {uploadResult.imageUrl}
                        </a>
                      </div>
                      <div className="mb-3">
                        <strong>Public ID:</strong> {uploadResult.publicId}
                      </div>
                      <div className="mb-3">
                        <strong>尺寸:</strong> {uploadResult.width} x{' '}
                        {uploadResult.height} 像素
                      </div>
                      <div className="mb-3">
                        <strong>格式:</strong> {uploadResult.format}
                      </div>
                      <div className="mb-3">
                        <strong>檔案大小:</strong>{' '}
                        {(uploadResult.size / 1024).toFixed(2)} KB
                      </div>
                      <div className="mt-3">
                        <Image
                          src={uploadResult.imageUrl}
                          alt="上傳的圖片"
                          width={400}
                          height={300}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6',
                          }}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
