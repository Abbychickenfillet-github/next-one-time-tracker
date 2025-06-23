'use client'

import React, { useState, useEffect } from 'react'
import { useGetBlog, useUpdateBlog } from '@/services/rest-client/use-blog'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { isDev } from '@/config/client.config'

export default function UpdatePage() {
  // 記錄更新的title和content
  const [blogInput, setBlogInput] = useState({ title: '', content: '' })
  // 取得URL上的動態參數，例如: /blog/update/1，得到的是{ blogId: 1 }
  const params = useParams()
  // 取得部落格資料
  const { blog, isLoading, isError } = useGetBlog(params.blogId)
  // 更新部落格用的觸發函式
  // eslint-disable-next-line no-unused-vars
  const { updateBlog, isError: isUpdateError, isMutating } = useUpdateBlog()

  // 設定title和content的值
  useEffect(() => {
    // 要注意blog是物件，判斷時不能直接判斷物件
    if (blog.title) {
      setBlogInput({ title: blog.title, content: blog.content })
    }
  }, [blog])

  // 輸入欄位變動
  const handleFieldChange = (e) => {
    setBlogInput({ ...blogInput, [e.target.name]: e.target.value })
  }

  // 更新部落格
  const handleSubmit = async (e) => {
    // 防止表單預設送出
    e.preventDefault()

    // PUT方法時，要利用updateBlog(id, data)來更新
    const res = await updateBlog(params.blogId, blogInput)
    const resData = await res.json()
    // 除錯用
    if (isDev) console.log(resData)

    if (resData.status === 'success') {
      toast.success('更新成功')
    } else {
      toast.error('更新失敗')
    }
  }

  // isMutating如果會卡到跳出的土司訊息，這裡先關閉
  // if (isMutating) return <div>更新中...</div>
  if (isLoading) return <div>載入中...</div>
  if (isError) return <div>發生錯誤</div>
  if (isUpdateError) return <div>發生更新錯誤</div>

  return (
    <>
      <h1>更新部落格</h1>
      <Link href="/blog">回到部落格列表</Link>
      <hr />
      <form onSubmit={handleSubmit}>
        <label>
          標題：
          <input
            type="text"
            value={blogInput.title}
            name="title"
            onChange={(e) => handleFieldChange(e)}
          />
        </label>
        <label>
          內容：
          <textarea
            value={blogInput.content}
            name="content"
            onChange={(e) => handleFieldChange(e)}
          />
        </label>
        <button type="submit">更新</button>
      </form>
      {/* 土司訊息(需要先安裝套件) */}
      <ToastContainer />
    </>
  )
}
