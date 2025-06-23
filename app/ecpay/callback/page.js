'use client'

import React from 'react'

import { useSearchParams } from 'next/navigation'
import { isDev } from '@/config/client.config'
import Link from 'next/link'

export default function ECPayCallback() {
  // 取得網址參數，例如: ?RtnCode=xxxxxx
  const searchParams = useSearchParams()

  if (isDev) console.log('RtnCode', searchParams?.get('RtnCode'))

  return (
    <>
      <h1>ECPay(綠界金流) - 已完成付款頁</h1>
      <p>本頁利用next的api路由(/ecpay/api)來協助導向這頁。</p>
      <Link href="/ecpay">連至ECPay(綠界金流)測試頁</Link>
      <hr />
      <p>以下為回傳資料:</p>
      <p>交易編號: {searchParams?.get('MerchantTradeNo')}</p>
      <p>交易金額: {searchParams?.get('TradeAmt')}</p>
      <p>交易日期: {searchParams?.get('TradeDate')}</p>
      <p>付款日期: {searchParams?.get('PaymentDate')}</p>
      <p>付款方式: {searchParams?.get('PaymentType')}</p>
      <p>回應碼: {searchParams?.get('RtnCode')}</p>
      <p>回應訊息: {searchParams?.get('RtnMsg')}</p>
    </>
  )
}

// 返回的範例:
// http://localhost:3000/ecpay/callback?CustomField1=&CustomField2=&CustomField3=&CustomField4=&MerchantID=3002607&MerchantTradeNo=od20241130223942231&PaymentDate=2024%2F11%2F30+23%3A11%3A51&PaymentType=TWQR_OPAY&PaymentTypeChargeFee=0&RtnCode=1&RtnMsg=Succeeded&SimulatePaid=0&StoreID=&TradeAmt=1000&TradeDate=2024%2F11%2F30+22%3A39%3A42&TradeNo=2411302239425452&CheckMacValue=958DF6A1C508F2A90F04440AF0F464960A71E315EBA903A4FCD53C1517C043ED
