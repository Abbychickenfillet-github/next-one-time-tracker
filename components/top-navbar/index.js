'use client'

import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { FaBars } from 'react-icons/fa6'
import Link from 'next/link'
import ThemeToggle from '@/components/theme-toggle'
import { useAuth } from '@/hooks/use-auth'

export default function TopNavbar() {
  const { isAuth } = useAuth()
  return (
    <Navbar
      expand="lg"
      className="topnav-bootstrap"
      style={{
        backgroundColor: 'var(--navbar-bg, #333)',
        position: 'relative',
      }}
    >
      <Container fluid>
        {/* 左側導航連結 */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="border-0"
          style={{ color: 'var(--accent-color, #0dcaf0)' }}
        >
          <FaBars />
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto d-flex align-items-center">
            <Nav.Link
              as={Link}
              href="/"
              className="nav-link-custom"
              style={{ color: 'var(--text-primary, #f2f2f2)' }}
            >
              首頁
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/about"
              className="nav-link-custom"
              style={{ color: 'var(--text-primary, #f2f2f2)' }}
            >
              為什麼有這個網頁
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/dashboard"
              className="nav-link-custom"
              style={{ color: 'var(--text-primary, #f2f2f2)' }}
            >
              儀表板
            </Nav.Link>
            {!isAuth && (
              <>
                <Nav.Link
                  as={Link}
                  href="/user/register"
                  className="nav-link-custom"
                  style={{ color: 'var(--text-primary, #f2f2f2)' }}
                >
                  註冊
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href="/user/login"
                  className="nav-link-custom"
                  style={{ color: 'var(--text-primary, #f2f2f2)' }}
                >
                  登入
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>

        {/* 右側主題切換按鈕 */}
        <div className="d-flex align-items-center">
          <ThemeToggle />
        </div>
      </Container>
    </Navbar>
  )
}
