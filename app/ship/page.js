'use client'

import { useShip711StoreOpener } from './_hooks/use-ship-711-store'
// eslint-disable-next-line no-unused-vars
import { nextUrl, apiURL } from '@/config/client.config'

export default function ShipPage() {
  // useShip711StoreOpener的第一個傳入參數是"伺服器7-11運送商店用Callback路由網址"
  // 指的是node(express)的對應api路由。詳情請見說明文件:
  const { store711, openWindow, closeWindow } = useShip711StoreOpener(
    `${nextUrl}/ship/api`, // 直接用Next提供的api路由
    //`${apiUrl}/shipment/711`, // 也可以用express伺服器的api路由
    { autoCloseMins: 3 } // x分鐘沒完成選擇會自動關閉，預設5分鐘。
  )

  return (
    <>
      <h1>7-11 運送商店選擇</h1>
      <hr />
      <p>
        <button
          onClick={() => {
            openWindow()
          }}
        >
          選擇門市
        </button>
        <br />
        門市名稱: <input type="text" value={store711.storename} disabled />
        <br />
        門市地址: <input type="text" value={store711.storeaddress} disabled />
      </p>
      <hr />
      <h3>以下為測試</h3>
      <p>
        <button
          onClick={() => {
            closeWindow()
          }}
        >
          關閉跳出的7-11選擇視窗(測試用: 一般會自動關閉，除非意外並不需要)
        </button>
      </p>
      <p>
        得到的物件值如下(註:
        也可以觀察瀏覽器中的localStorage中有一個鍵(key)為`store711`的值(value)，會同步化被設定一致的。):
      </p>
      <p>{JSON.stringify(store711)}</p>
    </>
  )
}
