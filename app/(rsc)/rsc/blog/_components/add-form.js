'use client'

import { create } from '../_actions/blog'
// 當你需要伺服器函式的狀態，或是回應值時，你可以使⽤useActionState(v19)或useFormState(v18.x)這兩個勾⼦。當然它們都是帶有內部狀態的勾⼦，所以只能在客戶端元件中使⽤。
import { useActionState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { isDev } from '@/config/client.config'

export default function AddForm() {
  // [控制用狀態, 動作, 是否正在等候中] = useActionState(伺服器函式, 狀態初始值)
  // eslint-disable-next-line no-unused-vars
  const [state, formAction, isPending] = useActionState(create, null)

  // 除錯用
  if (isDev) console.log(state)

  // 跳出成功訊息
  useEffect(() => {
    if (state?.status === 'success') {
      toast.success(state?.message)
    }
    if (state?.status === 'error') {
      toast.error(state?.message)
    }
  }, [state])
  return (
    <>
      <form action={formAction}>
        <div>
          標題：
          <input
            type="text"
            name="title"
            defaultValue={
              state?.status === 'error' ? state?.payload?.data?.title : ''
            }
          />
          <span>{state?.errors?.title}</span>
        </div>
        <div>
          內容：
          <textarea
            name="content"
            defaultValue={
              state?.status === 'error' ? state?.payload?.data?.content : ''
            }
          />
          <span>{state?.errors?.content}</span>
        </div>
        <br />
        <button type="submit">新增</button>
      </form>
      <ToastContainer />
    </>
  )
}
