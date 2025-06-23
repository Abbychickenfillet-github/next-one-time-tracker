'use client'

import { useEffect, useState } from 'react'
import useInterval from '@/hooks/use-interval'

export default function IntervalPage() {
  // 計數器用
  const [count, setCount] = useState(0)
  // 每多少時間變動一次(毫秒值，設定為null則停止)
  const [delay, setDelay] = useState(1000)

  useInterval(() => {
    setCount(count + 1)
  }, delay)

  // 計數器超過100時停止
  useEffect(() => {
    if (count > 100) setDelay(null)
  }, [count])

  return (
    <div>
      <h1>計數器 - useInterval範例</h1>
      <hr />
      <h2>{count}</h2>
      <br />
      <button onClick={() => setDelay(1000)}>開始</button>
      <button onClick={() => setDelay(null)}>停止</button>
    </div>
  )
}
