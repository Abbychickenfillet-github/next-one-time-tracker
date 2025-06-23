'use client'

import { useEffect, useState } from 'react'
import { useLoader } from '@/hooks/use-loader'
import CardLoading from './_components/card-loading'
import styles from './_styles/card.module.scss'

export default function PlaceholderPage() {
  // 自訂控制開關載入動畫, showLoader是開載入動畫函式
  const { showLoader, loading } = useLoader()
  // 初次載入，不要呈現任何資料
  const [firstLoading, setFirstLoading] = useState(true)

  // didmount-初次渲染
  useEffect(() => {
    showLoader()
    setFirstLoading(false)
    // eslint-disable-next-line
  }, [])

  // 如果是狀態初始化值，不呈現任何資料
  if (firstLoading) {
    return <></>
  }

  return (
    <>
      <div className={styles['grid-container']}>
        {Array(40)
          .fill(1)
          .map((v, i) => {
            return <CardLoading key={i} loading={loading} />
          })}
      </div>
    </>
  )
}
