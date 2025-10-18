'use client'
import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import NextSectionBtn from '@/components/next-section-btn/next-section-btn'

export default function TutorialPage() {
  const [windowInfo, setWindowInfo] = useState({})
  const [positionDemo, setPositionDemo] = useState('static')

  useEffect(() => {
    const updateWindowInfo = () => {
      setWindowInfo({
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        outerHeight: window.outerHeight,
        outerWidth: window.outerWidth,
        screenHeight: screen.height,
        screenWidth: screen.width,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
      })
    }

    updateWindowInfo()
    window.addEventListener('resize', updateWindowInfo)
    window.addEventListener('scroll', updateWindowInfo)

    return () => {
      window.removeEventListener('resize', updateWindowInfo)
      window.removeEventListener('scroll', updateWindowInfo)
    }
  }, [])

  const scrollToNextSection = () => {
    const viewportHeight = window.innerHeight
    const navbarHeight = 59
    const scrollDistance = viewportHeight - navbarHeight

    window.scrollBy({
      top: scrollDistance,
      behavior: 'smooth',
    })
  }

  return (
    <div style={{ minHeight: '200vh', padding: '20px 0' }}>
      <Container>
        {/* Section 1: Window.innerHeight 教學 */}
        <section style={{ minHeight: '100vh', padding: '50px 0' }}>
          <Row className="align-items-center min-vh-100">
            <Col lg={12}>
              <Card className="mb-4">
                <Card.Header>
                  <h2>📏 Window.innerHeight 相關概念教學</h2>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <h5>🔍 即時視窗資訊</h5>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>window.innerHeight:</strong>{' '}
                          {windowInfo.innerHeight}px
                        </p>
                        <p>
                          <strong>window.innerWidth:</strong>{' '}
                          {windowInfo.innerWidth}px
                        </p>
                        <p>
                          <strong>window.outerHeight:</strong>{' '}
                          {windowInfo.outerHeight}px
                        </p>
                        <p>
                          <strong>window.outerWidth:</strong>{' '}
                          {windowInfo.outerWidth}px
                        </p>
                      </Col>
                      <Col md={6}>
                        <p>
                          <strong>screen.height:</strong>{' '}
                          {windowInfo.screenHeight}px
                        </p>
                        <p>
                          <strong>screen.width:</strong>{' '}
                          {windowInfo.screenWidth}px
                        </p>
                        <p>
                          <strong>scrollY:</strong> {windowInfo.scrollY}px
                        </p>
                        <p>
                          <strong>scrollX:</strong> {windowInfo.scrollX}px
                        </p>
                      </Col>
                    </Row>
                  </Alert>

                  <div className="mb-4">
                    <h4>📚 各種 Height 的差異</h4>
                    <Row>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>window.innerHeight</code>
                          </Card.Header>
                          <Card.Body>
                            <p>
                              瀏覽器視窗內部的高度（不包含工具列、狀態列等）
                            </p>
                            <p className="text-primary">
                              用途：計算可視區域高度
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>window.outerHeight</code>
                          </Card.Header>
                          <Card.Body>
                            <p>整個瀏覽器視窗的高度（包含工具列、狀態列等）</p>
                            <p className="text-primary">
                              用途：計算完整視窗大小
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>screen.height</code>
                          </Card.Header>
                          <Card.Body>
                            <p>整個螢幕的高度（包含工作列等）</p>
                            <p className="text-primary">用途：計算螢幕解析度</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>document.body.scrollHeight</code>
                          </Card.Header>
                          <Card.Body>
                            <p>整個頁面的總高度（包含滾動區域）</p>
                            <p className="text-primary">用途：計算頁面總長度</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>

                  <div className="mb-4">
                    <h4>🖼️ Frameset 相關概念</h4>
                    <Alert variant="warning">
                      <p>
                        <strong>注意：</strong>現代網頁開發中很少使用
                        frameset，但了解這些概念有助於理解視窗層級
                      </p>
                    </Alert>
                    <Row>
                      <Col md={4}>
                        <Card>
                          <Card.Header>
                            <code>self.innerHeight</code>
                          </Card.Header>
                          <Card.Body>
                            <p>
                              等同於 <code>window.innerHeight</code>
                            </p>
                            <p>返回當前 frame 的視口高度</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card>
                          <Card.Header>
                            <code>parent.innerHeight</code>
                          </Card.Header>
                          <Card.Body>
                            <p>返回上一級 frameset 的視口高度</p>
                            <p>
                              如果沒有父框架，等同於{' '}
                              <code>window.innerHeight</code>
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card>
                          <Card.Header>
                            <code>top.innerHeight</code>
                          </Card.Header>
                          <Card.Body>
                            <p>返回最外部 frameset 的視口高度</p>
                            <p>
                              在單一視窗中等同於 <code>window.innerHeight</code>
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={scrollToNextSection}
                    >
                      滾動到下一個 Section
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Section 2: Position 屬性教學 */}
        <section style={{ minHeight: '100vh', padding: '50px 0' }}>
          <Row className="align-items-center min-vh-100">
            <Col lg={12}>
              <Card className="mb-4">
                <Card.Header>
                  <h2>📍 CSS Position 屬性教學</h2>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    <h4>🎯 Position 屬性對比</h4>
                    <Row>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>position: static</code> (預設)
                          </Card.Header>
                          <Card.Body>
                            <p>元素按照正常的文檔流排列</p>
                            <p className="text-primary">
                              特點：不受 top, right, bottom, left 影響
                            </p>
                            <div
                              className="demo-box"
                              style={{
                                position: 'static',
                                background: '#e3f2fd',
                                padding: '10px',
                                margin: '5px',
                                border: '2px solid #2196f3',
                              }}
                            >
                              我是 static 元素
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>position: relative</code>
                          </Card.Header>
                          <Card.Body>
                            <p>相對於自己原本位置的偏移</p>
                            <p className="text-primary">
                              特點：保留原本空間，不影響其他元素
                            </p>
                            <div
                              className="demo-box"
                              style={{
                                position: 'relative',
                                top: '20px',
                                left: '20px',
                                background: '#f3e5f5',
                                padding: '10px',
                                margin: '5px',
                                border: '2px solid #9c27b0',
                              }}
                            >
                              我是 relative 元素
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>position: absolute</code>
                          </Card.Header>
                          <Card.Body>
                            <p>相對於最近的非 static 父元素定位</p>
                            <p className="text-primary">
                              特點：脫離文檔流，不佔用空間
                            </p>
                            <div
                              style={{
                                position: 'relative',
                                height: '80px',
                                background: '#fff3e0',
                                border: '2px dashed #ff9800',
                              }}
                            >
                              <div
                                className="demo-box"
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  background: '#e8f5e8',
                                  padding: '10px',
                                  border: '2px solid #4caf50',
                                }}
                              >
                                我是 absolute 元素
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>
                            <code>position: fixed</code>
                          </Card.Header>
                          <Card.Body>
                            <p>相對於瀏覽器視窗定位</p>
                            <p className="text-primary">
                              特點：滾動時保持固定位置
                            </p>
                            <div
                              className="demo-box"
                              style={{
                                position: 'fixed',
                                bottom: '20px',
                                right: '20px',
                                background: '#ffebee',
                                padding: '10px',
                                border: '2px solid #f44336',
                                zIndex: 1000,
                              }}
                            >
                              我是 fixed 元素 (右下角)
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>

                  <div className="mb-4">
                    <h4>📊 文檔流關係</h4>
                    <Alert variant="info">
                      <h5>文檔流 (Document Flow) 概念：</h5>
                      <ul>
                        <li>
                          <strong>static & relative:</strong>{' '}
                          保持在文檔流中，會影響其他元素的位置
                        </li>
                        <li>
                          <strong>absolute & fixed:</strong>{' '}
                          脫離文檔流，不會影響其他元素的位置
                        </li>
                        <li>
                          <strong>relative:</strong>{' '}
                          雖然可以偏移，但仍保留原本的空間
                        </li>
                        <li>
                          <strong>absolute:</strong>{' '}
                          完全脫離文檔流，不佔用任何空間
                        </li>
                      </ul>
                    </Alert>
                  </div>

                  <div className="mb-4">
                    <h4>🎮 互動演示</h4>
                    <div className="mb-3">
                      <Button
                        variant={
                          positionDemo === 'static'
                            ? 'primary'
                            : 'outline-primary'
                        }
                        onClick={() => setPositionDemo('static')}
                        className="me-2"
                      >
                        Static
                      </Button>
                      <Button
                        variant={
                          positionDemo === 'relative'
                            ? 'primary'
                            : 'outline-primary'
                        }
                        onClick={() => setPositionDemo('relative')}
                        className="me-2"
                      >
                        Relative
                      </Button>
                      <Button
                        variant={
                          positionDemo === 'absolute'
                            ? 'primary'
                            : 'outline-primary'
                        }
                        onClick={() => setPositionDemo('absolute')}
                        className="me-2"
                      >
                        Absolute
                      </Button>
                      <Button
                        variant={
                          positionDemo === 'fixed'
                            ? 'primary'
                            : 'outline-primary'
                        }
                        onClick={() => setPositionDemo('fixed')}
                      >
                        Fixed
                      </Button>
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        height: '200px',
                        background: '#f5f5f5',
                        border: '2px solid #ccc',
                        padding: '20px',
                      }}
                    >
                      <div
                        style={{
                          position: positionDemo,
                          top: positionDemo === 'static' ? 'auto' : '20px',
                          left: positionDemo === 'static' ? 'auto' : '20px',
                          background: '#2196f3',
                          color: 'white',
                          padding: '10px',
                          borderRadius: '5px',
                        }}
                      >
                        當前 Position: {positionDemo}
                      </div>
                      <p className="mt-3">
                        這個容器用來演示不同 position 屬性的效果。
                        嘗試切換不同的 position 值來觀察差異。
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={scrollToNextSection}
                    >
                      滾動到下一個 Section
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Section 3: 實際應用範例 */}
        <section style={{ minHeight: '100vh', padding: '50px 0' }}>
          <Row className="align-items-center min-vh-100">
            <Col lg={12}>
              <Card className="mb-4">
                <Card.Header>
                  <h2>🚀 實際應用範例</h2>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    <h4>💡 滾動按鈕的設計思路</h4>
                    <Alert variant="success">
                      <h5>為什麼使用 window.scrollBy 而不是找 main 元素？</h5>
                      <ul>
                        <li>
                          <strong>簡化邏輯：</strong>
                          不需要查找特定元素，直接操作視窗滾動
                        </li>
                        <li>
                          <strong>通用性：</strong>
                          在任何頁面都能正常工作，不依賴特定結構
                        </li>
                        <li>
                          <strong>性能：</strong>避免 DOM 查詢，直接使用瀏覽器
                          API
                        </li>
                        <li>
                          <strong>可靠性：</strong>不依賴頁面結構變化，更穩定
                        </li>
                      </ul>
                    </Alert>
                  </div>

                  <div className="mb-4">
                    <h4>📐 滾動距離計算</h4>
                    <Row>
                      <Col md={6}>
                        <Card>
                          <Card.Header>
                            <code>calc(100vh - 59px)</code>
                          </Card.Header>
                          <Card.Body>
                            <p>
                              <strong>100vh:</strong> 整個視窗高度
                            </p>
                            <p>
                              <strong>59px:</strong> Navbar 高度
                            </p>
                            <p>
                              <strong>結果:</strong> 可視區域高度
                            </p>
                            <p className="text-primary">
                              這樣確保每次滾動都剛好顯示一個 section
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card>
                          <Card.Header>
                            <code>window.scrollBy()</code>
                          </Card.Header>
                          <Card.Body>
                            <p>
                              <strong>相對滾動：</strong> 基於當前位置滾動
                            </p>
                            <p>
                              <strong>平滑動畫：</strong> behavior:
                              &apos;smooth&apos;
                            </p>
                            <p>
                              <strong>跨瀏覽器：</strong> 支援所有現代瀏覽器
                            </p>
                            <p className="text-primary">
                              比 scrollTo 更適合按鈕點擊場景
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>

                  <div className="mb-4">
                    <h4>🎨 CSS 檔案分離的好處</h4>
                    <Alert variant="info">
                      <h5>為什麼要將樣式分離到獨立的 SCSS 檔案？</h5>
                      <ul>
                        <li>
                          <strong>模組化：</strong>每個組件有自己的樣式檔案
                        </li>
                        <li>
                          <strong>維護性：</strong>樣式修改不會影響其他組件
                        </li>
                        <li>
                          <strong>重用性：</strong>可以在多個地方引入使用
                        </li>
                        <li>
                          <strong>性能：</strong>可以按需載入樣式
                        </li>
                        <li>
                          <strong>團隊協作：</strong>減少樣式衝突
                        </li>
                      </ul>
                    </Alert>
                  </div>

                  <div className="text-center">
                    <Alert variant="warning">
                      <h5>🎯 總結</h5>
                      <p>
                        這個滾動按鈕設計體現了現代前端開發的最佳實踐：
                        簡化邏輯、提高通用性、模組化設計、響應式適配。
                      </p>
                    </Alert>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
      </Container>

      {/* 右下角滾動按鈕 */}
      <NextSectionBtn />
    </div>
  )
}
