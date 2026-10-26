'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTrialTimeLogStore } from '@/stores/useTrialTimeLogStore'
import VoiceInput from '@/components/timelog/VoiceInput'
import LocaleSwitcher from '@/components/common/LocaleSwitcher'
import { Container, Card, Button, Alert, Row, Col } from 'react-bootstrap'
import Link from 'next/link'

const SUPPORTED_LOCALES = [
  { value: 'zh-TW', label: '中文（台灣）' },
  { value: 'zh-CN', label: '中文（中國大陸）' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'ja-JP', label: '日本語（日本）' },
  { value: 'ko-KR', label: '한국어 (대한민국)' },
  { value: 'fr-FR', label: 'Français (France)' },
]

// 舊的翻譯對象已移除，改用 react-i18next 和 JSON 檔案
// 翻譯資源位於 locales/ 目錄下

export default function TrialPage() {
  // ===== react-i18next 翻譯 =====
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'zh-TW'

  // ===== Zustand 狀態管理 =====
  const {
    // 狀態
    title,
    desc,
    startTime,
    endTime,
    steps,
    currentTime,
    isClient,
    savedActivities,
    // Actions
    setClient,
    updateCurrentTime,
    setTitle,
    setDesc,
    startActivity,
    endActivity,
    addStep,
    endSubStep,
    clearStorage,
    getElapsedMinutes,
    getActivityStatus,
    saveCurrentActivity,
    deleteSavedActivity,
    loadSavedActivities,
  } = useTrialTimeLogStore()

  // ===== 時間格式狀態 =====
  const [hour12, setHour12] = useState(false)

  // ===== 語言切換處理 =====
  const handleLocaleChange = (newLocale) => {
    i18n.changeLanguage(newLocale)
  }

  // ===== 活動狀態翻譯 =====
  const getTranslatedActivityStatus = () => {
    const status = getActivityStatus()
    if (status === '準備中') return t('statusReady')
    if (status === '進行中') return t('statusInProgress')
    if (status === '已結束') return t('statusCompleted')
    return status
  }

  useEffect(() => {
    try {
      const { hour12: resolvedHour12 } = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
      }).resolvedOptions()
      setHour12(resolvedHour12 ?? false)
    } catch (error) {
      console.warn('無法解析所選語系的時間格式，改用 24 小時制', error)
      setHour12(false)
    }
  }, [locale])

  // 由於 savedActivities 已經是 Zustand 的狀態，我們可以使用它來計算數量
  const [localStorageCount, setLocalStorageCount] = useState(0)

  // ===== 客戶端渲染標記 =====
  useEffect(() => {
    setClient(true)
    // 載入已儲存的活動
    loadSavedActivities()
  }, [setClient, loadSavedActivities])

  // ===== 即時時間更新 =====
  useEffect(() => {
    if (!isClient) return

    // 立即設定初始時間
    updateCurrentTime()

    const timer = setInterval(() => {
      updateCurrentTime()
    }, 1000)

    return () => clearInterval(timer)
  }, [isClient, updateCurrentTime])

  // ===== 檢查 localStorage 使用量 (當 savedActivities 改變時執行) =====
  // 依賴 savedActivities 變化來自動更新計數
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = savedActivities.length // 直接使用 Zustand 狀態的長度
      setLocalStorageCount(count)
    }
  }, [savedActivities]) // 當 savedActivities 改變時重新檢查

  // ===== 開始活動 =====
  const handleStart = () => {
    startActivity()
  }

  // ===== 儲存當前活動 =====
  const handleSaveActivity = () => {
    const success = saveCurrentActivity()
    if (success) {
      // TODO: 替換為自訂彈出視窗
      console.log(t('saveActivity') + ' - Success')
    }
  }

  // ===== 清除 localStorage =====
  const handleClearStorage = async () => {
    const { default: Swal } = await import('sweetalert2')
    const result = await Swal.fire({
      title: t('confirmClear'),
      text: t('confirmClearText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('clear'),
      cancelButtonText: t('cancel'),
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    })

    if (result.isConfirmed) {
      clearStorage()
      Swal.fire({
        title: t('cleared'),
        text: t('clearedText'),
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    }
  }

  // ===== 新增階段步驟 =====
  const handleAddStep = () => {
    addStep()
  }

  // ===== 結束子步驟 =====
  const handleEndSubStep = (index) => {
    endSubStep(index)
  }

  // ===== 語音輸入處理 =====
  const handleVoiceInput = (result, inputType) => {
    if (inputType === 'title') {
      setTitle(result)
    } else {
      // 預設或 inputType === 'desc' 時，設置到活動描述
      setDesc(result)
    }
  }

  // ===== 格式化時間 =====
  const formatTime = (date) => {
    if (!date) return '--:--:--'

    const dateObj = date instanceof Date ? date : new Date(date)
    if (Number.isNaN(dateObj.getTime())) return '--:--:--'

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12,
    }

    try {
      return dateObj.toLocaleString(locale, options)
    } catch (error) {
      console.warn('toLocaleString 解析失敗，使用瀏覽器預設語系', error)
      return dateObj.toLocaleString(undefined, options)
    }
  }

  // ===== 格式化日期 =====
  const formatDate = (date) => {
    if (!date) return '--'

    const dateObj = date instanceof Date ? date : new Date(date)
    if (Number.isNaN(dateObj.getTime())) return '--'
    // 所以這邊回傳true，它不是一個數字。

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }

    try {
      return dateObj.toLocaleDateString(locale, options)
    } catch (error) {
      console.warn('toLocaleDateString 解析失敗，使用瀏覽器預設語系', error)
      return dateObj.toLocaleDateString(undefined, options)
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Trial Banner */}
      <Container className="py-4">
        {/* 主要 TimeLog 介面 */}
        <Card className="shadow-sm">
          <Card.Header
            className="text-white"
            style={{
              background:
                'var(--button-bg, linear-gradient(45deg, #0dcaf0, #0aa2c0))',
            }}
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h4 className="mb-1">{t('pageTitle')}</h4>
                <span className="small">
                  {t('localStorageUsage')}: {localStorageCount}/10{' '}
                  {t('records')}
                </span>
              </div>
              <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-white-50">
                    {t('displayLanguage')}
                  </span>
                  <LocaleSwitcher
                    value={locale}
                    onChange={handleLocaleChange}
                    options={SUPPORTED_LOCALES}
                    className="bg-white bg-opacity-75 text-dark"
                    style={{ minWidth: '190px' }}
                    ariaLabel={t('displayLanguage')}
                  />
                </div>
                {/* localStorage 使用量指示器 */}
                <Button
                  className="btn-sm text-white mt-2 mt-md-0"
                  variant="outline-white"
                  size="sm"
                  onClick={handleClearStorage}
                >
                  {t('clearRecords')}
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            {/* 導入響應式 Row & Col */}
            <Row>
              {/* ===== 左側欄：即時活動控制與步驟 (md=7, 佔用較多空間) ===== */}
              <Col md={7} className="border-end pe-md-4 mb-4 mb-md-0">
                {/* 1. 目前時間顯示 */}
                <div className="text-center mb-4">
                  <div className="display-6 text-primary fw-bold">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-muted">{formatDate(currentTime)}</div>
                </div>

                {/* 2. 活動資訊輸入 */}
                <Row className="mb-1">
                  <Col>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        {t('activityName')}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder={t('activityNamePlaceholder')}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold invisible">
                        {t('activityNameVoiceInput')}
                      </label>
                      <div className="text-center w-100 d-flex justify-content-center">
                        <VoiceInput
                          onResult={handleVoiceInput}
                          inputType="title"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={9}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        {t('activityDesc')}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('activityDescPlaceholder')}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                      />
                    </div>
                  </Col>
                  {/* 3. 語音輸入 */}
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold invisible">
                        {t('activityDescVoiceInput')}
                      </label>
                      <div className="text-center w-100 d-flex justify-content-center">
                        <VoiceInput
                          onResult={handleVoiceInput}
                          inputType="desc"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* 4. 控制按鈕 */}
                <div className="text-center mb-4">
                  <div className="btn-group" role="group">
                    {getActivityStatus() === '準備中' && (
                      <Button
                        variant="success"
                        size="lg"
                        onClick={handleStart}
                        disabled={!isClient || !title.trim()}
                      >
                        {t('startRecording')}
                      </Button>
                    )}
                    {getActivityStatus() === '進行中' && (
                      <>
                        <Button
                          variant="info"
                          size="lg"
                          onClick={handleAddStep}
                        >
                          {t('recordTimePoint')}
                        </Button>
                        <Button
                          variant="warning"
                          size="lg"
                          onClick={endActivity}
                        >
                          {t('endActivity')}
                        </Button>
                      </>
                    )}
                    {getActivityStatus() === '已結束' && (
                      <>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleStart}
                        >
                          {t('restart')}
                        </Button>
                        <Button
                          variant="success"
                          size="lg"
                          onClick={handleSaveActivity}
                          disabled={isClient && localStorageCount >= 10}
                        >
                          {t('saveActivity')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 5. 活動狀態顯示 */}
                {startTime && (
                  <div className="text-center mb-4">
                    <div className="alert alert-info">
                      <strong>{t('activityStatus')}:</strong>{' '}
                      {getTranslatedActivityStatus()}
                      {startTime && (
                        <div className="mt-2">
                          <strong>{t('startTime')}:</strong>{' '}
                          {formatTime(startTime)}
                          {endTime && (
                            <>
                              <br />
                              <strong>{t('endTime')}:</strong>{' '}
                              {formatTime(endTime)}
                              <br />
                              <strong>{t('duration')}:</strong>{' '}
                              {getElapsedMinutes()} {t('minutes')}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. 步驟列表 */}
                {steps.length > 0 && (
                  <div className="mb-4">
                    <h5 className="mb-3">{t('recordedSteps')}</h5>
                    <div className="list-group">
                      {steps.map((step, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>
                                {t('step')} {index + 1}:
                              </strong>{' '}
                              {step.title || step.name}
                              {step.description && (
                                <div className="text-muted small">
                                  {step.description}
                                </div>
                              )}
                            </div>
                            <div className="text-end">
                              <div className="small text-muted">
                                {t('start')}: {formatTime(step.startTime)}
                              </div>
                              {step.endTime ? (
                                <div className="small text-muted">
                                  {t('end')}: {formatTime(step.endTime)}
                                </div>
                              ) : (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleEndSubStep(index)}
                                >
                                  {t('end')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Col>

              {/* ===== 右側欄：活動歷史與升級提示 (md=5, 較窄空間) ===== */}
              <Col md={5} className="ps-md-4">
                {/* 7. 已儲存活動列表 */}
                {savedActivities.length > 0 && (
                  <div className="mb-4">
                    <h5 className="mb-3">{t('savedActivities')}</h5>
                    <div className="list-group">
                      {savedActivities.map((activity, index) => (
                        <div key={activity.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>
                                {t('activity')} {index + 1}:
                              </strong>{' '}
                              {activity.title}
                              {activity.desc && (
                                <div className="text-muted small">
                                  {t('description')}: {activity.desc}
                                </div>
                              )}
                              <div className="text-muted small">
                                {t('start')}: {formatTime(activity.startTime)} |{' '}
                                {t('end')}: {formatTime(activity.endTime)} |{' '}
                                {t('duration')}:{' '}
                                {Math.floor(activity.duration / 1000 / 60)}{' '}
                                {t('minutes')}
                              </div>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={async () => {
                                const { default: Swal } = await import(
                                  'sweetalert2'
                                )
                                const result = await Swal.fire({
                                  title: t('confirmDelete'),
                                  text: t('confirmDeleteText'),
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonText: t('delete'),
                                  cancelButtonText: t('cancel'),
                                  confirmButtonColor: '#dc3545',
                                  cancelButtonColor: '#6c757d',
                                })

                                if (result.isConfirmed) {
                                  deleteSavedActivity(activity.id)
                                  Swal.fire({
                                    title: t('deleted'),
                                    text: t('deletedText'),
                                    icon: 'success',
                                    timer: 2000,
                                    showConfirmButton: false,
                                  })
                                }
                              }}
                            >
                              {t('delete')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. 升級提示 (保持在右側欄底部，優先於歷史紀錄) */}
                <Alert variant="success" className="mt-4 mt-md-0">
                  <h5>{t('upgradeTitle')}</h5>
                  <ul className="mb-3">
                    <li>{t('upgradeFeature1')}</li>
                    <li>{t('upgradeFeature2')}</li>
                    <li>{t('upgradeFeature3')}</li>
                    <li>{t('upgradeFeature4')}</li>
                  </ul>
                  <div className="d-flex gap-2">
                    <Button variant="success" as={Link} href="/user/register">
                      {t('registerNow')}
                    </Button>
                    <Button
                      variant="outline-success"
                      as={Link}
                      href="/subscription"
                    >
                      {t('viewPlans')}
                    </Button>
                  </div>
                </Alert>
              </Col>
            </Row>
            {/* 結束 Row */}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
