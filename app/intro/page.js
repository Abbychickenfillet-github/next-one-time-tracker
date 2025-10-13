'use client'
import React, { useState } from 'react'
import { Carousel, Card, Button, Container, Row, Col } from 'react-bootstrap'
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

export default function IntroPage() {
  const [activeIndex, setActiveIndex] = useState(0)

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
      details: '免費版僅5筆記錄，付費版無限同步',
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
      name: '免費版',
      price: 'NT$ 0',
      period: '永久免費',
      features: [
        'localStorage 儲存',
        '最多 10 筆記錄',
        '註冊後僅 5 筆雲端記錄',
        '基礎時間記錄',
        '7 天資料保存',
        '⚠️ 無法多裝置同步',
      ],
      buttonText: '立即體驗',
      buttonVariant: 'outline-primary',
    },
    {
      name: '基礎版',
      price: 'NT$ 99',
      period: '每月',
      features: [
        '✅ 解鎖多裝置同步',
        '✅ 無限制記錄數量',
        '✅ 雲端資料庫儲存',
        '✅ 資料永久保存',
        '✅ 基礎統計分析',
        '📱 手機、平板、電腦同步',
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
        '進階數據分析',
        'Gemini 2.5 Flash AI 分析',
        'AI 時間洞察與建議',
        '自定義報告',
        '資料匯出功能',
        '優先客戶支援',
      ],
      buttonText: '升級專業版',
      buttonVariant: 'success',
    },
  ]

  const clearStorageSteps = [
    {
      step: 1,
      title: '打開開發者模式',
      description: 'Windows用戶 按下F12',
    },
    {
      step: 2,
      title: '進入應用程式頁籤',
      description: '按下Application tab',
    },
    {
      step: 3,
      title: '找到Storage',
      description: '點擊「點擊Storage」',
    },
    {
      step: 4,
      title: '選擇Local Storage',
      description: '選擇「Local Storage」',
    },
    {
      step: 5,
      title: '選取要刪除的項目',
      description: '勾選「要刪除的項目」',
    },
    {
      step: 6,
      title: '右鍵確認清除',
      description: '點擊「清除資料」完成',
    },
  ]

  return (
    <div className={styles.introPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  智能時間管理
                  <span className={styles.highlight}> 從免費開始</span>
                </h1>
                <p className={styles.heroDescription}>
                  無需註冊，立即體驗時間記錄功能。免費版僅限5筆雲端記錄，
                  付費版解鎖多裝置同步與無限記錄，更提供 Gemini 2.5 Flash AI
                  分析，讓你的時間管理更智能、更高效。
                </p>
                <div className={styles.heroButtons}>
                  <Button variant="primary" size="lg" className="me-3">
                    立即開始記錄
                  </Button>
                  <Button variant="outline-light" size="lg">
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
            <Col lg={8} className="mx-auto">
              <Card className={styles.problemCard}>
                <Card.Body>
                  <h4 className="text-center mb-4">🔍 現有工具的不足</h4>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>📅 Google Calendar</h6>
                        <p className="text-muted small">
                          只能記錄事件，無法精確到秒的時間戳
                        </p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>⏰ 手機計時器</h6>
                        <p className="text-muted small">
                          功能單一，無法記錄多步驟流程
                        </p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>📝 筆記軟體</h6>
                        <p className="text-muted small">
                          缺乏時間追蹤和統計分析功能
                        </p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className={styles.problemItem}>
                        <h6>💼 專業軟體</h6>
                        <p className="text-muted small">
                          過於複雜，不適合日常簡單任務
                        </p>
                      </div>
                    </Col>
                  </Row>
                  <div className="text-center mt-4">
                    <div className={styles.solutionBox}>
                      <h5 className="text-white">✨ TimeLog 的解決方案</h5>
                      <p className="mb-0">
                        精確到秒 + 多步驟管理 + 數據分析 + 雲端同步
                      </p>
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
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>為什麼選擇我們？</h2>
            <p className={styles.sectionDescription}>
              從免費體驗開始，逐步升級到專業功能
            </p>
          </div>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className={`${styles.featureCard} h-100`}>
                  <Card.Body className="text-center">
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <h5 className="mt-3">{feature.title}</h5>
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
                    <Button
                      variant={plan.buttonVariant}
                      size="lg"
                      className="w-100 mt-4"
                    >
                      {plan.buttonText}
                    </Button>
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
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>如何使用？</h2>
            <p className={styles.sectionDescription}>
              簡單四步驟，從免費體驗到 AI 智能分析
            </p>
          </div>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h5>開始記錄</h5>
                <p>無需註冊，直接開始記錄時間</p>
                <FaClock className={styles.stepIcon} />
              </div>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h5>註冊登入</h5>
                <p>註冊帳號，免費儲存5筆記錄</p>
                <FaSync className={styles.stepIcon} />
              </div>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h5>訂閱付費</h5>
                <p>解鎖多裝置同步與無限記錄</p>
                <FaChartLine className={styles.stepIcon} />
              </div>
            </Col>
            <Col md={3} className="text-center mb-4">
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
            <h2 className={styles.sectionTitle}>試用如何清除本地儲存？</h2>
            <p className={styles.sectionDescription}>
              如果你想清除瀏覽器中的本地資料，請按照以下步驟操作
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
              <Button variant="primary" size="lg" className="me-3">
                開始免費體驗
              </Button>
              <Button variant="outline-light" size="lg">
                查看詳細功能
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
