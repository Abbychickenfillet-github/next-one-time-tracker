import React, { useState, useEffect } from 'react'
import { avatarURL } from '@/config/client.config'
import {
  useAuthGet,
  useUserUpdateAvatar,
} from '@/services/rest-client/use-user'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// 載入loading元件
// import { Oval } from 'react-loader-spinner'
import Image from 'next/image'
import CssLoader from '@/components/css-loader'

export default function PreviewUploadImage() {
  const { updateAvatar } = useUserUpdateAvatar()
  const { mutate } = useAuthGet()
  const { isAuth, user, isLoading } = useAuth()
  // 預覽圖片
  const [preview, setPreview] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  // 預設圖片
  let avatarImg = user?.profile?.avatar ? user.profile.avatar : 'default.png'

  avatarImg = avatarImg.includes('http')
    ? avatarImg
    : avatarURL + '/' + avatarImg

  // 選擇檔案時
  const handleFileChang = (e) => {
    const file = e.target.files[0]

    if (file) {
      setSelectedFile(file)
    } else {
      setSelectedFile(null)
    }
  }

  // 上傳頭像用，有選擇檔案時再上傳
  const handleAvatarChange = async () => {
    const formData = new FormData()
    // 對照server上的檔案名稱 req.files.avatar
    formData.append('avatar', selectedFile)

    const res = await updateAvatar(formData)
    const resData = await res.json()

    if (resData.status === 'success') {
      // 重新取得會員資料
      mutate()
      toast.success('會員頭像修改成功')
    }
  }

  // 當選擇檔案更動時建立預覽圖
  useEffect(() => {
    if (!selectedFile) {
      setPreview('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    // 圖片更動時上傳
    handleAvatarChange()

    // 當元件unmounted時清除記憶體
    return () => URL.revokeObjectURL(objectUrl)
    // eslint-disable-next-line
  }, [selectedFile])

  // 未登入時，不會出現頁面內容
  if (!isAuth) return <></>
  // 載入中動畫
  if (isLoading) return <CssLoader />

  return (
    <div className="image-upload">
      <label htmlFor="file-input">
        <Image
          priority
          src={preview ? preview : avatarImg}
          alt=""
          width="200"
          height="200"
          unoptimized
        />
      </label>
      <input
        id="file-input"
        style={{ display: 'none' }}
        type="file"
        name="file"
        onChange={handleFileChang}
      />
      <div>
        <p>點按頭像可以選擇新照片</p>
      </div>
    </div>
  )
}
