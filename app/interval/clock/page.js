'use client'

import { useEffect, useState } from 'react'
import useInterval from '@/hooks/use-interval'

export default function IntervalPage() {
  // 小時鐘用
  const [time, setTime] = useState(new Date())
  const [hasMounted, setHasMounted] = useState(false)

  useInterval(() => {
    setTime(new Date())
  }, 1000)

  useEffect(() => {
    // This will only be called once the component is mounted inside the browser
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return (
    <div>
      <h1>小時鐘 - useInterval範例</h1>
      <hr />
      <h2>{time.toLocaleTimeString()}</h2>
    </div>
  )
}
