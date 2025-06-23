'use client'

import { useGetBlog } from '@/services/rest-client/use-blog'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { isDev, logPrefix } from '@/config/client.config'

export default function BlogIdPage() {
  const params = useParams()
  if (isDev) console.log(...logPrefix.log, params)
  const { blog, isLoading, isError } = useGetBlog(params.blogId)

  // 這裡的data是undefined，因為還在載入中
  if (isLoading) return <div>載入中...</div>
  if (isError) return <div>發生錯誤</div>

  return (
    <>
      <h1>部落格頁面</h1>
      <Link href="/blog">回到部落格列表</Link>
      <hr />
      <h2>{blog.title}</h2>
      <p>{blog.content}</p>
    </>
  )
}
