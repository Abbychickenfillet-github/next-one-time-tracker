import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'

// GET - 獲取用戶的我的最愛列表
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

    // 查詢用戶的所有最愛
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId, // 這是收藏者（當前登入用戶）的 ID
      },
      include: {
        featuredShare: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                // 移除 email 和 avatar，保護隱私
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
        },
      },
      orderBy: {
        createdAt: 'desc', // 按新增時間倒序排列
      },
    })

    // 格式化資料：將 Prisma 的巢狀結構扁平化，方便前端使用
    // favorite.featuredShare.user.name → featuredShare.userName
    const formattedFavorites = favorites.map((favorite) => {
      // share = favorite.featuredShare 的意思：
      // - favorite 是 Favorite 表的記錄（收藏記錄）
      // - favorite.featuredShare 是通過關聯查詢到的 FeaturedShare（被收藏的分享）
      // - 賦值給 share 變數，簡化後續寫法（避免每次都寫 favorite.featuredShare）
      const share = favorite.featuredShare
      return {
        id: favorite.id,
        createdAt: favorite.createdAt, // 收藏時間
        featuredShare: {
          id: share.id,
          title: share.title,
          description: share.description,
          shareReason: share.shareReason,
          starCount: share.starCount,
          isPublic: share.isPublic,
          createdAt: share.createdAt, // 分享時間
          sharedAt: share.createdAt,
          // 分享者的資訊（不是收藏者的）
          userName: share.user.name,
          userId: share.user.user_id,
          // 時間記錄資訊
          startTime: share.timeLog.startTime,
          endTime: share.timeLog.endTime,
          duration: share.timeLog.endTime
            ? (share.timeLog.endTime.getTime() -
                share.timeLog.startTime.getTime()) /
              (1000 * 60 * 60)
            : null,
          // 步驟資訊
          steps: share.timeLog.steps.map((step) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            startTime: step.startTime,
            endTime: step.endTime,
          })),
        },
      }
    })

    return NextResponse.json({
      status: 'success',
      data: formattedFavorites,
      message: '我的最愛載入成功',
    })
  } catch (error) {
    console.error('獲取我的最愛失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '獲取我的最愛失敗' },
      { status: 500 }
    )
  }
}

// POST - 新增最愛（按讚）
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
    const { featuredShareId } = body

    if (!featuredShareId) {
      return NextResponse.json(
        { status: 'error', message: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 檢查分享是否存在
    const share = await prisma.featuredShare.findUnique({
      where: {
        id: featuredShareId,
      },
    })

    if (!share) {
      return NextResponse.json(
        { status: 'error', message: '分享不存在' },
        { status: 404 }
      )
    }

    // 檢查是否已經按讚（使用 findFirst 因為複合唯一約束）
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        featuredShareId: featuredShareId,
      },
    })

    if (existingFavorite) {
      return NextResponse.json(
        { status: 'error', message: '已經按讚過了' },
        { status: 409 }
      )
    }

    // 使用事務：同時新增 Favorite 記錄和更新 starCount
    const result = await prisma.$transaction(async (tx) => {
      // 新增最愛記錄
      const favorite = await tx.favorite.create({
        data: {
          userId: userId,
          featuredShareId: featuredShareId,
        },
      })

      // 更新分享的星星數量
      const updatedShare = await tx.featuredShare.update({
        where: {
          id: featuredShareId,
        },
        data: {
          starCount: {
            increment: 1,
          },
        },
      })

      return { favorite, updatedShare }
    })

    return NextResponse.json({
      status: 'success',
      data: {
        id: result.favorite.id,
        featuredShareId: featuredShareId,
        starCount: result.updatedShare.starCount,
      },
      message: '已加入我的最愛',
    })
  } catch (error) {
    console.error('新增最愛失敗:', error)
    // 處理唯一約束錯誤（雖然我們已經檢查過，但以防萬一）
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 'error', message: '已經按讚過了' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { status: 'error', message: '新增最愛失敗' },
      { status: 500 }
    )
  }
}

// DELETE - 移除最愛（取消按讚）
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
    const featuredShareId = searchParams.get('featuredShareId')

    if (!featuredShareId) {
      return NextResponse.json(
        { status: 'error', message: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 檢查最愛記錄是否存在（使用 findFirst 因為複合唯一約束）
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        featuredShareId: featuredShareId,
      },
    })

    if (!favorite) {
      return NextResponse.json(
        { status: 'error', message: '未找到最愛記錄' },
        { status: 404 }
      )
    }

    // 使用事務：同時刪除 Favorite 記錄和更新 starCount
    const result = await prisma.$transaction(async (tx) => {
      // 刪除最愛記錄
      await tx.favorite.delete({
        where: {
          id: favorite.id,
        },
      })

      // 更新分享的星星數量
      const updatedShare = await tx.featuredShare.update({
        where: {
          id: featuredShareId,
        },
        data: {
          starCount: {
            decrement: 1,
          },
        },
      })

      return { updatedShare }
    })

    return NextResponse.json({
      status: 'success',
      data: {
        featuredShareId: featuredShareId,
        starCount: result.updatedShare.starCount,
      },
      message: '已移除我的最愛',
    })
  } catch (error) {
    console.error('移除最愛失敗:', error)
    return NextResponse.json(
      { status: 'error', message: '移除最愛失敗' },
      { status: 500 }
    )
  }
}
