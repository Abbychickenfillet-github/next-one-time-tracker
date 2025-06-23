'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../_styles/list.module.css'
import { serverURL } from '@/config/client.config'

export default function ProductListPage() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  // eslint-disable-next-line no-unused-vars
  const [perpage, setPerpage] = useState(10)
  const [total, setTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)

  // 這裡的data是undefined，因為還在載入中
  // eslint-disable-next-line no-unused-vars
  const [data, setData] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // 這裡的data是undefined，因為還在載入中
  const getProducts = async (page) => {
    try {
      const res = await fetch(`${serverURL}/api/products?page=${page}`)
      const data = await res.json()
      setData(data)
      setProducts(data?.data?.products)
      setTotal(data?.data?.total)
      setPageCount(data?.data?.pageCount)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsError(true)
    }
  }

  // didMount後，取得商品資料
  useEffect(() => {
    getProducts(page)
  }, [page])

  if (isError) return <div>發生錯誤</div>

  const loadingRender = <div>載入中...</div>

  const dataRender = (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <Link
            // 使用網址動態參數，例如: /product-fetch/detail/1
            href={`/product-fetch/detail/${product.id}`}
            // 如果要使用網址上的搜尋參數，例如: /product-fetch/detail/?productId=1
            // href={`/product-fetch/detail/?productId=${product.id}`}
          >
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  )

  const paginationRender = (
    <div className={styles.pagination}>
      <a
        onClick={(e) => {
          e.preventDefault()
          setPage(1)
        }}
        aria-hidden="true"
      >
        &laquo;
      </a>
      {pageCount &&
        Array(pageCount)
          .fill(1)
          .map((_, i) => {
            return (
              <a
                className={`${page === i + 1 ? styles.active : ''}`}
                key={i + 1}
                onClick={(e) => {
                  e.preventDefault()
                  setPage(i + 1)
                }}
                aria-hidden="true"
              >
                {i + 1}
              </a>
            )
          })}
      <a
        onClick={(e) => {
          e.preventDefault()
          setPage(pageCount)
        }}
        aria-hidden="true"
      >
        &raquo;
      </a>
    </div>
  )

  return (
    <>
      <h1>商品列表</h1>
      <hr />
      <p>
        總共有{total}筆資料 / 總頁數:{pageCount}
      </p>
      <p>目前在第{page}頁</p>
      <hr />
      <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
        上一頁
      </button>
      <button onClick={() => setPage(page + 1)} disabled={page >= pageCount}>
        下一頁
      </button>
      <hr />
      <section id="product-list">
        {isLoading ? loadingRender : dataRender}
      </section>
      <section id="pagination">{isLoading ? '' : paginationRender}</section>
    </>
  )
}
