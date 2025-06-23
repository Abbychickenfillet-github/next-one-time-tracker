'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  useUserAddFav,
  useUserRemoveFav,
  useAuthGet,
} from '@/services/rest-client/use-user'
// 載入toast
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { isDev } from '@/config/client.config'
// 載入loading元件
// import { RotatingLines } from 'react-loader-spinner'
import CssLoader from '@/components/css-loader'
// 載入愛心圖示
import { BsHeartFill, BsHeart } from 'react-icons/bs'

export default function FavIcon({ id }) {
  // 由context取得auth-判斷是否能執行add或remove用，favorites決定愛心圖案用
  const { mutate } = useAuthGet()
  const { addFav, isMutating: isAdding } = useUserAddFav()
  const { removeFav, isMutating: isRemoving } = useUserRemoveFav()
  const { isAuth, favorites } = useAuth()
  const [loading, setLoading] = useState(false)

  // 新增我的最愛
  const handleAddFav = async (pid) => {
    // 沒登入不能用
    if (!isAuth) {
      return toast.error('會員才能使用!')
    }

    const res = await addFav(pid)
    const resData = await res.json()

    if (isDev) console.log('resData:', resData)

    if (resData.status === 'success') {
      // 更新context中favorites的狀態，頁面上的圖示才會對應更動
      mutate()
      // 顯示成功訊息
      toast.success(`商品 id=${pid} 新增成功!`)
    } else {
      // 顯示失敗訊息
      toast.error(`商品 id=${pid} 新增失敗!`)
    }
  }

  // 移除我的最愛
  const handleRemoveFav = async (pid) => {
    // 沒登入不能用
    if (!isAuth) {
      return toast.error('會員才能使用!')
    }

    const res = await removeFav(pid)
    const resData = await res.json()

    if (isDev) console.log('resData:', resData)

    if (resData.status === 'success') {
      // 更新context中favorites的狀態，頁面上的圖示才會對應更動
      mutate()
      // 顯示成功訊息
      toast.success(`商品 id=${pid} 刪除成功!`)
    } else {
      // 顯示失敗訊息
      toast.error(`商品 id=${pid} 刪除失敗!`)
    }
  }

  // 用loading來控制spinner動畫的顯示
  useEffect(() => {
    if (isRemoving || isAdding) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 600)
    }
  }, [isRemoving, isAdding])

  const spinner = (
    <CssLoader
      size={16}
      width={2}
      color="red"
      extraStyles={{ display: 'inline-block' }}
    />
  )

  // 實心愛心圖示
  const fillHeart = (
    <>
      <button
        style={{ padding: 0, border: 'none', background: 'none' }}
        disabled={loading}
        onClick={() => {
          handleRemoveFav(id)
        }}
      >
        {loading ? spinner : <BsHeartFill color="red" size={20} />}
      </button>
    </>
  )

  // 空心愛心圖示
  const emptyHeart = (
    <>
      <button
        style={{ padding: 0, border: 'none', background: 'none' }}
        disabled={loading}
        onClick={() => {
          handleAddFav(id)
        }}
      >
        {loading ? spinner : <BsHeart color="red" size={20} />}
      </button>
    </>
  )

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '5px',
        width: '25px',
        height: '25px',
      }}
    >
      {/* 由favorites狀態決定呈現實心or空心愛愛圖示 */}
      {favorites.includes(id) ? fillHeart : emptyHeart}
    </div>
  )
}
