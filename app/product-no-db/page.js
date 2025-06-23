'use client'

import React, { useState, useRef } from 'react'
import originData from './_data/Product.json'
import _ from 'lodash'

export default function ProductNoDbPage() {
  // chunk(originData, 10)是將originData分成10筆一組，用來模擬分頁的資料結構(預設每頁10筆資料)
  const [products, setProducts] = useState(_.chunk(originData, 10))
  // 記錄目前在第幾頁
  const [page, setPage] = useState(1)
  // 記錄目前經過搜尋後的資料筆數(預設是全部資料筆數)
  const [count, setCount] = useState(originData.length)
  // 總共有多少頁計算(這可能需要用於分頁列的呈現)
  const pageCount = products.length

  // 排序的select元素
  const sortByRef = useRef(null) // default value is ''
  // 每頁幾筆的select元素
  const perPageRef = useRef(null) // default value is 10
  // 記錄form的submit按鈕(直接觸發form的submit事件用)
  const formSubmitBtnRef = useRef(null)

  // 品牌選項(也可以用json導入)
  const brandOptions = [
    {
      id: 1,
      name: 'Nike',
    },
    {
      id: 2,
      name: 'adidas',
    },
    {
      id: 3,
      name: 'PUMA',
    },
    {
      id: 4,
      name: 'New Balance',
    },
  ]

  // 分類選項(也可以用json導入)
  const categoryOptions = [
    { id: 1, name: '服飾', parentId: null },
    { id: 2, name: '鞋類', parentId: null },
    { id: 3, name: '配件', parentId: null },
    { id: 4, name: '短袖上衣', parentId: 1 },
    { id: 5, name: '短褲', parentId: 1 },
    { id: 6, name: '長袖上衣', parentId: 1 },
    { id: 7, name: '長褲', parentId: 1 },
    { id: 8, name: '外套', parentId: 1 },
    { id: 9, name: '慢跑鞋', parentId: 2 },
    { id: 10, name: '籃球鞋', parentId: 2 },
    { id: 11, name: '包款', parentId: 3 },
    { id: 12, name: '帽類', parentId: 3 },
  ]

  // 搜尋功能(所有form送出後都會觸發)，三個傳入參數都要在form表單觸發onSubmit事件時傳入
  const handleSearch = (keyword = '', brandId = 0, categoryIds = []) => {
    // 每次搜尋都需要回到第一頁
    setPage(1)

    // 排序的值，直接用ref取得
    const sortBy = sortByRef.current.value
    // 每頁幾筆的值，直接用ref取得
    const perPage = perPageRef.current.value

    // 這裡使用lodash的連鎖語法(chain)來處理資料，最後進行chunk分頁產生分頁資料陣列
    // 每次都要從originData開始進行運算，每經過一次連鎖會返回一個新陣列，不會改變原始資料
    const newProducts = _.chain(originData)
      .filter((product) => {
        // keyword 不分英文大小寫(case-insensitive)
        return product.name.toLowerCase().includes(keyword.toLowerCase())
      })
      .filter((product) => {
        // brand (單選)
        // 都沒有選擇(或選0)就代表全部顯示
        if (brandId === 0) return true
        // 有選擇就顯示選擇的品牌
        return brandId === product.brandId
      })
      .filter((product) => {
        // categories (多選)
        // 都沒有選擇(空陣列)就顯示全部顯示
        if (categoryIds.length === 0) return true
        // 有選擇就顯示選擇的分類
        return categoryIds.includes(product.categoryId)
      })
      .sortBy((product) => {
        // price:asc(低到高)、price:desc(高到低)排序
        if (sortBy === 'price:asc') {
          return product.price
        } else if (sortBy === 'price:desc') {
          return -product.price
        }
      })
      .value()

    // 更新總筆數
    setCount(newProducts.length)

    // 重新分頁後，更新products狀態，觸發重新渲染
    setProducts(_.chunk(newProducts, perPage))
  }

  // 用onSubmit來獲取表單的值，這用於可以提交的form表單中
  // 利用FormData是一種技巧性的作法，對於表單元素獲得值比較方便，尤其是多選時的checkbox群組
  const handleSubmit = (e) => {
    // 防止表單提交後刷新頁面
    e.preventDefault()

    // 建立FormData物件
    const formData = new FormData(e.target)
    // 得到keyword文字輸入框欄位的值
    const keyword = formData.get('keyword')
    // 得到radio的值，轉為數字(在產品資料中的brandId是數字類型)
    const brandId = formData.get('brand') ? Number(formData.get('brand')) : 0
    // 得到所有checkbox的值，轉為數字陣列(在產品資料中的categoryId是數字類型)
    const categoryIds = formData.getAll('categories').map((v) => Number(v))

    // 除錯用
    console.log('keyword:', keyword)
    console.log('brandIds:', brandId)
    console.log('categoryIds:', categoryIds)

    // 執行搜尋功能
    handleSearch(keyword, brandId, categoryIds)
  }

  return (
    <>
      <h1>商品列表(無連接後端與資料庫)</h1>
      <p>
        此範例展示直接用json格式的商品資料，在前端頁面直接進行各種搜尋、排序、分頁
        。不使用`useEffect`進行狀態連鎖更動，而是直接在表單提交時進行搜尋，但用`lodash`的專門用於集合或陣列的資料的chain(連鎖)來處理資料。程式碼混合了useState、useRef等用於表單元素ui的操作。
      </p>
      <hr />
      <form onSubmit={handleSubmit}>
        關鍵字: <input type="text" name="keyword" />
        <br />
        品牌:(單選)
        <label>
          <input type="radio" name="brand" value="0" />
          全部
        </label>
        {brandOptions.map((brand) => (
          <label key={brand.id}>
            <input type="radio" name="brand" value={brand.id} />
            {brand.name}
          </label>
        ))}
        <br />
        分類:(多選):
        {categoryOptions
          .filter((v) => v.parentId)
          .map((category) => (
            <label key={category.id}>
              <input type="checkbox" name="categories" value={category.id} />
              {category.name}
            </label>
          ))}
        <br />
        <button type="submit" ref={formSubmitBtnRef}>
          搜尋
        </button>
      </form>
      <hr />
      排序:{' '}
      <select ref={sortByRef} onChange={() => formSubmitBtnRef.current.click()}>
        <option value="">預設</option>
        <option value="price:asc">Price(ASC-低到高)</option>
        <option value="price:desc">Price(DESC-高到低)</option>
      </select>
      <br />
      每頁幾筆:
      <select
        ref={perPageRef}
        onChange={() => formSubmitBtnRef.current.click()}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
      <br />
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => {
          if (page > 1) setPage(page - 1)
        }}
      >
        上一頁
      </button>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => {
          if (page < pageCount) setPage(page + 1)
        }}
      >
        下一頁
      </button>
      第 {page} / {pageCount} 頁 / 每頁: {perPageRef?.current?.value || 10} 筆/
      共 {pageCount} 頁/ 共 {count} 筆
      <hr />
      <ul>
        {page - 1 >= 0 &&
          page <= pageCount &&
          products[page - 1].map((product, index) => (
            <li key={index}>
              {product.name}(${product.price})
            </li>
          ))}
      </ul>
    </>
  )
}
