'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

// 模擬 API 函數
const fetchUsers = async () => {
  const response = await fetch('/api/users')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

const createUser = async (userData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!response.ok) throw new Error('Failed to create user')
  return response.json()
}

export default function ReactQueryDemo() {
  const [name, setName] = useState('')
  const queryClient = useQueryClient()

  // 1. 使用 useQuery 獲取數據
  const { 
    data: users, 
    isLoading, 
    error, 
    isError 
  } = useQuery({
    queryKey: ['users'], // 緩存鍵
    queryFn: fetchUsers, // 獲取數據的函數
    staleTime: 5 * 60 * 1000, // 5分鐘內數據被認為是新鮮的
  })

  // 2. 使用 useMutation 修改數據
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 成功後使 'users' 查詢失效，觸發重新獲取
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setName('') // 清空表單
    },
    onError: (error) => {
      console.error('創建用戶失敗:', error)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      createUserMutation.mutate({ name: name.trim() })
    }
  }

  if (isLoading) return <div>載入中...</div>
  if (isError) return <div>錯誤: {error.message}</div>

  return (
    <div className="container mt-4">
      <h1>React Query Demo</h1>
      
      {/* 顯示用戶列表 */}
      <div className="mb-4">
        <h2>用戶列表</h2>
        <ul className="list-group">
          {users?.map(user => (
            <li key={user.id} className="list-group-item">
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>

      {/* 添加新用戶表單 */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">用戶名稱</label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="輸入用戶名稱"
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? '創建中...' : '創建用戶'}
        </button>
      </form>

      {/* 顯示狀態信息 */}
      <div className="mt-3">
        <small className="text-muted">
          查詢狀態: {isLoading ? '載入中' : '已載入'} | 
          變更狀態: {createUserMutation.isPending ? '處理中' : '待機'}
        </small>
      </div>
    </div>
  )
}

