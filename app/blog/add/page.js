'use client'

import React, { useState } from 'react'
import { useCreateBlog } from '@/services/rest-client/use-blog'
import Link from 'next/link'
import { isDev } from '@/config/client.config'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AddPage() {
  // eslint-disable-next-line no-unused-vars
  const { createBlog, isError, isMutating } = useCreateBlog()
  // 記錄更新的title和content
  const [blogInput, setBlogInput] = useState({ title: '', content: '' })

  // 輸入欄位變動
  const handleFieldChange = (e) => {
    setBlogInput({ ...blogInput, [e.target.name]: e.target.value })
  }

  // 新增部落格
  const handleSubmit = async (e) => {
    // 防止表單預設送出
    e.preventDefault()
    // 透過createBlog(data)來新增部落格
    const res = await createBlog(blogInput)
    const resData = await res.json()
    // 除錯用
    if (isDev) console.log(resData)

    if (resData.status === 'success') {
      // 清除填寫資料
      setBlogInput({ title: '', content: '' })
      // 訊息
      toast.success('新增成功')
    } else {
      toast.error('新增失敗')
    }
  }

  if (isError) return <div>發生錯誤</div>

  return (
    <>
      <h1>新增部落格</h1>
      <Link href="/blog">回到部落格列表</Link>
      <hr />
      <form onSubmit={handleSubmit}>
        <label>
          標題：
          <input
            type="text"
            name="title"
            value={blogInput.title}
            onChange={handleFieldChange}
          />
        </label>
        <label>
          內容：
          <textarea
            name="content"
            value={blogInput.content}
            onChange={handleFieldChange}
          />
        </label>
        <button type="submit">新增</button>
      </form>
      {/* 土司訊息(需要先安裝套件) */}
      <ToastContainer />
    </>
  )
}
