// 伺服器端元件
import Link from 'next/link'
// 導入參數
import { isDev } from '@/config/client.config'
// import Logger from '@/lib/logger'
// 導入服務層類別
// import BlogService from '@/services/server/blog.service'
import { getBlogs } from '@/services/blog.service'

// 部落格列表頁
import List from './_components/list'

export default async function BlogListPage() {
  // 取得部落格列表，需要加上await等待取得資料
  const data = await getBlogs()
  // 除錯用
  isDev && console.log(data)
  // isDev && Logger.info('app/(rsc)/rsc/blog/page.js', 'BlogListPage', data)
  // 從資料中取得blogs
  const blogs = data?.payload?.blogs

  return (
    <>
      <h1>部落格列表(RSC)</h1>
      <Link href="/rsc/blog/add">新增部落格</Link>
      <hr />
      <List blogs={blogs} />
    </>
  )
}
