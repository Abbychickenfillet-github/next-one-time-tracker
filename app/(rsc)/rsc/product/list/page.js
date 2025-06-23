import React, { Suspense } from 'react'
import RscProductList from '../_components/rsc-product-list'
// import LoadingLayer from '@/components/loader-layer'
import CssLoader from '@/components/css-loader'

// 列表頁先載入分類、品牌，目前資料。
// 目前有問題: https://github.com/vercel/next.js/issues/53543
export default async function ListPage({ searchParams }) {
  const params = await searchParams
  console.log(params)
  const page = Number(params.page) || 1

  return (
    <>
      <h1>商品列表</h1>
      <hr />
      <Suspense key={page} fallback={<CssLoader />}>
        <RscProductList searchParams={searchParams} />
      </Suspense>
    </>
  )
}
