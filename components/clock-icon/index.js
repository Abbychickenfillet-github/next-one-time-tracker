'use client'
import React from 'react'
import styles from './clock-icon.module.css'

/**
 * 時鐘動畫圖示組件
 * 用於 breadcrumb 首頁圖示
 */
export default function ClockIcon() {
  return (
    <span className={styles.clockIcon} title="首頁">
      ⏰
    </span>
  )
}
