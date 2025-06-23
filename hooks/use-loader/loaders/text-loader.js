'use client'

import styles from '../loader.module.scss'

// 展示用載入文字元件
export default function TextLoader({ text = 'loading', show = false }) {
  return (
    <div
      className={`${styles['loading-text-bg']} ${
        show ? '' : styles['loading-text--hide']
      }`}
    >
      <div
        className={`${styles['loading-text']} ${
          show ? '' : styles['loading-text--hide']
        }`}
      >
        {text}...
      </div>
    </div>
  )
}
