import { redirect } from 'next/navigation'

export default async function ProductPage() {
  // 導向商品列表頁
  redirect('/rsc/product/list')
  return <></>
}
