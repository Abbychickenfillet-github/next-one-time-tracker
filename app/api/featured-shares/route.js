import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'

// GET - 獲取精選分享列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId') // 可選：查詢特定用戶的分享

    // 嘗試獲取當前登入用戶（如果有的話）
    let currentUserId = null
    try {
      const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
      if (cookie) {
        const session = await decrypt(cookie)
        currentUserId = session?.payload?.userId
      }
    } catch {
      // 未登入用戶也可以查看公開分享
      console.log('未登入用戶查看公開分享')
    }

    // 構建查詢條件
    let whereClause
    if (userIdParam) {
      const requestedUserId = parseInt(userIdParam)
      // 只能查詢自己的分享，或查詢公開分享
      if (currentUserId && currentUserId === requestedUserId) {
        // 查詢自己的分享（包括非公開的）
        whereClause = { userId: requestedUserId }
      } else {
        // 查詢其他用戶的公開分享
        whereClause = {
          userId: requestedUserId,
          isPublic: true,
        }
      }
    } else {
      // 預設：只查詢公開分享（未登入用戶也可以查看）
      whereClause = { isPublic: true }
    }

    // 查詢精選分享，按星星數量和創建時間排序
    const featuredShares = await prisma.featuredShare.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        timeLog: {
          include: {
            steps: {
              orderBy: {
                startTime: 'asc',
              },
            },
          },
        },
      },
      orderBy: [{ starCount: 'desc' }, { createdAt: 'desc' }],
      take: 20, // 限制返回數量
    })

    // 格式化資料
    const formattedShares = featuredShares.map((share) => ({
      id: share.id,
      title: share.title,
      description: share.description,
      shareReason: share.shareReason,
      starCount: share.starCount,
      createdAt: share.createdAt,
      sharedAt: share.createdAt, // 使用 createdAt 作為分享時間
      // 扁平化用戶資訊
      userName: share.user.name,
      userAvatar: share.user.avatar,
      userId: share.user.user_id,
      // 扁平化時間記錄資訊，方便前端直接使用
      startTime: share.timeLog.startTime,
      endTime: share.timeLog.endTime,
      duration: share.timeLog.endTime
        ? (share.timeLog.endTime.getTime() -
            share.timeLog.startTime.getTime()) /
          (1000 * 60 * 60)
        : null,
      // 步驟數據
      steps: share.timeLog.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        startTime: step.startTime,
        endTime: step.endTime,
      })),
      // 保留完整結構供未來使用
      user: {
        id: share.user.user_id,
        name: share.user.name,
        email: share.user.email,
        avatar: share.user.avatar,
      },
      timeLog: {
        id: share.timeLog.id,
        title: share.timeLog.title,
        startTime: share.timeLog.startTime,
        endTime: share.timeLog.endTime,
        memo: share.timeLog.memo,
        duration: share.timeLog.endTime
          ? (share.timeLog.endTime.getTime() -
              share.timeLog.startTime.getTime()) /
            (1000 * 60 * 60)
          : null,
        steps: share.timeLog.steps.map((step) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          startTime: step.startTime,
          endTime: step.endTime,
        })),
      },
    }))

    return NextResponse.json({
      status: 'success',
      data: formattedShares,
      message: '精選分享載入成功',
    })
  } catch (error) {
    console.error('獲取精選分享失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '獲取精選分享失敗' },
      { status: 500 }
    )
  }
}

// POST - 創建精選分享
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
    const { timeLogId, title, description, shareReason, isPublic = true } = body

    // 驗證必要欄位
    if (!timeLogId || !title) {
      return NextResponse.json(
        { status: 'error', message: '缺少必要欄位' },
        { status: 400 }
      )
    }

    // 檢查時間記錄是否存在且屬於當前用戶
    const timeLog = await prisma.timeLog.findFirst({
      where: {
        id: timeLogId,
        userId: userId,
      },
    })

    if (!timeLog) {
      return NextResponse.json(
        { status: 'error', message: '時間記錄不存在或無權限' },
        { status: 404 }
      )
    }

    // 檢查是否已經分享過
    const existingShare = await prisma.featuredShare.findFirst({
      where: {
        userId: userId,
        timeLogId: timeLogId,
      },
    })

    if (existingShare) {
      return NextResponse.json(
        { status: 'error', message: '此時間記錄已經分享過了' },
        { status: 409 }
      )
    }

    // 創建精選分享
    const featuredShare = await prisma.featuredShare.create({
      data: {
        userId: userId,
        timeLogId: timeLogId,
        title: title,
        description: description,
        shareReason: shareReason,
        isPublic: isPublic,
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        timeLog: {
          include: {
            steps: true,
          },
        },
      },
    })

    return NextResponse.json({
      status: 'success',
      data: {
        id: featuredShare.id,
        title: featuredShare.title,
        description: featuredShare.description,
        shareReason: featuredShare.shareReason,
        starCount: featuredShare.starCount,
        isPublic: featuredShare.isPublic,
        createdAt: featuredShare.createdAt,
      },
      message: '精選分享創建成功',
    })
  } catch (error) {
    console.error('創建精選分享失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '創建精選分享失敗' },
      { status: 500 }
    )
  }
}

// PUT - 更新星星數量（點讚）
export async function PUT(request) {
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

    const body = await request.json()
    const { shareId, action } = body // action: 'star' 或 'unstar'

    if (!shareId || !action) {
      return NextResponse.json(
        { status: 'error', message: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 檢查分享是否存在
    const share = await prisma.featuredShare.findUnique({
      where: {
        id: shareId,
      },
    })

    if (!share) {
      return NextResponse.json(
        { status: 'error', message: '分享不存在' },
        { status: 404 }
      )
    }

    // 更新星星數量
    const newStarCount =
      action === 'star' ? share.starCount + 1 : Math.max(0, share.starCount - 1)

    const updatedShare = await prisma.featuredShare.update({
      where: {
        id: shareId,
      },
      data: {
        starCount: newStarCount,
      },
    })

    return NextResponse.json({
      status: 'success',
      data: {
        id: updatedShare.id,
        starCount: updatedShare.starCount,
      },
      message: action === 'star' ? '已點讚' : '已取消點讚',
    })
  } catch (error) {
    console.error('更新星星數量失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '更新星星數量失敗' },
      { status: 500 }
    )
  }
}

// DELETE - 刪除精選分享
export async function DELETE(request) {
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
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('id')

    if (!shareId) {
      return NextResponse.json(
        { status: 'error', message: '缺少分享ID' },
        { status: 400 }
      )
    }

    // 檢查分享是否存在且屬於當前用戶
    const share = await prisma.featuredShare.findFirst({
      where: {
        id: parseInt(shareId),
        userId: userId,
      },
    })

    if (!share) {
      return NextResponse.json(
        { status: 'error', message: '分享不存在或無權限' },
        { status: 404 }
      )
    }

    // 刪除分享
    await prisma.featuredShare.delete({
      where: {
        id: parseInt(shareId),
      },
    })

    return NextResponse.json({
      status: 'success',
      message: '精選分享刪除成功',
    })
  } catch (error) {
    console.error('刪除精選分享失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '刪除精選分享失敗' },
      { status: 500 }
    )
  }
}
