'use client'

import React, { useRef } from 'react'
import { isDev, apiURL } from '@/config/client.config'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/hooks/use-auth'

export default function EcpayPage() {
  // 檢查是否登入
  const { isAuth } = useAuth()
  // 建立ref，用來放置form表單
  const payFormDiv = useRef(null)
  // 建立ref，用來放置金額
  const amountRef = useRef(null)
  // 建立ref，用來放置商品名稱
  const itemsRef = useRef(null)

  // 建立form表單
  const createEcpayForm = (params, action) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = action
    for (const key in params) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = params[key]
      form.appendChild(input)
    }
    // 回傳form表單的物件參照
    return payFormDiv.current.appendChild(form)
    // 以下是直接送出表單的方式
    // form.submit()
  }

  const handleEcpay = async () => {
    // 先連到node伺服器後端，取得ECPay付款網址
    const res = await fetch(
      `${apiURL}/payment/ecpay?amount=${amountRef.current.value}&items=${itemsRef.current.value}`,
      {
        method: 'GET',
        // 讓fetch能夠傳送cookie
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    const resData = await res.json()

    if (isDev) console.log(resData)

    if (resData.status === 'success') {
      // 建立表單，回傳的是表單的物件參照
      const payForm = createEcpayForm(resData.data.params, resData.data.action)

      if (isDev) console.log(payForm)

      if (window.confirm('確認要導向至ECPay(綠界金流)進行付款?')) {
        //送出表單
        payForm.submit()
      }
    } else {
      toast.error('付款失敗')
    }
  }

  return (
    <>
      <h1>ECPay(綠界金流)測試頁</h1>
      <p>本功能目前與資料庫無關。</p>
      <p>
        會員登入狀態: {isAuth ? '已登入' : '未登入'}
        <br />
        <Link href="/user/login">連至會員登入頁</Link>
      </p>
      <hr />
      <div ref={payFormDiv}></div>
      <p>
        如果商品名稱有多筆，需在金流選擇頁一行一行顯示商品名稱的話，商品名稱請以符號(,)分隔。
      </p>
      商品名稱:{' '}
      <textarea
        type="text"
        defaultValue="乒乓蘇打餅x2包,韓國樂天骰子巧克力x3瓶"
        ref={itemsRef}
      />
      <br />
      總金額: <input type="number" defaultValue="1000" ref={amountRef} />
      <button onClick={handleEcpay}>付款</button>
      <ToastContainer />
    </>
  )
}
