import { NextResponse as res } from 'next/server'
import { cookies } from 'next/headers'
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
import { decrypt } from '@/lib/jwt-session'
import prisma from '@/lib/prisma.js'
import { GoogleGenAI } from '@google/genai'

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

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

  return basePrompt + '\n\nActivities JSON: ' + activitiesJson
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

    const customPrompt = body?.customPrompt
    const prompt = buildPrompt(activities, customPrompt)

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
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
      if (isDev)
        console.log('JSON parse failed, try extract substring:', e?.message)

      // 使用正則表達式尋找 JSON 物件格式 { ... }
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          // 嘗試解析找到的 JSON 片段
          parsed = JSON.parse(match[0])
        } catch (e2) {
          // 如果還是解析失敗，在開發環境顯示錯誤訊息
          // isDev 檢查確保生產環境不會顯示內部錯誤資訊
          if (isDev) console.log('Substring JSON parse failed:', e2?.message)
        }
      }
    }

    return successResponse(res, {
      model: 'gemini-2.5-flash',
      raw: text,
      result: parsed,
    })
  } catch (error) {
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
