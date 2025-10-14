'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Offcanvas, Form, Button, Spinner, Alert } from 'react-bootstrap'
import { useAuth } from '@/hooks/use-auth'
import { FaRobot, FaPaperPlane, FaUser, FaLock } from 'react-icons/fa'

interface AIAgentSidebarProps {
  show: boolean
  onHide: () => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIAgentSidebar({ show, onHide }: AIAgentSidebarProps) {
  const authContext = useAuth()
  const isAuth = authContext?.isAuth || false
  const user = authContext?.user || null
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自動滾動到最新訊息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化歡迎訊息
  useEffect(() => {
    if (show && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `🤖 你好！我是 TimeLog & Analysis 的 AI 助手！

我可以幫助你：
• 📋 了解網站提供的各種方案和功能
• 📖 指導如何使用時間記錄和分析功能
• 📊 分析你的時間使用模式（需要登入）
• 💡 提供個人化的時間管理建議

${isAuth ? `👤 已登入為：${user?.name || user?.email || '用戶'}` : '🔒 請登入以解鎖個人化功能'}

有什麼問題都可以問我！`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isAuth, user])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          isAuthenticated: isAuth,
          userInfo: isAuth
            ? {
                name: user?.name,
                email: user?.email,
                id: user?.id,
              }
            : null,
        }),
      })

      const data = await response.json()

      if (data.status !== 'success') {
        throw new Error(data.message || 'AI 回應失敗')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      style={{ width: '400px' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="d-flex align-items-center gap-2">
          <FaRobot className="text-primary" />
          AI Agent
          {isAuth ? (
            <FaUser className="text-success" size={14} />
          ) : (
            <FaLock className="text-warning" size={14} />
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-0">
        {/* 聊天訊息區域 */}
        <div
          className="flex-grow-1 p-3"
          style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-3 rounded-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-light text-dark border'
                }`}
                style={{ maxWidth: '80%', whiteSpace: 'pre-wrap' }}
              >
                <div className="fw-bold mb-1">
                  {message.role === 'user' ? '👤 你' : '🤖 AI 助手'}
                </div>
                <div>{message.content}</div>
                <div className="small opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="d-flex justify-content-start mb-3">
              <div className="bg-light p-3 rounded-3 border">
                <div className="d-flex align-items-center gap-2">
                  <Spinner size="sm" />
                  <span>AI 正在思考中...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mb-3">
              <Alert.Heading>錯誤</Alert.Heading>
              {error}
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 輸入區域 */}
        <div className="border-top p-3">
          <div className="d-flex gap-2 mb-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={clearChat}
              disabled={messages.length <= 1}
            >
              清除對話
            </Button>
          </div>

          <div className="d-flex gap-2">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="輸入你的問題..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="align-self-end"
            >
              <FaPaperPlane />
            </Button>
          </div>

          <div className="small text-muted mt-2">
            💡 提示：可以問我關於網站功能、方案選擇、使用教學等問題
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}
