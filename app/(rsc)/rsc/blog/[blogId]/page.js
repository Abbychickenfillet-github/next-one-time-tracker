// 伺服器端元件
import Link from 'next/link'
// 導入參數
import { isDev, logPrefix } from '@/lib/utils'
// 導入控制層的類別
// import BlogService from '@/services/server/blog.service'
import { getBlogById } from '@/services/blog.service'

export default async function BlogIdPage({ params }) {
  // 取得部落格id，注意這裡的blogId是字串
  const blogId = Number((await params).blogId)
  // 除錯用
  isDev &&
    console.log(...logPrefix.log, '[BlogIdPage]-L14', typeof blogId, blogId)

  // 取得部落格，需要加上await等待取得資料
  const data = await getBlogById(blogId)

  isDev && console.log(data)

  // 從資料中取得blog
  const blog = data?.payload?.blog
  // 除錯用
  if (isDev) console.log(data)

  if (data.status === 'error') {
    return (
      <>
        <h1>部落格頁面(RSC)</h1>
        <Link href="../blog">回到部落格列表</Link>
        <hr />
        <h2>部落格不存在</h2>
        <p>訊息: {data?.message}</p>
        <p>錯誤: {data?.errors?.id}</p>
      </>
    )
  }

  return (
    <>
      <h1>部落格頁面(RSC)</h1>
      <Link href="../blog">回到部落格列表</Link>
      <hr />
      <h2>{blog?.title}</h2>
      <p>{blog?.content}</p>
    </>
  )
}
