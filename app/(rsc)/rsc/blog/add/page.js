import Link from 'next/link'
import AddForm from '../_components/add-form'

export default function AddPage() {
  return (
    <>
      <h1>新增部落格</h1>
      <Link href="/rsc/blog">回到部落格列表</Link>
      <hr />
      {/* 客戶端元件，呈現訊息+Server Functions */}
      <AddForm />
    </>
  )
}
