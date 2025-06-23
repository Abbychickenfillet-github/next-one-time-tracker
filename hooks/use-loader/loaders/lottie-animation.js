'use client'

import React, { useEffect, useState } from 'react'
import Lottie from 'react-lottie-player'
import styles from '../loader.module.scss'

// LottieAnimation元件是用來顯示Lottie動畫的元件
export default function LottieAnimation({
  show = false,
  animationName = '',
  prefix = '',
  width = 200,
  height = 200,
  speed = 1,
}) {
  // animationData是用來存放動畫資料的狀態
  const [animationData, setAnimationData] = useState()

  // 當元件件首次掛載時，它會導入Lottie動畫JSON文件並將其設置為animationData狀態
  useEffect(() => {
    import(`./assets/${animationName}`).then(setAnimationData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 根據prefix來設定元件的class名稱
  // 在CSS Module中進行客製化樣式，主要是為了定位與設定動畫的尺寸大小
  const classNames = {
    bg: prefix ? `${prefix}-loader-bg` : 'loader-bg',
    hide: prefix ? `${prefix}-loader--hide` : 'loader--hide',
    loader: prefix ? `${prefix}-loader` : 'loader',
  }

  return (
    <>
      <div
        className={`${styles[classNames.bg]} ${
          show ? '' : styles[classNames.hide]
        }`}
      >
        <div className={`${styles[classNames.loader]}`}>
          {/* 如果animationData不存在，則顯示placeholder */}
          {!animationData ? (
            ''
          ) : (
            <Lottie
              animationData={animationData}
              play
              loop
              speed={speed}
              style={{ width, height }}
            />
          )}
        </div>
      </div>
    </>
  )
}
