import { NextResponse as res } from 'next/server'
import { cookies } from 'next/headers'
import { successResponse, errorResponse } from '@/lib/utils.js'
import { decrypt } from '@/lib/jwt-session'
import prisma from '@/lib/prisma.js'
// → 假如第一次import prisma, global.prisma 不存在
// → 創建 new PrismaClient()
// → 儲存到 global.prisma
import { GoogleGenAI, Type } from '@google/genai'
import { checkRateLimit } from '@/lib/rate-limit.js'

// gemini-2.5-flash 對新專案已下架（404 NOT_FOUND），改用 gemini-3.5-flash
const GEMINI_MODEL = 'gemini-3.5-flash'

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
// 延遲初始化，避免在模組載入時就驗證 API key
let ai = null
function getAIClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY 未設定')
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  }
  return ai
}

function buildPrompt(activities, customPrompt = null) {
  const activitiesJson = JSON.stringify(activities)

  let basePrompt =
    'You are a time management and productivity analyst. Given a list of user activities, analyze their time usage patterns and provide insights.'

  if (customPrompt) {
    // 如果用戶提供了自定義提示詞，使用它作為主要分析指令
    basePrompt = customPrompt
  } else {
    // 預設分析提示詞
    basePrompt +=
      ' Focus on time efficiency, productivity patterns, and provide actionable recommendations for improvement.'
  }

  // 不論有沒有自訂提示詞都附上輸出格式，前端依這三個欄位排版
  const formatRule =
    '\n\n請用繁體中文回答，只輸出 JSON，欄位如下：' +
    'timeDeltaDays（數字，活動時間跨度的天數，無法判斷填 null）、' +
    'keyFactors（字串陣列，3 到 5 個關鍵因素，每項一句話）、' +
    'summary（字串，2 到 3 句總結與建議）。'

  return basePrompt + formatRule + '\n\nActivities JSON: ' + activitiesJson
}

// 讓 Gemini 以 schema 強制輸出結構化 JSON，避免回傳 Markdown 文字
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    timeDeltaDays: { type: Type.NUMBER, nullable: true },
    keyFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
  },
  required: ['timeDeltaDays', 'keyFactors', 'summary'],
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))

    // If activities not provided, load current user's data
    let activities = body?.activities
    if (!Array.isArray(activities)) {
      const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
      const session = await decrypt(cookie)
      const userId = session?.payload?.userId

      if (!userId) {
        throw new Error('未登入或授權失敗，無法讀取使用者資料')
      }

      // ========================================
      // 🚦 檢查速率限制
      // ========================================
      // 先查詢用戶等級
      const user = await prisma.user.findUnique({
        where: { user_id: userId }, // UUID 已經是字串，不需要轉換
        select: { level: true },
      })

      if (!user) {
        throw new Error('用戶不存在')
      }

      // 檢查 API 呼叫速率限制
      const rateLimitResult = checkRateLimit(userId, user.level, 'api')

      if (!rateLimitResult.allowed) {
        const resetTime = new Date(rateLimitResult.resetTime)
        console.log('🚦 AI 分析 API 速率限制觸發:', {
          userId,
          level: user.level,
          limit: rateLimitResult.limit,
          resetTime: resetTime.toISOString(),
        })

        return res.json(
          {
            status: 'error',
            message: `AI 分析請求過於頻繁，請在 ${resetTime.toLocaleString()} 後再試`,
            resetTime: resetTime.toISOString(),
            limit: rateLimitResult.limit,
            errorType: 'rate_limit', // 標記為速率限制錯誤
          },
          { status: 429 }
        )
      }

      console.log('✅ AI 分析 API 速率限制檢查通過:', {
        userId,
        level: user.level,
        remaining: rateLimitResult.remaining,
        limit: rateLimitResult.limit,
      })

      // Load user's timelogs and steps
      const timeLogs = await prisma.timeLog.findMany({
        where: { userId },
        include: { steps: true },
        orderBy: { startTime: 'asc' },
      })

      // Normalize into generic activities for the prompt
      activities = []
      for (const log of timeLogs) {
        activities.push({
          id: log.id,
          type: log.title?.includes('燙直') ? 'hair_straightening' : 'timelog',
          label: log.title,
          timestamp: log.startTime,
          endTime: log.endTime,
        })
        for (const s of log.steps) {
          activities.push({
            id: `step-${s.id}`,
            type: s.title?.includes('燙直')
              ? 'hair_straightening_step'
              : 'step',
            label: s.title,
            timestamp: s.startTime,
            endTime: s.endTime,
            timeLogId: s.timeLogId,
          })
        }
      }
    }

    // 檢查 API key 並初始化 AI 客戶端
    let aiClient
    try {
      aiClient = getAIClient()
    } catch (error) {
      console.error('❌ GEMINI_API_KEY 未設定或無效')
      return errorResponse(
        res,
        new Error('AI 服務未正確配置，請聯繫管理員'),
        500
      )
    }

    const customPrompt = body?.customPrompt
    const prompt = buildPrompt(activities, customPrompt)

    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    })

    const text = response.text

    // Try parse JSON from the model
    // 初始化 parsed 為 null，用來儲存解析後的 JSON 物件
    // 如果 AI 回傳的不是標準 JSON，parsed 會保持 null
    let parsed = null
    try {
      // 嘗試將 AI 回傳的文字解析為 JSON 物件
      parsed = JSON.parse(text)
    } catch (e) {
      // 如果直接解析失敗，嘗試從文字中提取 JSON 片段
      // 因為 AI 有時會回傳包含 markdown 程式碼區塊的內容

      // 使用正則表達式尋找 JSON 物件格式 { ... }
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          // 嘗試解析找到的 JSON 片段
          parsed = JSON.parse(match[0])
        } catch (e2) {
          // 還是解析失敗就保留 parsed 原狀，不對外顯示內部錯誤資訊
        }
      }
    }

    return successResponse(res, {
      model: GEMINI_MODEL,
      raw: text,
      result: parsed,
    })
  } catch (error) {
    console.error('AI Analyze Activities API Error:', error)

    // @google/genai 拋出的 ApiError 把 HTTP 狀態放在 error.status，
    // 錯誤本文是 JSON 字串放在 error.message，沒有 error.error 這個屬性
    const httpStatus = error?.status ?? error?.error?.code
    const apiMessage = String(error?.message ?? error?.error?.message ?? '')

    // 處理 API key 相關錯誤
    // 注意：apiMessage 內含完整金鑰字串，只能記在伺服器 log，不可回傳給瀏覽器
    if (httpStatus === 403 && apiMessage.includes('leaked')) {
      console.error('❌ GEMINI_API_KEY 已被標記為洩露，需要重新生成')
      return errorResponse(
        res,
        new Error('AI 服務暫時無法使用，請聯繫管理員更新 API 金鑰'),
        500
      )
    }

    if (
      httpStatus === 403 ||
      error?.error?.status === 'PERMISSION_DENIED' ||
      apiMessage.includes('PERMISSION_DENIED')
    ) {
      console.error('❌ GEMINI_API_KEY 權限被拒絕')
      return errorResponse(
        res,
        new Error('AI 服務權限錯誤，請聯繫管理員檢查 API 金鑰設定'),
        500
      )
    }

    return errorResponse(res, error, 200)
  }
}

export async function GET() {
  try {
    // Small health check
    return res.json({
      status: 'success',
      data: { ok: true, sdk: '@google/genai' },
    })
  } catch (error) {
    return errorResponse(res, error, 200)
  }
}
