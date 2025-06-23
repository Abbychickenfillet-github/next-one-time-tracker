'use client'

import {
  useAuthGet,
  useUserUpdateProfile,
} from '@/services/rest-client/use-user'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'
import PreviewUploadImage from './_components/preview-upload-image'
import TWZipCode from './_components/tw-zipcode'
import CssLoader from '@/components/css-loader'
// 載入loading元件
// import { Oval } from 'react-loader-spinner'

// 定義要在此頁呈現/編輯的會員資料初始物件
const initUserProfile = {
  name: '',
  bio: '',
  sex: '',
  phone: '',
  avatar: '',
  birth: '',
  postcode: '',
  address: '',
}

export default function ProfilePage() {
  const { mutate } = useAuthGet()
  const { updateProfile } = useUserUpdateProfile()
  // 會員資料在user.profile中
  const { isAuth, user, isLoading } = useAuth()
  const [profileInput, setProfileInput] = useState(initUserProfile)

  // 輸入一般資料用
  const handleFieldChange = (e) => {
    setProfileInput({ ...profileInput, [e.target.name]: e.target.value })
  }

  // 送出表單用
  const handleSubmit = async (e) => {
    // 阻擋表單預設送出行為
    e.preventDefault()

    // 這裡可以作表單驗証

    // 送到伺服器進行更新 更新會員資料用，不包含avatar
    const res = await updateProfile(profileInput)
    const resData = await res.json()
    console.log('resData', resData)

    // console.log(res.data)
    if (resData.status === 'success') {
      // 重新取得會員資料
      mutate()
      toast.success('會員資料修改成功')
    } else {
      toast.error('會員資料修改失敗')
    }
  }

  // 載入完成後向要會員資料
  useEffect(() => {
    if (!isAuth) return

    // eslint-disable-next-line
    const { avatar, ...rest } = user.profile
    setProfileInput(rest)
    // eslint-disable-next-line
  }, [isAuth])

  // 未登入時，不會出現頁面內容
  if (!isAuth) return <></>
  // 載入中動畫
  if (isLoading) return <CssLoader />

  return (
    <>
      <h1>會員資料修改(一般)</h1>
      <hr />
      <p>
        規則: username與email不能修改(這與註冊機制或網站會員的安全機制的有關)
      </p>
      <p>
        注意: 密碼不在這裡修改，因機制不一樣，在
        <Link href="/user/profile-password">會員資料修改(密碼)</Link>
      </p>
      <p>
        <Link href="/user">會員登入認証&授權測試(JWT)</Link>
      </p>
      <hr />
      {/* 上傳圖片元件自行上傳檔案用 */}
      <PreviewUploadImage />
      <hr />
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            姓名
            <input
              type="text"
              name="name"
              value={profileInput.name}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <p>
          姓別
          <label>
            <input
              type="radio"
              name="sex"
              value="男"
              checked={profileInput.sex === '男'}
              onChange={handleFieldChange}
            />
            男
          </label>
          <label>
            <input
              type="radio"
              name="sex"
              value="女"
              checked={profileInput.sex === '女'}
              onChange={handleFieldChange}
            />
            女
          </label>
          <label>
            <input
              type="radio"
              name="sex"
              value=""
              checked={profileInput.sex === ''}
              onChange={handleFieldChange}
            />
            不提供
          </label>
        </p>
        <p>
          <label>
            電話
            <input
              type="text"
              name="phone"
              value={profileInput.phone}
              onChange={handleFieldChange}
              maxLength={10}
            />
          </label>
        </p>
        <p>
          縣市鄉鎮
          <TWZipCode
            initPostcode={profileInput.postcode}
            onPostcodeChange={(country, township, postcode) => {
              setProfileInput({ ...profileInput, postcode })
            }}
          />
        </p>

        <p>
          <label>
            地址
            <input
              type="text"
              name="address"
              value={profileInput.address}
              onChange={handleFieldChange}
              maxLength={50}
            />
          </label>
        </p>
        <p>
          <label>
            生日
            <input
              type="date"
              name="birth"
              value={profileInput.birth}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <p>
          <label>
            自我介紹
            <textarea
              name="bio"
              value={profileInput.bio}
              onChange={handleFieldChange}
            />
          </label>
        </p>
        <br />
        <button type="submit">修改</button>
        <br />
      </form>
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
