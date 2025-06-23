'use client'
// migrate to app router
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
// 中文路徑對照陣列，到configs/index.js中設定
import { pathsLocaleMap } from '@/config/client.config'
// 額外樣式檔案
import styles from './next-breadcrumb.module.css'

/**
 * NextBreadCrumb 搭配 useRouter 動態產生的麵包屑元件(breadcrumb)
 *
 * @component
 * @param {object} props
 * @param {boolean} [props.omitRoot=false] omit root node(home)
 * @param {JSX.Element} [props.homeIcon=<i className="bi bi-house-door-fill"></i>]
 * @param {boolean} [props.isHomeIcon=false] with home icon
 * @returns {JSX.Element}
 */
export default function NextBreadCrumb({
  omitRoot = false,
  homeIcon = <>&#8962;</>,
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

    // 3. 加上dom元素，套用bs5樣式
    const pathsDisplay = pathsLocale.map((v, i, array) => {
      // 第一個 與 數字類型(例如id)的最後結尾要忽略, 首頁不需要(首頁樣式要在render時獨立處理)
      if (i === 0 || v === '') return ''

      // 最後一個
      if (i === array.length - 1) {
        return (
          <li key={i} aria-current="page">
            {v}
          </li>
        )
      }

      // 其它中間樣式
      return (
        <li key={i}>
          <Link href={paths.slice(0, i + 1).join('/')}>{v}</Link>
        </li>
      )
    })

    return pathsDisplay
  }, [pathname])

  return (
    <nav aria-label="breadcrumb" style={{ lineHeight: '32px' }}>
      <ul className={styles['breadcrumb']}>
        {!omitRoot && (
          <li>
            <Link href="/">
              {!isHomeIcon ? pathsLocaleMap['home'] : homeIcon}
            </Link>
          </li>
        )}
        {getPathFormatLocale()}
      </ul>
    </nav>
  )
}
