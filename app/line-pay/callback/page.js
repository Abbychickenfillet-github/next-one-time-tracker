'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { isDev, apiURL } from '@/config/client.config'
// 載入loading元件
import CssLoader from '@/components/css-loader'

export default function LinePayPage() {
  // 檢查是否登入
  const { isAuth } = useAuth()

  // 從line-pay回來後要進行loading，確認交易需要一小段時間
  const [loading, setLoading] = useState(true)

  // confirm回來用的，在記錄確認之後，line-pay回傳訊息與代碼，例如
  // {returnCode: '1172', returnMessage: 'Existing same orderId.'}
  const [result, setResult] = useState({
    returnCode: '',
    returnMessage: '',
  })

  // 取得網址參數，例如: ?transactionId=xxxxxx
  const searchParams = useSearchParams()
  const router = useRouter()

  if (isDev) console.log('transactionId', searchParams.get('transactionId'))

  // 確認交易，處理伺服器通知line pay已確認付款，為必要流程
  const handleConfirm = async (transactionId) => {
    const res = await fetch(
      `${apiURL}/payment/line-pay/confirm?transactionId=${transactionId}`,
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
    console.log(resData)

    if (resData.status === 'success') {
      // 呈現結果
      setResult(resData.data)
      // 顯示成功訊息
      toast.success('付款成功')
    } else {
      toast.error('付款失敗')
    }

    // 關閉loading動畫
    setTimeout(() => {
      // 關閉loading動畫
      setLoading(false)
      // 導向至訂單頁
      router.replace('/line-pay/callback')
    }, 3000)
  }

  // confirm回來用的
  useEffect(() => {
    if (searchParams?.get('transactionId') && searchParams?.get('orderId')) {
      // 出現loading動畫
      setLoading(true)
      // 向server發送確認交易api
      handleConfirm(searchParams.get('transactionId'))
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const confirmOrder = (
    <>
      <h2>最後付款確認結果(returnCode=0000 代表成功): </h2>
      <p>{JSON.stringify(result)}</p>
      <p>
        <button
          onClick={() => {
            window.location.href = '/line-pay'
          }}
        >
          重新測試
        </button>
      </p>
    </>
  )

  if (loading)
    return (
      <>
        <CssLoader />
        載入中，請稍後...
        <ToastContainer />
      </>
    )

  return (
    <>
      <h1>Line Pay測試-回傳結果</h1>
      <p>
        本功能目前與資料庫無關，但會用到cookie-session機制(iron-session)，這是為了付完款後返回後，需要訂單的金額作最後確認用的。
      </p>
      <p>
        會員登入狀態: {isAuth ? '已登入' : '未登入'}
        <br />
        <Link href="/user">連至會員登入頁</Link>
      </p>
      <hr />
      {result.returnCode ? confirmOrder : ''}
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
