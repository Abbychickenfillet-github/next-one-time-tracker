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
          <Nav.Link as={Link} href="/ecpay">
            綠界金流
          </Nav.Link>
          <Nav.Link as={Link} href="/line-pay">
            Line Pay金流
          </Nav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  )
}
