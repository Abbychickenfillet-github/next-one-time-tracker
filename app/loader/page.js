'use client'

import { useEffect, useState } from 'react'
import { useLoader } from '@/hooks/use-loader'

// ========================================
// 🔧 ESLint 修復注意事項
// ========================================
// 問題：React Hook 錯誤 - 函數名稱不符合 React 元件命名規範
// 原因：trialGlobalPage 以小寫開頭，React 元件必須以大寫開頭
// 修復：重命名為 TrialGlobalPage (首字母大寫)
// 影響：React Hooks (useEffect, useState, useLoader) 只能在 React 元件或自定義 Hook 中使用
// ========================================
export default function TrialGlobalPage() {
  // 自訂控制開關載入動畫
  // 要手動控制關閉，Context要給參數close={0} `<LoaderProvider close={0}>`
  // showLoader是開載入動畫函式，hideLoader為關動畫函式(手動控制關閉才有用)
  const { showLoader, hideLoader, loading, delay } = useLoader()

  // trial data
  const [products, setProducts] = useState([])

  // 模擬fetch或異步載入
  async function trialAsyncCall() {
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
    trialAsyncCall()
      .then(delay(3000)) // 延時3秒後再停止載入器，只有手動控制有用，自動關閉會無用
      .then(hideLoader)
    // eslint-disable-next-line
  }, [])

  // 按鈕測試用
  const start = () => {
    showLoader()
    // 模擬fetch或異步載入
    trialAsyncCall()
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
