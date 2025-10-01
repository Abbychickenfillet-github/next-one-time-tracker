'use client'

import styles from '@/styles/decorative-icons.module.scss'

interface DecorativeIconsProps {
  className?: string
}

export default function DecorativeIcons({
  className = '',
}: DecorativeIconsProps) {
  return (
    <div className={`${styles.pixelIcons} ${className}`}>
      <span className={styles.chemicalIcon}>🧪</span>
      <span className={styles.scissorIcon}>✂️</span>
    </div>
  )
}
