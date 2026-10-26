'use client'

import styles from '@/styles/slide-dots.module.scss'

// 投影片右側的圓點導覽：點一下跳到那張，目前這張用黃色放大
export default function SlideDots({ labels, active, onSelect, light = true }) {
  return (
    <nav
      className={`${styles.dots} ${light ? styles.light : styles.dark}`}
      aria-label="頁面區塊"
    >
      {labels.map((name, i) => (
        <button
          key={name}
          type="button"
          title={name}
          aria-label={name}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => onSelect(i)}
        />
      ))}
    </nav>
  )
}
