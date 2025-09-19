// app/(api)/api/ai-analysis/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ===== POST 方法：AI 分析用戶時間使用模式 =====
export async function POST(req: Request) {
  try {
    const { userId, timeRange = 30 } = await req.json() // timeRange: 分析最近幾天

    // 查詢用戶的時間記錄
    const logs = await prisma.timeLog.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000) // 最近 N 天
        }
      },
      include: {
        steps: true
      },
      orderBy: { startTime: 'desc' }
    })

    if (logs.length === 0) {
      return NextResponse.json({
        analysis: '尚未有足夠的時間記錄進行分析',
        insights: [],
        recommendations: []
      })
    }

    // 生成 AI 分析
    const analysis = await generateAIAnalysis(logs)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({ error: 'Failed to generate AI analysis' }, { status: 500 })
  }
}

// ===== AI 分析生成函數 =====
async function generateAIAnalysis(logs: any[]) {
  const insights = []
  const recommendations = []
  
  // 1. 時間分布分析
  const timeDistribution = analyzeTimeDistribution(logs)
  insights.push(`時間分布：${timeDistribution}`)
  
  // 2. 活動類型分析
  const activityTypes = analyzeActivityTypes(logs)
  insights.push(`主要活動類型：${activityTypes}`)
  
  // 3. 效率分析
  const efficiency = analyzeEfficiency(logs)
  insights.push(`效率指標：${efficiency}`)
  
  // 4. 工作模式分析
  const workPattern = analyzeWorkPattern(logs)
  insights.push(`工作模式：${workPattern}`)
  
  // 5. 生成建議
  const suggestions = generateRecommendations(logs, insights)
  recommendations.push(...suggestions)
  
  return {
    analysis: insights.join(' | '),
    insights: insights,
    recommendations: recommendations,
    summary: {
      totalActivities: logs.length,
      totalDuration: calculateTotalDuration(logs),
      averageDuration: calculateAverageDuration(logs),
      mostProductiveHour: findMostProductiveHour(logs)
    }
  }
}

// ===== 時間分布分析 =====
function analyzeTimeDistribution(logs: any[]) {
  const morning = logs.filter(log => {
    const hour = new Date(log.startTime).getHours()
    return hour >= 6 && hour < 12
  }).length
  
  const afternoon = logs.filter(log => {
    const hour = new Date(log.startTime).getHours()
    return hour >= 12 && hour < 18
  }).length
  
  const evening = logs.filter(log => {
    const hour = new Date(log.startTime).getHours()
    return hour >= 18 || hour < 6
  }).length
  
  const total = logs.length
  return `早晨 ${Math.round(morning/total*100)}% | 下午 ${Math.round(afternoon/total*100)}% | 晚間 ${Math.round(evening/total*100)}%`
}

// ===== 活動類型分析 =====
function analyzeActivityTypes(logs: any[]) {
  const types: { [key: string]: number } = {}
  logs.forEach(log => {
    const keywords = extractKeywords(log.title)
    keywords.forEach(keyword => {
      types[keyword] = (types[keyword] || 0) + 1
    })
  })
  
  const sortedTypes = Object.entries(types)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([type, count]) => `${type}(${count}次)`)
  
  return sortedTypes.join(', ')
}

// ===== 效率分析 =====
function analyzeEfficiency(logs: any[]) {
  const completedLogs = logs.filter(log => log.endTime)
  const avgDuration = calculateAverageDuration(completedLogs)
  
  if (avgDuration < 30) {
    return '高頻短時專注'
  } else if (avgDuration < 120) {
    return '中等時長平衡'
  } else {
    return '長時間深度工作'
  }
}

// ===== 工作模式分析 =====
function analyzeWorkPattern(logs: any[]) {
  const stepCounts = logs.map(log => log.steps.length)
  const avgSteps = stepCounts.reduce((sum, count) => sum + count, 0) / stepCounts.length
  
  if (avgSteps > 5) {
    return '複雜多階段任務'
  } else if (avgSteps > 2) {
    return '結構化任務'
  } else {
    return '簡單直接任務'
  }
}

// ===== 生成建議 =====
function generateRecommendations(logs: any[], insights: any[]) {
  const recommendations = []
  
  // 基於時間分布建議
  const morningRatio = logs.filter(log => {
    const hour = new Date(log.startTime).getHours()
    return hour >= 6 && hour < 12
  }).length / logs.length
  
  if (morningRatio < 0.3) {
    recommendations.push('建議增加早晨時段的活動安排，早晨通常效率較高')
  }
  
  // 基於活動時長建議
  const avgDuration = calculateAverageDuration(logs)
  if (avgDuration > 180) {
    recommendations.push('建議將長時間任務拆分成多個短時間段，提高專注度')
  } else if (avgDuration < 15) {
    recommendations.push('建議增加單次活動的持續時間，避免過度碎片化')
  }
  
  // 基於步驟複雜度建議
  const avgSteps = logs.reduce((sum, log) => sum + log.steps.length, 0) / logs.length
  if (avgSteps < 2) {
    recommendations.push('建議為複雜任務增加階段性記錄，提高任務管理效率')
  }
  
  return recommendations
}

// ===== 輔助函數 =====
function extractKeywords(title: string) {
  const keywords = []
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('開發') || titleLower.includes('coding') || titleLower.includes('programming')) {
    keywords.push('程式開發')
  }
  if (titleLower.includes('學習') || titleLower.includes('study') || titleLower.includes('reading')) {
    keywords.push('學習')
  }
  if (titleLower.includes('會議') || titleLower.includes('meeting')) {
    keywords.push('會議')
  }
  if (titleLower.includes('運動') || titleLower.includes('exercise') || titleLower.includes('健身')) {
    keywords.push('運動')
  }
  if (titleLower.includes('休息') || titleLower.includes('break') || titleLower.includes('relax')) {
    keywords.push('休息')
  }
  
  return keywords.length > 0 ? keywords : ['其他活動']
}

function calculateTotalDuration(logs: any[]) {
  return logs
    .filter(log => log.endTime)
    .reduce((total, log) => {
      const duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime()
      return total + duration
    }, 0)
}

function calculateAverageDuration(logs: any[]) {
  const completedLogs = logs.filter(log => log.endTime)
  if (completedLogs.length === 0) return 0
  
  const totalDuration = calculateTotalDuration(completedLogs)
  return Math.round(totalDuration / completedLogs.length / (1000 * 60)) // 分鐘
}

function findMostProductiveHour(logs: any[]) {
  const hourCounts: { [key: number]: number } = {}
  logs.forEach(log => {
    const hour = new Date(log.startTime).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  const mostProductiveHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]
  
  return mostProductiveHour ? `${mostProductiveHour[0]}點` : '無資料'
}
