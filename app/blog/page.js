'use client'

import { useGetBlogList, useDeleteBlog } from '@/services/rest-client/use-blog'
import Link from 'next/link'
import { isDev } from '@/config/client.config'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'

export default function ListPage() {
  const router = useRouter()
  // 取得部落格列表
  const { blogs, isLoading, isError, mutate } = useGetBlogList()
  // DELETE方法時，要利用deleteBlog來刪除
  // eslint-disable-next-line no-unused-vars
  const { deleteBlog, isMutating, isError: isDeleteError } = useDeleteBlog()

  // isMutating如果會卡到跳出的土司訊息，這裡可以先關閉
  // if (isMutating) return <div>刪除中...</div>
  if (isLoading) return <div>載入中...</div>
  if (isError) return <div>發生錯誤</div>
  if (isDeleteError) return <div>發生刪除錯誤</div>

  const handleDelete = async (blogId) => {
    // DELETE方法時，要利用deleteBlog(blogId)來刪除
    const resData = await deleteBlog(blogId)
    const data = await resData.json()
    // 除錯用
    if (isDev) console.log(data)

    if (data.status === 'success') {
      // 重新取得部落格列表
      mutate()
      // 訊息
      toast.success('刪除成功')
    } else {
      toast.error('刪除失敗')
    }
  }

  return (
    <>
      <h1>部落格列表</h1>
      <Link href="/blog/add">新增部落格</Link>
      <hr />
      <ul>
        {blogs.map((blog) => (
          <li key={blog.id}>
            <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
            <button onClick={() => handleDelete(blog.id)}>刪除</button>
            <button onClick={() => router.push(`/blog/update/${blog.id}`)}>
              編輯
            </button>
          </li>
        ))}
      </ul>
      {/* 土司訊息(需要先安裝套件) */}
      <ToastContainer />
    </>
  )
}
