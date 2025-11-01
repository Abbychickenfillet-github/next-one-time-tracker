'use client'
import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, Col, Alert, Spinner } from 'react-bootstrap'
// import { useAuth } from '@/hooks/use-auth' // 暫時未使用，保留供未來使用
import Image from 'next/image'

export default function FeaturedShares() {
  // const { isAuth } = useAuth() // 暫時未使用，保留供未來使用
  const [featuredShares, setFeaturedShares] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 載入精選分享資料
  useEffect(() => {
    loadFeaturedShares()
  }, [])

  const loadFeaturedShares = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/featured-shares', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.status === 'success') {
        setFeaturedShares(result.data)
      } else {
        throw new Error(result.message || '載入精選分享失敗')
      }
    } catch (error) {
      console.error('載入精選分享失敗:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 格式化時間
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 格式化持續時間
  const formatDuration = (hours) => {
    if (!hours) return '0 小時'
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes} 分鐘`
    }
    return `${hours.toFixed(1)} 小時`
  }

  // 計算時間差
  const calculateTimeGap = (endTime, nextStartTime) => {
    if (!endTime || !nextStartTime) return null
    const gap = new Date(nextStartTime) - new Date(endTime)
    const seconds = Math.floor(gap / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return `${seconds}秒`
    if (minutes < 60) return `${minutes}分`
    return `${hours}小時${minutes % 60}分`
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        {/* 頁面標題 */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">⭐ 精選分享</h2>
                <p className="text-muted mb-0">探索其他使用者的精彩時間記錄</p>
              </div>
              <Button
                variant="outline-primary"
                onClick={loadFeaturedShares}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" className="me-2" />
                ) : (
                  <i className="bi bi-arrow-clockwise me-2"></i>
                )}
                重新載入
              </Button>
            </div>
          </div>
        </div>

        {/* 錯誤顯示 */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <Alert variant="danger">
                <Alert.Heading>載入失敗</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={loadFeaturedShares}>
                  重新載入
                </Button>
              </Alert>
            </div>
          </div>
        )}

        {/* 載入中 */}
        {isLoading && (
          <div className="row">
            <div className="col-12 text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">載入精選分享中...</p>
            </div>
          </div>
        )}

        {/* 精選分享列表 */}
        {!isLoading && !error && (
          <>
            {featuredShares.length === 0 ? (
              <div className="row">
                <div className="col-12">
                  <Card className="text-center py-5">
                    <Card.Body>
                      <div className="display-6 mb-3">🌟</div>
                      <h4>尚無精選分享</h4>
                      <p className="text-muted">
                        當其他使用者分享他們的精彩記錄時，內容會顯示在這裡
                      </p>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="row">
                {featuredShares.map((share) => (
                  <Col key={share.id} lg={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-gradient">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <Image
                              src={share.userAvatar || '/avatar/avatar.svg'}
                              alt="用戶頭像"
                              width={32}
                              height={32}
                              className="rounded-circle me-2"
                              style={{ border: '2px solid #fff' }}
                            />
                            <div>
                              <h6 className="mb-0 text-white">
                                {share.userName || '匿名用戶'}
                              </h6>
                              <small className="text-white-50">
                                {formatDate(share.createdAt)}
                              </small>
                            </div>
                          </div>
                          <Badge bg="warning" className="fs-6">
                            ⭐ {share.starCount || 0}
                          </Badge>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <h5 className="card-title">{share.title}</h5>
                        {share.description && (
                          <p className="card-text text-muted">
                            {share.description}
                          </p>
                        )}

                        {/* 時間資訊 */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">開始時間:</span>
                            <span>{formatDate(share.startTime)}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">結束時間:</span>
                            <span>{formatDate(share.endTime)}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">持續時間:</span>
                            <Badge bg="info">
                              {formatDuration(share.duration)}
                            </Badge>
                          </div>
                        </div>

                        {/* 步驟記錄 */}
                        {share.steps && share.steps.length > 0 ? (
                          <div className="mb-3">
                            <h6 className="text-primary">
                              📋 詳細步驟 ({share.steps.length} 步驟)
                            </h6>
                            <div
                              className="list-group list-group-flush"
                              style={{ maxHeight: '200px', overflowY: 'auto' }}
                            >
                              {share.steps.map((step, index) => (
                                <div
                                  key={step.id || index}
                                  className="list-group-item px-0 py-2"
                                >
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                      <strong>
                                        {step.title || '未命名步驟'}
                                      </strong>
                                      {step.description && (
                                        <div className="small text-muted mt-1">
                                          {step.description}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-end ms-2">
                                      <div className="small text-muted">
                                        {formatDate(step.startTime)}
                                      </div>
                                      {step.endTime && (
                                        <div className="small text-muted">
                                          至 {formatDate(step.endTime)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {index < share.steps.length - 1 && (
                                    <div className="text-center py-1 text-muted small">
                                      <span className="mx-2">▶</span>
                                      <span className="badge bg-light text-dark">
                                        {calculateTimeGap(
                                          step.endTime,
                                          share.steps[index + 1].startTime
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <h6 className="text-muted">📋 詳細步驟</h6>
                            <p className="text-muted small mb-0">
                              此記錄尚無詳細步驟
                            </p>
                          </div>
                        )}

                        {/* 分享原因 */}
                        {share.shareReason && (
                          <div className="mb-3">
                            <h6 className="text-success">💭 分享原因</h6>
                            <p className="text-muted small">
                              {share.shareReason}
                            </p>
                          </div>
                        )}
                      </Card.Body>
                      <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            分享於 {formatDate(share.sharedAt)}
                          </small>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                            >
                              <i className="bi bi-heart"></i> 讚
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              <i className="bi bi-share"></i> 分享
                            </Button>
                          </div>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
