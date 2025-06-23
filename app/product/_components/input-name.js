import React, { useState, useCallback, useEffect } from 'react'
import InputIME from './input-ime'
import _ from 'lodash'

export default function InputName({ forceReset, nameLike, setNameLike }) {
  // 專用於Debounce(去抖動)的搜尋條件
  // 初始值使用nameLike，而不是空字串，是為了讓使用者在切換頁面時，可以保留搜尋條件
  const [nameLikeInput, setNameLikeInput] = useState(nameLike)
  // Debounce(去抖動)，讓使用者在一段時間中，不斷觸發相同事件的情境下，停止觸發綁定事件
  // debounceNameInput更動 => 會更動 nameLike
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceNameInput = useCallback(
    _.debounce((value) => {
      setNameLike(value)
    }, 500),
    []
  )

  useEffect(() => {
    if (forceReset) {
      setNameLikeInput(nameLike)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceReset])

  return (
    <>
      商品名稱{' '}
      <InputIME
        type="text"
        value={nameLikeInput}
        onChange={(e) => {
          setNameLikeInput(e.target.value)
          if (!forceReset) debounceNameInput(e.target.value)
        }}
        placeholder="請輸入商品名稱"
      />
    </>
  )
}
