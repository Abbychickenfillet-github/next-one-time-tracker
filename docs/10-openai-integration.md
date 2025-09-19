# OpenAI API 整合指南

## 概述
整合 OpenAI GPT-4 API 為時間戳記專案提供智能分析功能，包括時間使用模式分析、效率建議、個人化洞察等。

## 優勢
- ✅ 強大的語言理解能力
- ✅ 專業的時間管理分析
- ✅ 個人化建議生成
- ✅ 成本合理（每 1,000 tokens 約 $0.03）
- ✅ 與現有 AI 分析架構整合

## 實作步驟

### 1. OpenAI API 設定
```bash
# 註冊 OpenAI 帳號
# 取得 API Key
# 設定使用額度限制
```

### 2. 環境變數設定
```bash
# .env.local
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=1000
```

### 3. OpenAI 服務層
```javascript
// services/openai.service.js
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const generateTimeAnalysis = async (timeLogs) => {
  try {
    // 準備分析資料
    const analysisData = prepareAnalysisData(timeLogs)
    
    const prompt = `
你是一個專業的時間管理顧問。請分析以下用戶的時間使用數據，並提供專業的洞察和建議：

時間記錄數據：
${JSON.stringify(analysisData, null, 2)}

請提供：
1. 時間使用模式分析
2. 效率評估
3. 個人化建議
4. 改進方向

請用繁體中文回答，並保持專業且實用的語調。
`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '你是一個專業的時間管理顧問，擅長分析時間使用模式並提供實用的改進建議。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
      temperature: 0.7
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error('AI 分析生成失敗')
  }
}

// 準備分析資料
function prepareAnalysisData(timeLogs) {
  const analysis = {
    totalActivities: timeLogs.length,
    totalDuration: 0,
    activitiesByHour: {},
    activitiesByDay: {},
    activityTypes: {},
    averageDuration: 0,
    longestActivity: null,
    shortestActivity: null
  }

  timeLogs.forEach(log => {
    const duration = log.endTime ? 
      (new Date(log.endTime) - new Date(log.startTime)) / (1000 * 60) : 0
    
    analysis.totalDuration += duration
    
    // 按小時統計
    const hour = new Date(log.startTime).getHours()
    analysis.activitiesByHour[hour] = (analysis.activitiesByHour[hour] || 0) + 1
    
    // 按日期統計
    const day = new Date(log.startTime).toDateString()
    analysis.activitiesByDay[day] = (analysis.activitiesByDay[day] || 0) + 1
    
    // 活動類型統計
    const type = categorizeActivity(log.title)
    analysis.activityTypes[type] = (analysis.activityTypes[type] || 0) + 1
    
    // 最長/最短活動
    if (!analysis.longestActivity || duration > analysis.longestActivity.duration) {
      analysis.longestActivity = { title: log.title, duration }
    }
    if (!analysis.shortestActivity || duration < analysis.shortestActivity.duration) {
      analysis.shortestActivity = { title: log.title, duration }
    }
  })

  analysis.averageDuration = analysis.totalDuration / timeLogs.length
  
  return analysis
}

// 活動分類
function categorizeActivity(title) {
  const keywords = {
    '工作': ['工作', '專案', '開發', '程式', '會議'],
    '學習': ['學習', '讀書', '課程', '研究'],
    '運動': ['運動', '健身', '跑步', '游泳'],
    '娛樂': ['娛樂', '遊戲', '電影', '音樂'],
    '家務': ['家務', '清潔', '煮飯', '購物']
  }

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => title.includes(word))) {
      return category
    }
  }
  
  return '其他'
}
```

### 4. API 路由整合
```javascript
// app/(api)/api/ai-analysis/openai/route.js
import { NextResponse } from 'next/server'
import { generateTimeAnalysis } from '@/services/openai.service'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const { userId, timeRange = 30 } = await req.json()

    // 查詢用戶時間記錄
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        steps: true
      },
      orderBy: { startTime: 'desc' }
    })

    if (timeLogs.length === 0) {
      return NextResponse.json({
        analysis: '尚未有足夠的時間記錄進行分析',
        insights: [],
        recommendations: []
      })
    }

    // 生成 AI 分析
    const aiAnalysis = await generateTimeAnalysis(timeLogs)

    // 儲存分析結果
    await prisma.timeLog.updateMany({
      where: { userId: userId },
      data: { 
        aiAnalysis: aiAnalysis,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      analysis: aiAnalysis,
      summary: {
        totalActivities: timeLogs.length,
        timeRange: timeRange,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('OpenAI Analysis Error:', error)
    return NextResponse.json({ 
      error: 'AI 分析生成失敗',
      details: error.message 
    }, { status: 500 })
  }
}
```

### 5. 前端整合
```javascript
// components/AIAnalysisCard.jsx
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function AIAnalysisCard() {
  const auth = useAuth()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateAnalysis = async () => {
    if (!auth?.user?.id) {
      alert('請先登入以使用 AI 分析功能')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/ai-analysis/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.user.id,
          timeRange: 30
        })
      })

      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('AI 分析失敗:', error)
      alert('AI 分析失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>🤖 AI 時間分析</h5>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">分析中...</span>
            </div>
            <p>AI 正在分析您的時間使用模式...</p>
          </div>
        ) : analysis ? (
          <div>
            <h6>分析結果：</h6>
            <div className="alert alert-info">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {analysis.analysis}
              </pre>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                分析時間範圍：{analysis.summary.timeRange} 天 | 
                總活動數：{analysis.summary.totalActivities} 個
              </small>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>點擊下方按鈕生成 AI 分析</p>
            <button 
              className="btn btn-primary"
              onClick={generateAnalysis}
            >
              🚀 生成 AI 分析
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

## 成本分析
- **GPT-4 Turbo**：每 1,000 tokens 約 $0.03
- **一般分析**：約 500-800 tokens
- **成本估算**：每次分析約 $0.015-0.024
- **月成本**：100 次分析約 $1.5-2.4

## 使用建議
1. **設定使用限制**：避免過度使用
2. **快取結果**：相同資料不重複分析
3. **批次處理**：多個用戶一起分析
4. **錯誤處理**：API 失敗時的備用方案

## 進階功能
- **個人化建議**：基於用戶歷史數據
- **目標設定**：AI 協助設定時間管理目標
- **習慣追蹤**：分析並改善時間使用習慣
- **效率優化**：提供具體的效率提升建議
