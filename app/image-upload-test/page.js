'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import ImageUpload from '@/components/ImageUpload'
import AvatarUpload from '@/components/AvatarUpload'

export default function ImageUploadTest() {
  const { isAuth, user } = useAuth()
  const [uploadResults, setUploadResults] = useState([])

  const handleImageUploadSuccess = (result) => {
    console.log('圖片上傳成功:', result)
    setUploadResults((prev) => [
      ...prev,
      {
        type: 'general',
        url: result.imageUrl,
        publicId: result.publicId,
        timestamp: new Date().toLocaleString(),
      },
    ])
  }

  const handleAvatarUploadSuccess = (result) => {
    console.log('頭貼上傳成功:', result)
    setUploadResults((prev) => [
      ...prev,
      {
        type: 'avatar',
        url: result,
        timestamp: new Date().toLocaleString(),
      },
    ])
  }

  if (!isAuth) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>請先登入</h4>
          <p>您需要先登入才能測試圖片上傳功能。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <h1>圖片上傳測試</h1>
      <p>歡迎，{user?.name || user?.email}！</p>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>頭貼上傳測試</h5>
            </div>
            <div className="card-body">
              <AvatarUpload onUploadSuccess={handleAvatarUploadSuccess} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>一般圖片上傳測試</h5>
            </div>
            <div className="card-body">
              <ImageUpload
                onUploadSuccess={handleImageUploadSuccess}
                folder="test"
                buttonText="上傳測試圖片"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>上傳結果</h5>
            </div>
            <div className="card-body">
              {uploadResults.length === 0 ? (
                <p className="text-muted">尚未上傳任何圖片</p>
              ) : (
                <div className="row">
                  {uploadResults.map((result, index) => (
                    <div key={index} className="col-md-4 mb-3">
                      <div className="card">
                        <img
                          src={result.url}
                          className="card-img-top"
                          alt={`上傳的圖片 ${index + 1}`}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="card-body">
                          <h6 className="card-title">
                            {result.type === 'avatar' ? '頭貼' : '一般圖片'}
                          </h6>
                          <p className="card-text">
                            <small className="text-muted">
                              上傳時間: {result.timestamp}
                            </small>
                          </p>
                          {result.publicId && (
                            <p className="card-text">
                              <small className="text-muted">
                                Public ID: {result.publicId}
                              </small>
                            </p>
                          )}
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            查看原圖
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Cloudinary 配置資訊</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>環境變數檢查</h6>
                  <ul className="list-unstyled">
                    <li>
                      <strong>CLOUDINARY_CLOUD_NAME:</strong>
                      <span
                        className={
                          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                            ? 'text-success'
                            : 'text-danger'
                        }
                      >
                        {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                          ? '✓ 已設定'
                          : '✗ 未設定'}
                      </span>
                    </li>
                    <li>
                      <strong>CLOUDINARY_API_KEY:</strong>
                      <span
                        className={
                          process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
                            ? 'text-success'
                            : 'text-danger'
                        }
                      >
                        {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
                          ? '✓ 已設定'
                          : '✗ 未設定'}
                      </span>
                    </li>
                    <li>
                      <strong>CLOUDINARY_API_SECRET:</strong>
                      <span className="text-warning">⚠️ 僅在伺服器端使用</span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>功能說明</h6>
                  <ul>
                    <li>頭貼上傳：自動調整為 200x200 像素，WebP 格式</li>
                    <li>一般圖片：限制為 800x600 像素，WebP 格式</li>
                    <li>支援格式：JPG、PNG、WebP、GIF</li>
                    <li>檔案大小限制：頭貼 2MB，一般圖片 5MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

