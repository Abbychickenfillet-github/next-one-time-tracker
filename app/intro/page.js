'use client'
import React, { useState, useCallback } from 'react'
import { Carousel, Card, Button, Container, Row, Col } from 'react-bootstrap'
import Link from 'next/link'
import {
  FaClock,
  FaCloud,
  FaMobile,
  FaChartLine,
  //   FaTrash,
  FaSync,
  FaShieldAlt,
  FaRobot,
} from 'react-icons/fa'
import styles from './intro.module.scss'
import NextSectionBtn from '@/components/next-section-btn/next-section-btn'

export default function IntroPage() {
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToNextSection = useCallback(() => {
    console.log('按鈕被點擊了！')

    // 找到 main 元素（實際的滾動容器）
    const mainElement = document.querySelector('main')
    if (!mainElement) {
      console.log('找不到 main 元素')
      return
    }

    const currentScrollY = mainElement.scrollTop
    const viewportHeight = window.innerHeight

    // 計算當前在哪個 section (每個 section 都是 100vh)
    const currentSection = Math.floor(currentScrollY / viewportHeight)
    const nextSection = currentSection + 1
    const targetScrollY = nextSection * viewportHeight

    console.log('當前滾動位置:', currentScrollY)
    console.log('視窗高度:', viewportHeight)
    console.log('當前 section:', currentSection)
    console.log('目標 section:', nextSection)
    console.log('目標滾動位置:', targetScrollY)

    // 滾動到下一個 section
    mainElement.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    })

    console.log('滾動指令已執行')
  }, []) // 空依賴陣列，函數不會重新創建

  const features = [
    {
      icon: <FaClock className="text-primary" />,
      title: '免費體驗',
      description: '無需註冊，立即開始記錄時間',
      details: '使用 localStorage 儲存，最多 10 筆記錄',
    },
    {
      icon: <FaCloud className="text-info" />,
      title: '雲端同步',
      description: '付費後享受多裝置同步',
      details: '免費版50次/小時API呼叫，付費版120次/小時',
    },
    {
      icon: <FaMobile className="text-success" />,
      title: '多裝置支援',
      description: '付費版支援多裝置同步',
      details: '免費版單裝置，付費版多裝置同步',
    },
    {
      icon: <FaChartLine className="text-warning" />,
      title: '數據分析',
      description: '付費版提供詳細分析報告',
      details: '了解時間分配，提升效率',
    },
    {
      icon: <FaRobot className="text-danger" />,
      title: 'AI 智能分析',
      description: 'Gemini 2.5 Flash 深度分析',
      details: '付費版提供 AI 時間洞察與建議',
    },
  ]

  const pricingPlans = [
    {
      name: '未註冊免費版',
      price: 'NT$ 0',
      period: '永久免費',
      features: [
        'localStorage 儲存',
        '最多 10 筆記錄',
        '每小時 50 次 API 呼叫',
        '基礎時間記錄',
        '7 天資料保存',
        '⚠️ 未註冊無法多裝置同步',
        '🚦 每小時50次 API 呼叫',
        '🚦 每天120次資料庫查詢',
      ],
      buttonText: '立即註冊',
      buttonVariant: 'outline-primary',
    },
    {
      name: '基礎版',
      price: 'NT$ 99',
      period: '每月',
      features: [
        '✅ 解鎖多裝置同步',
        '✅ 50筆記錄數量',
        '✅ 雲端資料庫儲存',
        '✅ 資料永久保存',
        '✅ 基礎統計分析',
        '📱 手機、平板、電腦同步',
        '🚦 每小時120次 API 呼叫',
        '🚦 每天520次資料庫查詢',
        'Gemini 2.5 Flash AI 勾選活動並 分析',
        '輸入Prompt全站與AI互動',
      ],
      buttonText: '開始訂閱',
      buttonVariant: 'primary',
    },
    {
      name: '專業版',
      price: 'NT$ 199',
      period: '每月',
      features: [
        '包含基礎版所有功能',
        'AI 時間洞察與建議',
        '自定義報告',
        '資料匯出功能',
        '優先客戶支援',
      ],
      buttonText: '即將推出',
      buttonVariant: 'secondary',
      disabled: true,
    },
  ]

  const clearStorageSteps = [
    {
      step: 1,
      title: '開啟開發者工具',
      description: '按 F12 鍵或右鍵選擇「檢查」開啟開發者工具',
    },
    {
      step: 2,
      title: '切換到應用程式分頁',
      description: '點擊頂部選單中的「Application」或「應用程式」分頁',
    },
    {
      step: 3,
      title: '展開儲存空間選項',
      description: '在左側面板找到並點擊「Storage」或「儲存空間」選項',
    },
    {
      step: 4,
      title: '選擇本地儲存',
      description: '展開「Local Storage」選項，點擊您的網站域名',
    },
    {
      step: 5,
      title: '選取要清除的資料',
      description: '在右側面板中選擇要刪除的項目，或全選所有資料',
    },
    {
      step: 6,
      title: '執行清除操作',
      description: '右鍵點擊選中的項目，選擇「Delete」或「刪除」完成清除',
    },
  ]

  return (
    <div className={styles.introPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  智能時間管理
                  <span className={styles.highlight}> 從免費開始</span>
                </h1>
                <p className={styles.heroDescription}>
                  無需註冊，立即體驗時間記錄功能。免費版每小時50次API呼叫，
                  付費版每小時120次API呼叫，解鎖多裝置同步與無限記錄，更提供
                  Gemini 2.5 Flash AI 分析，讓你的時間管理更智能、更高效。
                </p>
                {/* 廣告意象卡片 */}
                <div
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-4 p-4 mb-4 border border-white border-opacity-25"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    animation: 'fadeInUp 0.8s ease-out',
                  }}
                >
                  <h4 className="text-white fw-semibold mb-3">
                    <span className="d-inline-block me-2">💭</span>
                    就算是I人
                  </h4>
                  <p
                    className="text-white fs-5 lh-lg mb-0"
                    style={{ opacity: 0.95 }}
                  >
                    這邊也能傾聽您所有的狀態，
                    <br />
                    並以您希望的方式給予建議
                  </p>
                  <div className="mt-3 pt-3 border-top border-white border-opacity-25">
                    <p className="text-white-50 small mb-0">
                      ✨ 在這裡，每個人都能找到屬於自己的空間
                    </p>
                  </div>
                </div>
                <div className={styles.heroButtons}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="me-3"
                    as={Link}
                    href="/trial"
                  >
                    立即開始記錄
                  </Button>
                  <Button
                    variant="outline-light"
                    size="lg"
                    onClick={scrollToNextSection}
                  >
                    了解更多
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className={styles.heroImage}>
                <div className={styles.floatingCard}>
                  <FaClock className={styles.cardIcon} />
                  <h4>時間記錄</h4>
                  <p>精確記錄每一分鐘</p>
                </div>
                <div className={styles.floatingCard}>
                  <FaCloud className={styles.cardIcon} />
                  <h4>雲端同步</h4>
                  <p>資料永不丟失</p>
                </div>
                <div className={styles.floatingCard}>
                  <FaChartLine className={styles.cardIcon} />
                  <h4>數據分析</h4>
                  <p>洞察時間分配</p>
                </div>
                <div className={styles.floatingCard}>
                  <FaRobot className={styles.cardIcon} />
                  <h4>AI 分析</h4>
                  <p>Gemini 智能洞察</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why We Exist Section */}
      <section className={styles.whyWeExistSection}>
        <Container>
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>為什麼需要 TimeLog？</h2>
            <p className={styles.sectionDescription}>
              填補現有時間管理工具的空白
            </p>
          </div>
          <Row>
            <Col lg={12} className="mx-auto">
              <Card className={styles.problemCard}>
                <Card.Body>
                  <h4 className="text-center mb-4">🔍 現有工具的不足</h4>
                  <Row>
                    <Col md={4} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>📅 Google Calendar</h6>
                        <p className="text-muted small">
                          只能記錄事件，無法精確到秒的時間戳
                        </p>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>⏰ 手機計時器</h6>
                        <p className="text-muted small">
                          功能單一，無法記錄多步驟流程
                          <br />
                          無法一鍵保存紀錄，需要手動複製貼上或截圖
                        </p>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>📝 筆記軟體</h6>
                        <p className="text-muted small">
                          缺乏時間追蹤和統計分析功能
                          <br />
                          Notion 原生的日期屬性並不提供秒級的輸入或顯示
                        </p>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>💼 剪貼到AI</h6>
                        <p className="text-muted small">
                          AI對時間的認知會錯誤，需要手動修正時間格式
                        </p>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>🔍 鏡頭監控分析</h6>
                        <p className="text-muted small">
                          需要昂貴的監控設備，成本高且複雜
                        </p>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>💕 專門社群</h6>
                        <p className="text-muted small">
                          缺乏專業的時間管理工具，無法有效分享時間分配
                        </p>
                      </div>
                    </Col>
                  </Row>
                  <div className="text-center mt-4">
                    <div className={styles.solutionBox}>
                      <h5 className="text-white">✨ TimeLog 的解決方案</h5>
                      <Row className="mt-3">
                        <Col md={3} className="mb-2">
                          <div className="text-white">
                            <strong>⏱️ 精確到秒</strong>
                            <br />
                            <small>
                              解決 Google Calendar 無法精確記錄的問題
                            </small>
                          </div>
                        </Col>
                        <Col md={3} className="mb-2">
                          <div className="text-white">
                            <strong>📋 多步驟管理</strong>
                            <br />
                            <small>解決手機計時器功能單一的問題</small>
                          </div>
                        </Col>
                        <Col md={3} className="mb-2">
                          <div className="text-white">
                            <strong>📊 數據分析</strong>
                            <br />
                            <small>解決筆記軟體缺乏統計功能的問題</small>
                          </div>
                        </Col>
                        <Col md={3} className="mb-2">
                          <div className="text-white">
                            <strong>☁️ 雲端同步</strong>
                            <br />
                            <small>解決 AI 時間認知錯誤的問題</small>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <Container>
          <div className="text-center mb-4">
            <h2 className={styles.sectionTitle}>為什麼選擇我們？</h2>
            <p className={styles.sectionDescription}>
              從免費體驗開始，逐步升級到專業功能
            </p>
          </div>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-3">
                <Card className={`${styles.featureCard} h-100`}>
                  <Card.Body className="text-center">
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <h5 className="mt-2">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                    <small className="text-muted">{feature.details}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricingSection}>
        <Container>
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>選擇適合的方案</h2>
            <p className={styles.sectionDescription}>
              從免費開始，隨時升級到付費版本
            </p>
          </div>
          <Row className="justify-content-center">
            {pricingPlans.map((plan, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card
                  className={`${styles.pricingCard} ${index === 1 ? styles.featured : ''} h-100`}
                >
                  {index === 1 && <div className={styles.badge}>推薦</div>}
                  <Card.Body className="text-center">
                    <h4 className="mb-3">{plan.name}</h4>
                    <div className={styles.price}>
                      <span className={styles.priceAmount}>{plan.price}</span>
                      <span className={styles.pricePeriod}>/{plan.period}</span>
                    </div>
                    <ul className={`${styles.featureList} list-unstyled mt-4`}>
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="mb-2">
                          <FaShieldAlt className="text-success me-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.buttonText === '開始訂閱' ? (
                      <Link
                        href="/subscription"
                        className="text-decoration-none"
                      >
                        <Button
                          variant={plan.buttonVariant}
                          size="lg"
                          className="w-100 mt-4"
                        >
                          {plan.buttonText}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant={plan.buttonVariant}
                        size="lg"
                        className="w-100 mt-4"
                        disabled={plan.disabled}
                      >
                        {plan.buttonText}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <Container>
          <div className="text-center mb-4">
            <h2 className={styles.sectionTitle}>如何使用？</h2>
            <p className={styles.sectionDescription}>
              簡單四步驟，從免費體驗到 AI 智能分析
            </p>
          </div>
          <Row>
            <Col md={3} className="text-center mb-3">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h5>開始記錄</h5>
                <p>無需註冊，直接開始記錄時間</p>
                <FaClock className={styles.stepIcon} />
              </div>
            </Col>
            <Col md={3} className="text-center mb-3">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h5>註冊登入</h5>
                <p>註冊帳號，每小時50次API呼叫</p>
                <FaSync className={styles.stepIcon} />
              </div>
            </Col>
            <Col md={3} className="text-center mb-3">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h5>訂閱付費</h5>
                <p>解鎖多裝置同步與每小時120次API呼叫</p>
                <FaChartLine className={styles.stepIcon} />
              </div>
            </Col>
            <Col md={3} className="text-center mb-3">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>4</div>
                <h5>AI 分析</h5>
                <p>Gemini 2.5 Flash 智能洞察</p>
                <FaRobot className={styles.stepIcon} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Clear Storage Section */}
      <section className={styles.clearStorageSection}>
        <Container>
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>如何清除本地儲存資料？</h2>
            <p className={styles.sectionDescription}>
              當您需要重新開始或清除試用資料時，可以按照以下步驟清除瀏覽器中的本地儲存
            </p>
          </div>
          <Row>
            <Col lg={8} className="mx-auto">
              <Carousel
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
                className={styles.stepsCarousel}
              >
                {clearStorageSteps.map((step, index) => (
                  <Carousel.Item key={index}>
                    <div className={styles.carouselContent}>
                      <div className={styles.stepIndicator}>
                        <span className={styles.stepNumber}>{step.step}</span>
                      </div>
                      <h4 className="mt-4">{step.title}</h4>
                      <p className="text-muted">{step.description}</p>
                      <div className={styles.stepProgress}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${((index + 1) / clearStorageSteps.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className={styles.progressText}>
                          步驟 {index + 1} / {clearStorageSteps.length}
                        </span>
                      </div>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
              <div className="text-center mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={() =>
                    setActiveIndex((activeIndex + 1) % clearStorageSteps.length)
                  }
                >
                  下一步
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <Container>
          <div className="text-center">
            <h2 className={styles.ctaTitle}>準備開始了嗎？</h2>
            <p className={styles.ctaDescription}>
              立即體驗免費版本，感受智能時間管理的魅力
            </p>
            <div className={styles.ctaButtons}>
              <Button
                variant="primary"
                size="lg"
                className="me-3"
                as={Link}
                href="/trial"
              >
                開始免費體驗
              </Button>
              <Button variant="outline-light" size="lg">
                查看詳細功能
              </Button>
            </div>
          </div>
          <NextSectionBtn />
        </Container>
      </section>
    </div>
  )
}
