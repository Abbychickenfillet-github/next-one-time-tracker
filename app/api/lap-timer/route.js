import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'

// GET - 獲取用戶的分圈計時器資料
export async function GET() {
  try {
    // 從 Cookie 中取得 JWT Token
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    if (!cookie) {
      return NextResponse.json(
        { status: 'error', message: '未授權訪問' },
        { status: 401 }
      )
    }

    // 解密 JWT Token 取得用戶資訊
    const session = await decrypt(cookie)
    if (!session?.payload?.userId) {
      return NextResponse.json(
        { status: 'error', message: '未授權訪問' },
        { status: 401 }
      )
    }

    const userId = session.payload.userId

    // 查詢用戶最新的分圈計時器活動（未結束的）
    const lapTimerData = await prisma.timeLog.findFirst({
      where: {
        userId: userId,
        title: {
          startsWith: '[LapTimer]', // 使用特殊標記來識別分圈計時器活動
        },
        endTime: null, // 只查詢未結束的活動
      },
      include: {
        steps: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    if (!lapTimerData) {
      return NextResponse.json({
        status: 'success',
        data: null,
        message: '尚未有分圈計時器資料',
      })
    }

    // 解析分圈計時器資料
    const parsedData = {
      id: lapTimerData.id,
      title: lapTimerData.title.replace('[LapTimer] ', ''), // 移除標記
      desc: lapTimerData.memo || '',
      startTime: lapTimerData.startTime,
      endTime: lapTimerData.endTime,
      laps: lapTimerData.steps.map((step, index) => ({
        id: step.id,
        lapNumber: index + 1,
        startTime: step.startTime,
        endTime: step.endTime,
        duration: step.endTime
          ? step.endTime.getTime() - step.startTime.getTime()
          : 0,
        description: step.title,
        timestamp: step.startTime,
      })),
      pausePeriods: [], // 暫停功能可以後續實現
      isRunning: lapTimerData.endTime === null,
      isPaused: false, // 暫停功能可以後續實現
      totalElapsedTime: lapTimerData.endTime
        ? lapTimerData.endTime.getTime() - lapTimerData.startTime.getTime()
        : new Date().getTime() - lapTimerData.startTime.getTime(),
      netElapsedTime: 0, // 可以後續實現
    }

    return NextResponse.json({
      status: 'success',
      data: parsedData,
      message: '分圈計時器資料載入成功',
    })
  } catch (error) {
    console.error('獲取分圈計時器資料失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '獲取分圈計時器資料失敗' },
      { status: 500 }
    )
  }
}

// POST - 保存或更新用戶的分圈計時器資料
export async function POST(request) {
  try {
    // 從 Cookie 中取得 JWT Token
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    if (!cookie) {
      return NextResponse.json(
        { status: 'error', message: '未授權訪問' },
        { status: 401 }
      )
    }

    // 解密 JWT Token 取得用戶資訊
    const session = await decrypt(cookie)
    if (!session?.payload?.userId) {
      return NextResponse.json(
        { status: 'error', message: '未授權訪問' },
        { status: 401 }
      )
    }

    const userId = session.payload.userId

    const body = await request.json()
    const {
      title,
      desc,
      startTime,
      endTime,
      laps,
      pausePeriods,
      // eslint-disable-next-line no-unused-vars
      isRunning,
      // eslint-disable-next-line no-unused-vars
      isPaused,
      totalElapsedTime,
      netElapsedTime,
    } = body

    // 檢查是否已存在未結束的分圈計時器記錄
    const existingData = await prisma.timeLog.findFirst({
      where: {
        userId: userId,
        title: {
          startsWith: '[LapTimer]',
        },
        endTime: null,
      },
      include: {
        steps: true,
      },
    })

    const lapTimerTitle = `[LapTimer] ${title || '分圈計時器'}`

    if (existingData) {
      // 更新現有記錄
      const updatedTimeLog = await prisma.timeLog.update({
        where: {
          id: existingData.id,
        },
        data: {
          title: lapTimerTitle,
          memo: desc || '',
          startTime: startTime ? new Date(startTime) : existingData.startTime,
          endTime: endTime ? new Date(endTime) : null,
        },
      })

      // 更新分圈記錄
      if (laps && laps.length > 0) {
        // 刪除舊的分圈記錄
        await prisma.step.deleteMany({
          where: {
            timeLogId: existingData.id,
          },
        })

        // 創建新的分圈記錄
        await prisma.step.createMany({
          data: laps.map((lap) => ({
            timeLogId: existingData.id,
            title: lap.description || `分圈 ${lap.lapNumber}`,
            description: lap.description,
            startTime: new Date(lap.startTime),
            endTime: lap.endTime ? new Date(lap.endTime) : null,
          })),
        })
      }

      return NextResponse.json({
        status: 'success',
        data: {
          id: updatedTimeLog.id,
          title: updatedTimeLog.title.replace('[LapTimer] ', ''),
          desc: updatedTimeLog.memo,
          startTime: updatedTimeLog.startTime,
          endTime: updatedTimeLog.endTime,
          laps: laps || [],
          pausePeriods: pausePeriods || [],
          isRunning: updatedTimeLog.endTime === null,
          isPaused: false,
          totalElapsedTime: totalElapsedTime || 0,
          netElapsedTime: netElapsedTime || 0,
        },
        message: '分圈計時器資料更新成功',
      })
    } else {
      // 創建新記錄
      const newTimeLog = await prisma.timeLog.create({
        data: {
          title: lapTimerTitle,
          memo: desc || '',
          startTime: startTime ? new Date(startTime) : new Date(),
          endTime: endTime ? new Date(endTime) : null,
          userId: userId,
        },
      })

      // 創建分圈記錄
      if (laps && laps.length > 0) {
        await prisma.step.createMany({
          data: laps.map((lap) => ({
            timeLogId: newTimeLog.id,
            title: lap.description || `分圈 ${lap.lapNumber}`,
            description: lap.description,
            startTime: new Date(lap.startTime),
            endTime: lap.endTime ? new Date(lap.endTime) : null,
          })),
        })
      }

      return NextResponse.json({
        status: 'success',
        data: {
          id: newTimeLog.id,
          title: newTimeLog.title.replace('[LapTimer] ', ''),
          desc: newTimeLog.memo,
          startTime: newTimeLog.startTime,
          endTime: newTimeLog.endTime,
          laps: laps || [],
          pausePeriods: pausePeriods || [],
          isRunning: newTimeLog.endTime === null,
          isPaused: false,
          totalElapsedTime: totalElapsedTime || 0,
          netElapsedTime: netElapsedTime || 0,
        },
        message: '分圈計時器資料創建成功',
      })
    }
  } catch (error) {
    console.error('保存分圈計時器資料失敗:', error)
    console.error('錯誤詳情:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || '保存分圈計時器資料失敗',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

// DELETE - 刪除用戶的分圈計時器資料
export async function DELETE() {
  try {
    // 從 Cookie 中取得 JWT Token
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    if (!cookie) {
      return NextResponse.json(
        { status: 'error', message: '未授權訪問' },
        { status: 401 }
      )
    }

    // 解密 JWT Token 取得用戶資訊
    const session = await decrypt(cookie)
    if (!session?.payload?.userId) {
      return NextResponse.json(
        { status: 'error', message: '未授權訪問' },
        { status: 401 }
      )
    }

    const userId = session.payload.userId

    // 刪除用戶的所有分圈計時器記錄
    const lapTimerLogs = await prisma.timeLog.findMany({
      where: {
        userId: userId,
        title: {
          startsWith: '[LapTimer]',
        },
      },
    })

    for (const log of lapTimerLogs) {
      // 刪除相關的步驟記錄
      await prisma.step.deleteMany({
        where: {
          timeLogId: log.id,
        },
      })

      // 刪除時間記錄
      await prisma.timeLog.delete({
        where: {
          id: log.id,
        },
      })
    }

    return NextResponse.json({
      status: 'success',
      message: '分圈計時器資料刪除成功',
    })
  } catch (error) {
    console.error('刪除分圈計時器資料失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '刪除分圈計時器資料失敗' },
      { status: 500 }
    )
  }
}
