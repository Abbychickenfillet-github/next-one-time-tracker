'use client'

import { useState, useEffect, useRef } from 'react'
import {
  useGetProductListCount,
  useProductState,
  useGetProductBrands,
  useGetProductCategories,
} from '@/services/rest-client/use-product'
import ProductList from './components/list'
import { useIntersectionObserver } from '@uidotdev/usehooks'
// 載入loading元件
// import { Oval } from 'react-loader-spinner'
import CssLoader from '@/components/css-loader'
// 導入所有條件元件
import InputName from '../_components/input-name'
import InputPrice from '../_components/input-price'
import SelectPerpage from '../_components/select-perpage'
import CheckboxsBrands from '../_components/checkboxs-brands'
import CheckboxsCategories from '../_components/checkboxs-categories'
import SelectSort from '../_components/select-sort'
import Link from 'next/link'

export default function ProductListPage() {
  // 是否開啟搜尋區域
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  // 第一次載入
  const [didMount, setDidMount] = useState(false)
  // 只有按下搜尋按鈕才會更新
  // eslint-disable-next-line no-unused-vars
  const [isDynamicSearch, setIsDynamicSearch] = useState(true)
  // 強制重置用
  const [forceReset, setForceReset] = useState(false)
  // 搜尋條件
  const [queryString, setQueryString] = useState('')
  // 搜尋條件，排除page
  const [queryStringNoPage, setQueryStringNoPage] = useState('')

  const { total, pageCount, isLoading, isError } =
    useGetProductListCount(queryString)
  // 獲得品牌資料
  const { brands } = useGetProductBrands()
  // 獲得分類資料
  const { mainCategories, subCategories } = useGetProductCategories()
  // 監聽是否進入視窗(捲軸)
  const [observerRef, entry] = useIntersectionObserver({
    threshold: 0,
    root: null,
    // 如果希望觀察到的元素在進入視圖前 50px 觸發，則需要增加根底部邊距：0px 0px 50px 0px。
    // 如果是希望元素在進入後根內部 50px 時觸發，則使用：0px 0px -50px 0px。
    rootMargin: '0px 0px 50px 0px',
  })

  // 在不同頁面之間共享條件(列表頁、商品頁)
  const { criteria, setCriteria, defaultCriteria } = useProductState()

  // 從context中取得目前記錄的共享條件
  const {
    page,
    perpage,
    nameLike,
    brandIds,
    categoryIds,
    priceGte,
    priceLte,
    sort,
    order,
  } = criteria
  // 記錄前一次的條件用來比對
  const criteriaRef = useRef(criteria)
  // (不使用)列表最後面的DIV，回復時要滾動到這裡
  // const lastListRef = useRef(null)
  // 用於設定條件
  const setCriteriaByName = (name, value) => {
    setCriteria((prev) => {
      return { ...prev, [name]: value }
    })
  }
  // 設定頁數用
  const setPage = (page) => setCriteriaByName('page', page)

  // 判斷是否並不是換頁，而是其它會影響頁數的條件有變動
  const isForceFirstPage = (criteria, newCriteria) => {
    for (const key in criteria) {
      // 如果條件有變，且不是頁數的變動，則強制回到第一頁
      if (newCriteria[key] !== criteria[key] && key !== 'page') {
        return true
      }
    }
    return false
  }

  // 判斷是否只有換頁
  const isOnlyPageChange = (criteria, newCriteria) => {
    for (const key in criteria) {
      // 如果條件有變，且不是頁數的變動，則返回false
      if (newCriteria[key] !== criteria[key] && key !== 'page') {
        return false
      }
    }

    // 如果頁數沒變動，回傳false
    if (criteria.page === newCriteria.page) {
      return false
    }

    return true
  }

  // 產生查詢字串
  const generateQueryString = (criteria, exceptPage = false) => {
    const query = {}
    for (const key in criteria) {
      // 略過page
      if (key === 'page' && exceptPage) continue

      // 這裡是將數字陣列轉為字串，轉換為snake_case名稱
      if (key === 'brandIds') {
        query['brand_ids'] = criteria[key].join(',')
        continue
      }
      if (key === 'categoryIds') {
        query['category_ids'] = criteria[key].join(',')
        continue
      }
      // 轉換為snake_case
      if (key === 'nameLike') {
        query['name_like'] = criteria[key]
        continue
      }

      if (key === 'priceGte') {
        query['price_gte'] = criteria[key]
        continue
      }

      if (key === 'priceLte') {
        query['price_lte'] = criteria[key]
        continue
      }

      query[key] = criteria[key]
    }

    return new URLSearchParams(query).toString()
  }

  // 判斷是否為預設條件
  // eslint-disable-next-line
  const isDefaultCriteria = () => {
    for (const key in criteria) {
      if (criteria[key] !== defaultCriteria[key]) {
        return false
      }
    }

    return true
  }

  // 初次載入時，取得所有資料
  useEffect(() => {
    setQueryString(generateQueryString(criteria))
    setQueryStringNoPage(generateQueryString(criteria, true))
    // 初次載入時，延遲1.2秒，讓didMount變為true
    if (!didMount) {
      setTimeout(() => {
        setDidMount(true)
      }, 1000)
    }
    // (不使用)已有載入頁面時，回連到這頁會自動滾動到最後一頁資料
    // if (!isDefaultCriteria()) {
    //   setTimeout(() => {
    //     lastListRef.current?.scrollIntoView({ behavior: 'smooth' })
    //   }, 1500)
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (criteria) => {
    const newCriteria = criteria

    // 用記錄在ref的條件與新的條件比對，如果除了是page外的變動，則強制回到第一頁
    if (isForceFirstPage(criteriaRef.current, criteria)) {
      newCriteria.page = 1
      setCriteriaByName('page', 1)
    }

    setQueryString(generateQueryString(newCriteria))
    setQueryStringNoPage(generateQueryString(newCriteria, true))
    // 記錄目前的條件，如果有進行搜尋的的話
    criteriaRef.current = criteria
  }

  // 當條件有變動時 => 更新queryString
  useEffect(() => {
    // 略過第一次載入
    if (!didMount) return

    // 從context中取得目前記錄的共享條件=>初始化所有欄位+queryString
    if (isDynamicSearch) {
      handleSearch(criteria)
    }

    // 如果並不是動態搜尋，則只有在換頁時才會觸發動態搜尋
    if (!isDynamicSearch && isOnlyPageChange(criteriaRef.current, criteria)) {
      handleSearch(criteria)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria])

  const list = []
  // 在頁數不為0時，才會開始將商品列表加入list
  if (pageCount > 0) {
    // page是從1開始，所以要從1開始
    for (let i = 1; i <= page; i++) {
      list.push(
        <ProductList
          // 因為page需要一頁一頁的載入，所以要傳入page
          page={i}
          // page本身也是資料的搜尋條件之一，所以要傳入queryStringNoPage
          queryStringNoPage={queryStringNoPage}
          key={i}
        />
      )
    }
  }

  // 當觸發點進入視窗時，且目前頁數小於總頁數時，則增加頁數
  useEffect(() => {
    console.log('effect', 21, page, pageCount, entry?.isIntersecting)

    if (entry?.isIntersecting && page < pageCount && pageCount > 0) {
      console.log('effect', 22)
      setPage(page + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, pageCount])

  if (isError) return <div>發生錯誤</div>

  const searchRender = (
    <>
      <InputName
        nameLike={nameLike}
        setNameLike={(value) => setCriteriaByName('nameLike', value)}
        forceReset={forceReset}
      />
      <SelectPerpage
        perpage={perpage}
        setPerpage={(value) => setCriteriaByName('perpage', value)}
      />
      <CheckboxsBrands
        brands={brands}
        brandIds={brandIds}
        setBrandIds={(value) => setCriteriaByName('brandIds', value)}
      />
      <CheckboxsCategories
        mainCategories={mainCategories}
        subCategories={subCategories}
        categoryIds={categoryIds}
        setCategoryIds={(value) => setCriteriaByName('categoryIds', value)}
      />
      <InputPrice
        priceGte={priceGte}
        priceLte={priceLte}
        setPriceGte={(value) => setCriteriaByName('priceGte', value)}
        setPriceLte={(value) => setCriteriaByName('priceLte', value)}
        forceReset={forceReset}
      />
      <SelectSort
        sort={sort}
        order={order}
        setSort={(value) => setCriteriaByName('sort', value)}
        setOrder={(value) => setCriteriaByName('order', value)}
      />
    </>
  )

  // 頁面載入中
  const loadingRender = <CssLoader />

  const dataRender = (
    <>
      <ul>{list}</ul>
    </>
  )

  return (
    <>
      <section
        style={{
          position: 'sticky',
          top: 0,
          padding: '10px 0px',
          backgroundColor: 'white',
        }}
      >
        <h1>商品列表(捲動載入)</h1>
        <Link href="/product/list">回到一般列表</Link>
        <br />
        <Link href="/product/list-loadmore">回到[載入更多]列表</Link>
        <br />
        <Link href="/product/list-is">回到[捲動載入]列表</Link>
        <hr />
        <p>
          目前在第{page}頁 / 總共有{total}筆資料 / 總頁數:{pageCount}
        </p>
        <hr />
        <button
          onClick={() => {
            setCriteria(defaultCriteria)
            setForceReset(true)
            setTimeout(() => {
              setForceReset(false)
            }, 0)
          }}
        >
          重置所有搜尋條件
        </button>
        <button
          onClick={() => {
            setIsSearchOpen(!isSearchOpen)
          }}
        >
          {isSearchOpen ? '關閉' : '開啟'}搜尋區域
        </button>
        <section
          id="search"
          style={{
            display: isSearchOpen ? 'block' : 'none',
            backgroundColor: 'lightgray',
            padding: '8px',
          }}
        >
          {searchRender}
        </section>
      </section>
      <section id="product-list">
        {isLoading ? loadingRender : dataRender}
      </section>
      {/* <div ref={lastListRef}></div> */}
      <div ref={observerRef} id="loadMore">
        {page < pageCount ? '' : isLoading ? '' : '無更多資料'}
      </div>
    </>
  )
}
