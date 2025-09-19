# Firebase Auth 整合指南

## 概述
Firebase Auth 提供完整的身份驗證解決方案，支援多種登入方式，與現有時間戳記專案完美整合。

## 優勢
- ✅ 免費額度：每月 10,000 次認證
- ✅ 多種登入方式：Google、Facebook、Email、電話
- ✅ 自動 JWT Token 管理
- ✅ 與 Firebase 其他服務整合
- ✅ 安全性高，Google 維護

## 實作步驟

### 1. Firebase 專案設定
```bash
# 在 Firebase Console 建立專案
# 啟用 Authentication
# 設定 Google 登入提供者
```

### 2. 環境變數設定
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase 配置檔案
```javascript
// lib/firebase-config.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

### 4. 登入 Hook
```javascript
// hooks/use-firebase-auth.js
import { useState, useEffect } from 'react'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth'
import { auth } from '@/lib/firebase-config'

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error) {
      console.error('Google 登入失敗:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('登出失敗:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    logout
  }
}
```

### 5. 與後端整合
```javascript
// API 路由：app/(api)/api/auth/firebase/route.js
import { NextResponse } from 'next/server'
import { verifyIdToken } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import prisma from '@/lib/prisma'

// 初始化 Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

export async function POST(req) {
  try {
    const { idToken } = await req.json()
    
    // 驗證 Firebase ID Token
    const decodedToken = await verifyIdToken(idToken)
    const { uid, email, name, picture } = decodedToken

    // 查詢或建立用戶
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          username: email.split('@')[0],
          profile: {
            create: {
              name: name || '',
              avatar: picture || ''
            }
          }
        }
      })
    }

    // 建立 JWT Session
    const payload = { userId: user.id }
    await createSession(payload, '7d', 'ACCESS_TOKEN')

    return NextResponse.json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    })
  } catch (error) {
    console.error('Firebase Auth Error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}
```

## 成本分析
- **免費額度**：每月 10,000 次認證
- **付費方案**：超過後每 1,000 次 $0.01
- **適合規模**：中小型專案完全免費

## 與現有系統整合
1. 保留現有的 Prisma User 模型
2. 新增 `firebaseUid` 欄位
3. 使用 Firebase 處理認證
4. 使用自建 JWT 處理授權
