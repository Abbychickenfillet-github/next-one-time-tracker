'use client'
// migrate to app router
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import { BiHome } from 'react-icons/bi'
import { Breadcrumb } from 'react-bootstrap'
import ClockIcon from '@/components/clock-icon'
// 中文路徑對照陣列，到configs/index.js中設定
import { pathsLocaleMap } from '@/config/client.config'
// 額外樣式檔案
import styles from '@/styles/next-breadcrumb.module.scss'

/**
 * NextBreadCrumb 搭配 useRouter 動態產生的麵包屑元件(breadcrumb)
 *
 * @component
 * @param {object} props
 * @param {boolean} [props.omitRoot=false] omit root node(home)
 * @param {JSX.Element} [props.homeIcon=<ClockIcon />]
 * @param {boolean} [props.isHomeIcon=false] with home icon
 * @returns {JSX.Element}
 */
export default function NextBreadCrumb({
  omitRoot = false,
  homeIcon = <ClockIcon />,
  isHomeIcon = false,
}) {
  // 得到目前的網址的路徑
  const pathname = usePathname()

  const getPathFormatLocale = useCallback(() => {
    // 1. 拆解 ex. '/product/baby/birth' -> ['','product','baby', 'birth']
    const paths = pathname.split('/')

    // 2. 轉換字詞 to ['','產品','嬰兒', '初生兒']
    const pathsLocale = paths.map((v) => {
      // 不存在(例如空字串) 或 數字類型(例如id)的最後結尾參數會忽略
      if (!v || Number(v)) return ''

      // replace '#' to ''
      const path = v.includes('#') ? v.replaceAll('#', '') : v

      // 回傳對照後的中文字串
      return pathsLocaleMap[path] || path
    })

    // 3. 產生 Breadcrumb.Item 元素
    const breadcrumbItems = []

    // 首頁項目
    if (!omitRoot) {
      breadcrumbItems.push(
        <Breadcrumb.Item key="home" href="/">
          {!isHomeIcon ? (pathsLocaleMap['home'] || '首頁') : homeIcon}
        </Breadcrumb.Item>
      )
    }

    // 其他路徑項目
    pathsLocale.forEach((v, i) => {
      if (i === 0 || v === '') return // 跳過空字串和第一個元素

      if (i === pathsLocale.length - 1) {
        // 最後一個項目（當前頁面）
        breadcrumbItems.push(
          <Breadcrumb.Item key={i} active>
            {v}
          </Breadcrumb.Item>
        )
      } else {
        // 中間項目（可點擊連結）
        breadcrumbItems.push(
          <Breadcrumb.Item key={i} href={paths.slice(0, i + 1).join('/')}>
            {v}
          </Breadcrumb.Item>
        )
      }
    })

    return breadcrumbItems
  }, [pathname, omitRoot, isHomeIcon, homeIcon])

  return (
    <nav aria-label="breadcrumb" style={{ lineHeight: '32px' }}>
      <Breadcrumb className={styles['breadcrumb']}>
        {getPathFormatLocale()}
      </Breadcrumb>
    </nav>
  )
}
