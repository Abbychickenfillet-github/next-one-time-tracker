'use client'

import { useEffect, useState } from 'react'
import { useLoader } from '@/hooks/use-loader'

export default function DemoGlobalPage() {
  // 自訂控制開關載入動畫
  // 要手動控制關閉，Context要給參數close={0} `<LoaderProvider close={0}>`
  // showLoader是開載入動畫函式，hideLoader為關動畫函式(手動控制關閉才有用)
  const { showLoader, hideLoader, loading, delay } = useLoader()

  // demo data
  const [products, setProducts] = useState([])

  // 模擬fetch或異步載入
  async function demoAsyncCall() {
    const res = await fetch(
      'https://my-json-server.typicode.com/eyesofkids/json-fake-data/products'
    )
    const data = await res.json()
    setProducts(data)
    return data
  }

  // didmount-初次渲染
  useEffect(() => {
    showLoader()
    // 模擬fetch或異步載入
    demoAsyncCall()
      .then(delay(3000)) // 延時3秒後再停止載入器，只有手動控制有用，自動關閉會無用
      .then(hideLoader)
    // eslint-disable-next-line
  }, [])

  // 按鈕測試用
  const start = () => {
    showLoader()
    // 模擬fetch或異步載入
    demoAsyncCall()
      .then(delay(3000)) // 延時3秒後再停止載入器，只有手動控制有用，自動關閉會無用
      .then(hideLoader)
  }

  // 呈現載入的範例資料
  const display = products.map((v) => <p key={v.id}>{v.name}</p>)

  // 如果是狀態初始化值，不呈現任何資料
  if (!products.length) {
    return <></>
  }

  return (
    <>
      <div>
        {loading ? '載入中' : <button onClick={start}>測試手動載入用</button>}
        <hr />
        {loading ? '載入中' : display}
      </div>
    </>
  )
}
