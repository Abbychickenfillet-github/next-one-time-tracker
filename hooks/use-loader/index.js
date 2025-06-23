'use client'

import { useState, useContext, createContext, useEffect } from 'react'
import dynamic from 'next/dynamic'
// 可自訂載入動畫元件
const DefaultLoader = dynamic(() => import('./loaders/default-loader'), {
  ssr: false,
})
const TextLoader = dynamic(() => import('./loaders/text-loader'), {
  ssr: false,
})
// 可以取得目前的pathname和searchParams
import { usePathname, useSearchParams } from 'next/navigation'

// 全站的Context狀態
const LoaderContext = createContext(null)
// 定義在react devtool上的名稱
LoaderContext.displayName = 'LoaderContext'

/**
 * 延遲ms秒用，可以回傳值x，手動控制關閉有用
 */
export function delay(ms) {
  return function (x) {
    return new Promise((resolve) => setTimeout(() => resolve(x), ms))
  }
}

/**
 * 延遲ms秒用，手動控制關閉有用(相當於setTimeout的Promise版)
 */
export function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 全站的Context狀態
// loader是元件，可以放於全站版面上，要用時用showLoader控制
// close 代表幾秒後關閉
export const LoaderProvider = ({
  children,
  close = 2,
  global = false,
  CustomLoader = DefaultLoader,
  text = '', // 純文字訊息
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleChangeStart = () => {
      if (global) {
        setShow(true)
      }
    }

    const handleChangeEnd = () => {
      // auto close
      if (close && global) {
        timeout(close * 1000).then(() => setShow(false))
      }
    }

    handleChangeStart()

    return () => {
      handleChangeEnd()
    }
    // eslint-disable-next-line
  }, [pathname, searchParams])

  return (
    <LoaderContext.Provider
      value={{
        showLoader: () => {
          setShow(true)

          // auto close
          if (close) {
            timeout(close * 1000).then(() => setShow(false))
          }
        },
        hideLoader: () => (!close ? setShow(false) : null),
        loading: show,
        delay,
      }}
    >
      {children}
      <CustomLoader show={show} />
      {text && <TextLoader text={text} show={show} />}
    </LoaderContext.Provider>
  )
}

/**
 *
 * useAuth是一個hook，用來控制載入動畫的勾子
 *
 * @returns {{showLoader: Function, hideLoader: Function, loading:boolean, delay: Function}}
 */
export const useLoader = () => {
  const context = useContext(LoaderContext)

  if (!context) {
    throw new Error('useLoader must be used within LoadingProvider')
  }

  return context
}
