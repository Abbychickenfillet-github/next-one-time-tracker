'use client'

import { useRouter } from 'next/navigation'

export default function Pagination({ page = 1, pageCount = 1 }) {
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => {
          const newPage = page - 1 < 1 ? 1 : page - 1
          console.log(newPage)

          router.push(`/rsc/product/list?page=${newPage}`)
        }}
      >
        上一頁
      </button>
      <button
        onClick={() => {
          const newPage = page + 1 > pageCount ? pageCount : page + 1
          console.log(newPage)

          router.push(`/rsc/product/list?page=${newPage}`)
        }}
      >
        下一頁
      </button>
    </>
  )
}
