'use client'

import styles from '../loader.module.scss'

// 展示用載入元件
export default function DefaultLoader({ show = false }) {
  return (
    <div
      className={`${styles['semi-loader']} ${
        show ? '' : styles['semi-loader--hide']
      }`}
    ></div>
  )
}
