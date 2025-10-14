import { NextResponse as res } from 'next/server'
import { cookies } from 'next/headers'
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
import { decrypt } from '@/lib/jwt-session'
import prisma from '@/lib/prisma.js'
import { GoogleGenAI } from '@google/genai'
// import { checkRateLimit } from '@/lib/rate-limit.js'

// Gemini AI 客戶端
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// 網站資料和功能說明
const WEBSITE_DATA = {
  name: 'TimeLog & Analysis',
  description: '智能時間記錄與分析平台',
  features: [
    {
      name: '時間記錄',
      description: '記錄日常活動和時間使用',
      features: ['開始/結束時間記錄', '步驟分解', '活動分類', '歷史記錄查看'],
    },
    {
      name: 'AI 分析',
      description: '使用 AI 分析時間使用模式',
      features: ['時間效率分析', '個人化建議', '生產力洞察', '改進建議'],
    },
    {
      name: '儀表板',
      description: '視覺化數據展示',
      features: ['時間統計圖表', '效率趨勢', '活動分布', '個人報告'],
    },
    {
      name: '訂閱服務',
      description: '進階功能和解鎖',
      features: ['無限制記錄', '進階分析', '個人化建議', '優先支援'],
    },
  ],
  plans: [
    {
      name: '免費試用',
      price: '免費',
      features: ['基本時間記錄', '有限 AI 分析', '基礎儀表板'],
      limitations: ['每月 10 次 AI 分析', '基本功能'],
    },
    {
      name: '專業版',
      price: 'NT$ 299/月',
      features: ['無限制時間記錄', '完整 AI 分析', '進階儀表板', '個人化建議'],
      benefits: ['無限制使用', '優先支援', '進階功能'],
    },
    {
      name: '企業版',
      price: 'NT$ 999/月',
      features: ['團隊協作', '批量分析', '客製化報告', 'API 存取'],
      benefits: ['多用戶管理', '企業級支援', '客製化功能'],
    },
  ],
  howToUse: [
    {
      step: 1,
      title: '註冊帳號',
      description: '點擊註冊按鈕，填寫基本資訊完成註冊',
    },
    {
      step: 2,
      title: '開始記錄',
      description: '點擊「開始記錄」按鈕，輸入活動名稱開始計時',
    },
    {
      step: 3,
      title: '添加步驟',
      description: '可以為活動添加子步驟，更詳細地記錄時間使用',
    },
    {
      step: 4,
      title: '結束記錄',
      description: '點擊「結束記錄」按鈕完成時間記錄',
    },
    {
      step: 5,
      title: '查看分析',
      description: '在儀表板查看統計數據，使用 AI 分析獲得洞察',
    },
  ],
}

function buildSystemPrompt(userInfo = null) {
  const basePrompt = `你是 TimeLog & Analysis 網站的 AI 助手。你的任務是幫助用戶了解網站功能、使用方法和方案選擇。

網站基本資訊：
- 名稱：${WEBSITE_DATA.name}
- 描述：${WEBSITE_DATA.description}

主要功能：
${WEBSITE_DATA.features.map((f) => `• ${f.name}: ${f.description}`).join('\n')}

可用方案：
${WEBSITE_DATA.plans.map((p) => `• ${p.name} (${p.price}): ${p.features.join(', ')}`).join('\n')}

使用步驟：
${WEBSITE_DATA.howToUse.map((s) => `${s.step}. ${s.title}: ${s.description}`).join('\n')}`

  if (userInfo) {
    return (
      basePrompt +
      `

當前用戶資訊：
- 姓名：${userInfo.name || '未設定'}
- 信箱：${userInfo.email || '未設定'}
- 用戶 ID：${userInfo.id}

你可以存取用戶的個人資料來提供更個人化的建議。`
    )
  }

  return (
    basePrompt +
    `

注意：當前用戶未登入，只能提供一般性的網站介紹和使用說明。`
  )
}

export async function POST(request) {
  try {
    // 檢查速率限制
    // const rateLimitResult = await checkRateLimit(request, 'ai-agent', 10, 60) // 每分鐘最多 10 次
    // if (!rateLimitResult.success) {
    //   return res.json(
    //     { status: 'error', message: '請求過於頻繁，請稍後再試' },
    //     { status: 429 }
    //   )
    // }

    const body = await request.json()
    const { message, isAuthenticated, userInfo } = body

    if (!message || typeof message !== 'string') {
      return errorResponse(res, new Error('請提供有效的訊息'), 400)
    }

    // 如果用戶已登入，獲取用戶的個人資料
    let userPersonalData = null
    if (isAuthenticated && userInfo?.id) {
      try {
        const token = cookies().get('ACCESS_TOKEN')?.value
        if (token) {
          const decrypted = await decrypt(token)
          const userId = decrypted?.userId

          if (userId === userInfo.id) {
            // 獲取用戶的時間記錄統計
            const timeLogStats = await prisma.timeLog.groupBy({
              by: ['title'],
              where: { userId },
              _count: { id: true },
              _sum: { duration: true },
              orderBy: { _count: { id: 'desc' } },
              take: 10,
            })

            // 獲取最近的時間記錄
            const recentLogs = await prisma.timeLog.findMany({
              where: { userId },
              orderBy: { startTime: 'desc' },
              take: 5,
              select: {
                title: true,
                startTime: true,
                endTime: true,
                duration: true,
              },
            })

            userPersonalData = {
              timeLogStats,
              recentLogs,
              totalLogs: await prisma.timeLog.count({ where: { userId } }),
            }
          }
        }
      } catch (error) {
        if (isDev) console.log('獲取用戶資料失敗:', error.message)
      }
    }

    // 構建完整的提示詞
    const systemPrompt = buildSystemPrompt(userInfo)
    const userPrompt = `用戶問題：${message}

${
  userPersonalData
    ? `
用戶個人資料：
- 總記錄數：${userPersonalData.totalLogs}
- 最近活動：${userPersonalData.recentLogs.map((log) => `${log.title} (${log.duration}分鐘)`).join(', ')}
- 常用活動：${userPersonalData.timeLogStats.map((stat) => `${stat.title} (${stat._count.id}次)`).join(', ')}
`
    : ''
}

請用繁體中文回答，提供實用且友善的建議。如果用戶問到個人化問題但未登入，請引導他們登入以獲得更好的體驗。`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // 禁用思考模式以提高回應速度
        },
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    })

    const aiResponse = response.text

    return successResponse(res, {
      response: aiResponse,
      model: 'gemini-2.5-flash',
      hasPersonalData: !!userPersonalData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI Agent API Error:', error)
    return errorResponse(res, error, 500)
  }
}

export async function GET() {
  return res.json({
    status: 'success',
    message: 'AI Agent API 運行中',
    features: WEBSITE_DATA.features.map((f) => f.name),
    plans: WEBSITE_DATA.plans.map((p) => p.name),
  })
}
