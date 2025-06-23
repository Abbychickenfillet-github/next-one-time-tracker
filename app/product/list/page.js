'use client'

import { useState, useEffect, useRef } from 'react'
import {
  useGetProductListAll,
  useProductState,
  useGetProductBrands,
  useGetProductCategories,
} from '@/services/rest-client/use-product'
import Link from 'next/link'
import styles from '../_styles/list.module.css'
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

export default function ProductListPage() {
  // 第一次載入
  const [didMount, setDidMount] = useState(false)
  // 只有按下搜尋按鈕才會更新
  const [isDynamicSearch, setIsDynamicSearch] = useState(true)
  // 強制重置用
  const [forceReset, setForceReset] = useState(false)
  // 搜尋條件
  const [queryString, setQueryString] = useState('')
  // 獲得所有資料，包含總筆數、總頁數…
  const { total, products, pageCount, isLoading, isError } =
    useGetProductListAll(queryString)
  // 獲得品牌資料
  const { brands } = useGetProductBrands()
  // 獲得分類資料
  const { mainCategories, subCategories } = useGetProductCategories()
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
  // 用於設定條件
  const setCriteriaByName = (name, value) => {
    setCriteria((prev) => {
      return { ...prev, [name]: value }
    })
  }

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
  const generateQueryString = (criteria) => {
    const query = {}
    for (const key in criteria) {
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

  // 初次載入時，取得所有資料
  useEffect(() => {
    setQueryString(generateQueryString(criteria))
    // 初次載入時，延遲1.2秒，讓didMount變為true
    if (!didMount) {
      setTimeout(() => {
        setDidMount(true)
      }, 1200)
    }
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

  // 載入中
  const loadingRender = <div>載入中...</div>

  // 資料渲染
  const dataRender = (
    <ul>
      {products?.map((product) => (
        <li
          key={product.id}
          style={{
            borderColor: 'gray',
            borderStyle: 'solid',
            borderWidth: '1px',
            padding: '20px',
          }}
        >
          <Link
            // 也可以使用搜尋參數的方式
            //href={`/product/detail?productId=${product.id}`
            // 使用動態路由的方式
            href={`/product/detail/${product.id}`}
          >
            {product.name}/({product.price})
          </Link>
        </li>
      ))}
    </ul>
  )

  // 分頁
  const paginationRender = (
    <div className={styles.pagination}>
      <a
        onClick={(e) => {
          e.preventDefault()
          setCriteriaByName('page', 1)
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
                  setCriteriaByName('page', i + 1)
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
          setCriteriaByName('page', pageCount)
        }}
        aria-hidden="true"
      >
        &raquo;
      </a>
    </div>
  )

  // 頁面載入中
  if (!didMount) {
    return <CssLoader />
  }
  // return (
  //   <Oval
  //     visible={true}
  //     height="80"
  //     width="80"
  //     color="#4fa94d"
  //     ariaLabel="oval-loading"
  //     wrapperStyle={{}}
  //     wrapperClass=""
  //   />
  // )

  return (
    <>
      <h1>商品列表</h1>
      <Link href="/product/list">回到一般列表</Link>
      <br />
      <Link href="/product/list-loadmore">回到[載入更多]列表</Link>
      <br />
      <Link href="/product/list-is">回到[捲動載入]列表</Link>
      <br />
      <input
        type="checkbox"
        checked={isDynamicSearch}
        onChange={() => {
          setIsDynamicSearch(!isDynamicSearch)
        }}
      />{' '}
      動態搜尋
      <button disabled={isDynamicSearch} onClick={() => handleSearch(criteria)}>
        搜尋
      </button>
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
        重置
      </button>
      <section id="search">{searchRender}</section>
      <hr />
      <button
        onClick={() => setCriteriaByName('page', page - 1)}
        disabled={page <= 1}
      >
        上一頁
      </button>
      <button
        onClick={() => setCriteriaByName('page', page + 1)}
        disabled={page >= pageCount}
      >
        下一頁
      </button>
      總共有{total}筆資料 / 總頁數:{pageCount} / 目前在第{page}頁
      <hr />
      <section id="product-list">
        {isLoading ? loadingRender : dataRender}
      </section>
      <section id="pagination">
        {isLoading || products?.length === 0 ? '' : paginationRender}
      </section>
    </>
  )
}
