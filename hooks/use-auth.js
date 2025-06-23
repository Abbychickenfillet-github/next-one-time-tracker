'use client'

import { useContext, createContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthGet } from '@/services/rest-client/use-user'
// 登入頁路由與隱私頁面路由，未登入時會檢查後跳轉至登入頁路由
import { loginRoute, protectedRoutes } from '@/config/client.config'

// 建立Context
const AuthContext = createContext(null)

// 提供在全域綁定的context狀態
export const AuthProvider = ({ children }) => {
  // 控制didMount
  const [didAuthMount, setDidAuthMount] = useState(false)

  // 從useAuthGet()取得user, favorites
  const { user, favorites, isLoading } = useAuthGet()

  // isAuth是用來判斷是否已登入
  const isAuth = !!user?.id

  // #region 隱私保護路由處理
  const router = useRouter()
  const pathname = usePathname()

  // 控制didMount
  useEffect(() => {
    setDidAuthMount(true)
  }, [])

  // didMount(初次渲染)後，檢查是否有登入
  // 如果會員未登入，有比對到是隱私路由，就跳轉到登入頁面
  useEffect(() => {
    if (!isAuth && didAuthMount) {
      if (protectedRoutes.includes(pathname)) {
        router.push(loginRoute)
      }
    }
    // eslint-disable-next-line
  }, [pathname])
  // #endregion

  return (
    <AuthContext.Provider
      value={{
        isLoading, // 載入動畫指示用(會撥放1秒)
        didAuthMount,
        isAuth,
        user, // 個人資料在user.profile
        favorites,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
