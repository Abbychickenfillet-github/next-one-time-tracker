'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// 創建 QueryClient 實例
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 數據在 5 分鐘內被認為是新鮮的
        staleTime: 5 * 60 * 1000,
        // 緩存保留 10 分鐘
        cacheTime: 10 * 60 * 1000,
        // 失敗時重試 3 次
        retry: 3,
        // 窗口聚焦時不重新獲取
        refetchOnWindowFocus: false,
        // 網絡重連時重新獲取
        refetchOnReconnect: true,
      },
      mutations: {
        // 變更失敗時重試 1 次
        retry: 1,
      },
    },
  })
}

// QueryClient Provider 組件
export function ReactQueryProvider({ children }) {
  // 使用 useState 確保 QueryClient 實例在組件生命週期中保持穩定
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開發環境下顯示 React Query DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

// 使用範例
export default function QueryClientExample() {
  return (
    <div className="container mt-4">
      <h1>QueryClient 配置範例</h1>

      <div className="row">
        <div className="col-md-6">
          <h3>QueryClient 功能</h3>
          <ul>
            <li>
              <strong>緩存管理</strong>: 自動緩存 API 響應
            </li>
            <li>
              <strong>背景更新</strong>: 在後台更新過期數據
            </li>
            <li>
              <strong>錯誤處理</strong>: 自動重試失敗的請求
            </li>
            <li>
              <strong>加載狀態</strong>: 提供 isLoading, isError 等狀態
            </li>
            <li>
              <strong>樂觀更新</strong>: 在變更前更新 UI
            </li>
          </ul>
        </div>

        <div className="col-md-6">
          <h3>QueryClientProvider 功能</h3>
          <ul>
            <li>
              <strong>Context 提供</strong>: 讓子組件使用 React Query
            </li>
            <li>
              <strong>全局配置</strong>: 統一管理所有查詢的默認行為
            </li>
            <li>
              <strong>DevTools 集成</strong>: 開發時調試工具
            </li>
            <li>
              <strong>實例管理</strong>: 確保 QueryClient 實例穩定
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <h3>配置說明</h3>
        <pre className="bg-light p-3 rounded">
          {`const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5分鐘新鮮度
      cacheTime: 10 * 60 * 1000,   // 10分鐘緩存
      retry: 3,                    // 重試3次
      refetchOnWindowFocus: false, // 聚焦不重新獲取
    },
  },
})`}
        </pre>
      </div>
    </div>
  )
}
