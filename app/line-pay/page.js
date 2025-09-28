'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
// import { useRouter } from 'next/navigation' // 未使用
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Image from 'next/image'
import { isDev, apiURL } from '@/config/client.config'
// 載入loading元件 (未使用)
// import CssLoader from '@/components/css-loader'

export default function LinePayPage() {
  // 檢查是否登入
  const { isAuth } = useAuth()

  // 從line-pay回來後要進行loading，確認交易需要一小段時間 (未使用)
  // const [loading, setLoading] = useState(false)

  // 商品用狀態
  const [price, setPrice] = useState(100)
  const [quantity, setQuantity] = useState(2)

  // confirm回來用的，在記錄確認之後，line-pay回傳訊息與代碼，例如 (未使用)
  // {returnCode: '1172', returnMessage: 'Existing same orderId.'}
  // const [result, setResult] = useState({
  //   returnCode: '',
  //   returnMessage: '',
  // })

  // 取得網址參數，例如: ?transactionId=xxxxxx
  const searchParams = useSearchParams()
  // const router = useRouter() // 未使用

  if (isDev) console.log('transactionId', searchParams.get('transactionId'))

  // 導向至LINE Pay付款頁面
  const goLinePay = async () => {
    // 先連到API路由，取得LINE Pay付款網址
    const res = await fetch(
      `${apiURL}/payment/line-pay/request?amount=${quantity * price}`,
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

    console.log('🔍 API 回應:', resData)
    console.log('📊 回應狀態:', res.status)

    if (resData.status === 'success') {
      if (window.confirm('確認要導向至LINE Pay進行付款?')) {
        //導向至LINE Pay付款頁面
        window.location.href = resData.data.paymentUrl
      }
    } else {
      console.error('❌ 付款請求失敗:', resData)
      toast.error(`要求付款網址失敗: ${resData.message || '未知錯誤'}`)
    }
  }

  // 確認交易，處理伺服器通知line pay已確認付款，為必要流程 (未使用)
  // const _handleConfirm = async (transactionId) => {
  //   const res = await fetch(
  //     `${apiURL}/payment/line-pay/confirm?transactionId=${transactionId}`,
  //     {
  //       method: 'GET',
  //       // 讓fetch能夠傳送cookie
  //       credentials: 'include',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     }
  //   )

  //   const resData = await res.json()
  //   console.log(resData)

  //   if (resData.status === 'success') {
  //     // 呈現結果
  //     setResult(resData.data)
  //     // 顯示成功訊息
  //     toast.success('付款成功')
  //   } else {
  //     toast.error('付款失敗')
  //   }

  //   // 關閉loading動畫
  //   setTimeout(() => {
  //     // 關閉loading動畫
  //     setLoading(false)
  //     // 導向至訂單頁
  //     router.replace('/line-pay')
  //   }, 3000)
  // }

  // confirm回來用的
  // useEffect(() => {
  //   if (searchParams?.get('transactionId') && searchParams?.get('orderId')) {
  //     // 出現loading動畫
  //     setLoading(true)
  //     // 向server發送確認交易api
  //     handleConfirm(searchParams.get('transactionId'))
  //   } else {
  //     setLoading(false)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchParams])

  const orderDisplay = (
    <>
      <h2>購買商品清單</h2>
      <div>
        商品名稱和ID都是在後端路由直接設定範例用，這裡只有價格會變動。目前成功回應頁已改為callback路由。
        <br />
        數量:
        <input
          type="number"
          name="quantity"
          value={quantity === 0 ? '' : quantity}
          onChange={(e) => {
            setQuantity(Number(e.target.value))
          }}
        />
        單價:
        <input
          type="number"
          name="price"
          value={price === 0 ? '' : price}
          onChange={(e) => {
            setPrice(Number(e.target.value))
          }}
        />
      </div>
      <hr />
      <br />
      總價: {quantity * price}
      <br />
      {/* 圖檔都在public/line-pay資料夾 */}
      <Image
        alt=""
        src="/line-pay/LINE-Pay(h)_W85_n.png"
        width={85}
        height={25}
      />
      <button onClick={goLinePay}>前往付款</button>
    </>
  )

  // const _confirmOrder = (
  //   <>
  //     <h2>最後付款確認結果(returnCode=0000 代表成功): </h2>
  //     <p>{JSON.stringify(result)}</p>
  //     <p>
  //       <button
  //         onClick={() => {
  //           window.location.href = '/line-pay'
  //         }}
  //       >
  //         重新測試
  //       </button>
  //     </p>
  //   </>
  // )

  // if (loading)
  //   return (
  //     <>
  //       {/* <RotatingLines eight={40} width={40} /> */}
  //       <CssLoader />
  //       載入中，請稍後...
  //       <ToastContainer />
  //     </>
  //   )

  return (
    <>
      <h1>Line Pay測試</h1>
      <p>
        本功能目前與資料庫無關，但會用到後端伺服器的session機制，這是為了付完款後返回後，需要訂單的金額作最後確認用的。
      </p>
      <p>
        會員登入狀態: {isAuth ? '已登入' : '未登入'}
        <br />
        <Link href="/user">連至會員登入頁</Link>
      </p>
      <hr />
      {orderDisplay}
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
