'use client'
import Link from 'next/link'
import { Offcanvas, Nav } from 'react-bootstrap'
// 這邊我要改成頁面介紹的選單
interface OffcanvasNavProps {
  show: boolean
  onHide: () => void
}

export default function OffcanvasNav({ show, onHide }: OffcanvasNavProps) {
  return (
    <Offcanvas show={show} onHide={onHide} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>功能選單</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          <Nav.Link as={Link} href="/" className="active">
            時間記錄
          </Nav.Link>
          <Nav.Link as={Link} href="/timelog/history">
            📊 歷史記錄
          </Nav.Link>
          <Nav.Link as={Link} href="/timelog/ai-analysis">
            🤖 AI 分析
          </Nav.Link>
          <hr className="my-2" />

          <Nav.Link as={Link} href="/blog">
            部落格列表
          </Nav.Link>
          <Nav.Link as={Link} href="/cart">
            購物車範例
          </Nav.Link>
          <Nav.Link as={Link} href="/cart/coupon">
            購物車-折價券
          </Nav.Link>
          <Nav.Link as={Link} href="/ecpay">
            綠界金流
          </Nav.Link>
          <Nav.Link as={Link} href="/fav">
            我的最愛範例
          </Nav.Link>
          <Nav.Link as={Link} href="/line-pay">
            Line Pay金流
          </Nav.Link>
          <Nav.Link as={Link} href="/loader">
            手動載入用
          </Nav.Link>
          <Nav.Link as={Link} href="/loader/placeholder">
            與佔位符配合用
          </Nav.Link>
          <Nav.Link as={Link} href="/product-no-db">
            無連接後端與資料庫
          </Nav.Link>
          <Nav.Link as={Link} href="/product-fetch/list">
            只使用fetch
          </Nav.Link>
          <Nav.Link as={Link} href="/product/list">
            一般列表-useSWR
          </Nav.Link>
          <Nav.Link as={Link} href="/product/list-loadmore">
            載入更多列表-useSWR
          </Nav.Link>
          <Nav.Link as={Link} href="/product/list-is">
            捲動載入列表-useSWR
          </Nav.Link>
          <Nav.Link as={Link} href="/ship">
            運送商店選擇
          </Nav.Link>
          <Nav.Link as={Link} href="/user">
            會員登入/註冊/修改資料/忘記密碼
          </Nav.Link>
          <Nav.Link as={Link} href="/user/google-login">
            Google登入整合
          </Nav.Link>
          <Nav.Link as={Link} href="/user/line-login">
            Line登入整合
          </Nav.Link>
          <Nav.Link as={Link} href="/user/forget-password">
            忘記密碼OTP單頁式
          </Nav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  )
}
