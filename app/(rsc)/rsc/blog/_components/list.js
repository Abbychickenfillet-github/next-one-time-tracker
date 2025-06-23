'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'

import DeleteForm from './delete-form'
// import { refresh } from '../_actions/blog'

export default function List({ blogs = [] }) {
  const [deleteState, setDeleteState] = useState(null)
  // const [isPending, startTransition] = useTransition()

  const router = useRouter()

  console.log(deleteState)

  //   console.log(isPending)

  useEffect(() => {
    if (deleteState?.status === 'error') {
      // 顯示土司訊息
      toast.error(deleteState?.message)
      // 重置
      setDeleteState({ ...deleteState, status: '', message: '' })
    }

    if (deleteState?.status === 'success') {
      // 顯示土司訊息
      toast.success(deleteState?.message)
      // 重新整理
      //   startTransition(() => {
      //     refresh()
      //   })
      router.refresh()
      // 重置
      setDeleteState({ ...deleteState, status: '', message: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteState])

  return (
    <>
      <ul>
        {blogs.map((blog) => (
          <li key={blog.id}>
            <Link href={`/rsc/blog/${blog.id}`}>{blog.title}</Link>
            <DeleteForm blogId={blog.id} setDeleteState={setDeleteState} />
            <button
              onClick={() => {
                router.push(`/rsc/blog/update/${blog.id}`)
              }}
            >
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
