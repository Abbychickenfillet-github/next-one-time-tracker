'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
// import { useRouter } from 'next/navigation' // 未使用
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { isDev } from '@/config/client.config'

// 導入新的組件
import LinePayButton from '@/components/line-pay/LinePayButton'
import OrderForm from '@/components/line-pay/OrderForm'
import OrderSummary from '@/components/line-pay/OrderSummary'
// 載入loading元件 (未使用)
// import CssLoader from '@/components/css-loader'

export default function LinePayPage() {
  // 檢查是否登入
  const { isAuth, user } = useAuth()

  // 從line-pay回來後要進行loading，確認交易需要一小段時間 (未使用)
  // const [loading, setLoading] = useState(false)

  // 商品用狀態
  const [price, setPrice] = useState(100)
  const [quantity, setQuantity] = useState(2)

  // 計算總價
  const totalAmount = quantity * price

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

  // 處理訂單變更的回調函數
  const handlePriceChange = (newPrice) => {
    setPrice(newPrice)
  }

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity)
  }

  // 付款前的驗證
  const handleBeforePayment = () => {
    if (totalAmount <= 0) {
      toast.error('請輸入有效的金額')
      return false
    }
    return true
  }

  // 付款成功回調
  const handlePaymentSuccess = (data) => {
    console.log('付款準備完成:', data)
  }

  // 付款失敗回調
  const handlePaymentError = (error) => {
    console.error('付款處理失敗:', error)
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

  // 不再需要這個本地組件了，因為我們已經分離成獨立組件

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
      <div className="line-pay-page">
        <header className="page-header">
          <h1>Line Pay測試</h1>
          <p>
            本功能需要會員登入才能使用，會用到後端伺服器的session機制，這是為了付完款後返回後，需要訂單的金額作最後確認用的。
          </p>
          <div className="login-link">
            {isAuth ? (
              <Link href="/dashboard">前往儀表板</Link>
            ) : (
              <Link href="/user/login">連至會員登入頁</Link>
            )}
          </div>
        </header>

        <main className="page-content">
          <section className="auth-section">
            <OrderSummary authInfo={{ isAuth, user }} />
          </section>

          <section className="order-section">
            <h2>購買商品清單</h2>
            <OrderForm
              initialPrice={price}
              initialQuantity={quantity}
              onPriceChange={handlePriceChange}
              onQuantityChange={handleQuantityChange}
              disabled={false}
            />

            <div className="payment-section">
              <LinePayButton
                isAuth={isAuth}
                totalAmount={totalAmount}
                onBeforePayment={handleBeforePayment}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          </section>
        </main>
      </div>

      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
