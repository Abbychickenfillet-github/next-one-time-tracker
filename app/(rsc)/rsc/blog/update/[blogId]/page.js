import Link from 'next/link'
import { isDev } from '@/config/client.config'
import UpdateForm from '../../_components/update-form'
// 導入服務層的函式
import { getBlogById } from '@/services/blog.service'

export default async function UpdatePage({ params }) {
  // 取得部落格id，注意這裡的blogId是字串
  const blogId = Number((await params).blogId)
  // 除錯用
  if (isDev) console.log(typeof blogId, blogId)

  // 取得部落格，需要加上await等待取得資料
  const data = await getBlogById(blogId)
  // 除錯用
  if (isDev) console.log(data)

  const blog = data?.payload?.blog

  return (
    <>
      <h1>更新部落格</h1>
      <Link href="/rsc/blog">回到部落格列表</Link>
      <hr />
      {/* 客戶端元件，呈現訊息+Server Functions */}
      <UpdateForm title={blog?.title} content={blog?.content} blogId={blogId} />
    </>
  )
}
