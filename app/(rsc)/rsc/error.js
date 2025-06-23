'use client' // 錯誤邊界(Error boundaries)必需是一個客戶端元件

import { useEffect } from 'react'

// https://nextjs.org/docs/app/building-your-application/routing/error-handling
export default function Error({ error, reset }) {
  useEffect(() => {
    // 在錯誤發生時，將錯誤記錄到瀏覽器的控制台(或其它日誌記錄工具)
    console.error(error)
  }, [error])

  return (
    <div>
      <h1>錯誤</h1>
      <button
        onClick={
          // 重試按鈕，當按下時呼叫reset函式
          () => reset()
        }
      >
        重試
      </button>
    </div>
  )
}
