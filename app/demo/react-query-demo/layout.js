'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// demo 頁面使用 useQueryClient，需要 provider 才能在 build 預渲染時通過
export default function ReactQueryDemoLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
