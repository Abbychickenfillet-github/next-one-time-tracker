// app/loading.js - Next.js 全域載入頁面元件
// 這個檔案定義了當頁面載入時顯示的載入動畫或狀態
// 使用 'use client' 指令表示這是客戶端元件

// import CssLoader from './_components/css-loader'

// export default function Loading() {
//   return <CssLoader />
// }

'use client'

import { useEffect } from 'react'
import { useLoader } from '@/hooks/use-loader'

// Loading 元件 - 負責顯示全域載入狀態
export default function Loading() {
  const { showLoader } = useLoader()

  useEffect(() => {
    // 當元件掛載時，顯示載入動畫
    showLoader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 返回空元素，因為載入動畫由 useLoader hook 管理
  return <></>
}
