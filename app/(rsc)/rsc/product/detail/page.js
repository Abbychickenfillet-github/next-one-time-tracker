import React, { Suspense } from 'react'
import RscProductDetail from '../_components/rsc-product-detail'
// import LoadingLayer from '@/components/loader-layer'
import CssLoader from '@/components/css-loader'

export default async function DetailPage({ searchParams }) {
  const params = await searchParams
  console.log(params)
  const id = Number(params.id) || 1

  return (
    <>
      <h1>商品詳細頁</h1>
      <hr />
      <Suspense key={id} fallback={<CssLoader />}>
        <RscProductDetail searchParams={searchParams} />
      </Suspense>
    </>
  )
}
