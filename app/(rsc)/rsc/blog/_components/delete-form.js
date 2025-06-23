'use client'

import { remove } from '../_actions/blog'

// 當你需要伺服器函式的狀態，或是回應值時，你可以使⽤useActionState(v19)或useFormState(v18.x)這兩個勾⼦。當然它們都是帶有內部狀態的勾⼦，所以只能在客戶端元件中使⽤。
import { useActionState, useEffect } from 'react'

export default function DeleteForm({ blogId = 0, setDeleteState = () => {} }) {
  // [控制用狀態, 動作, 是否正在等候中] = useActionState(伺服器函式, 狀態初始值)
  const [state, formAction, isPending] = useActionState(remove, null)

  console.log(state)

  // 跳出成功訊息
  useEffect(() => {
    if (state) setDeleteState(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="blogId" value={blogId} />
        <button type="submit" disabled={isPending}>
          {isPending ? '刪除中...' : '刪除'}
        </button>
      </form>
    </>
  )
}
