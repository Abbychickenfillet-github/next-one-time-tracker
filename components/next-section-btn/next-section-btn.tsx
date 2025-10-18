import React, { useEffect, useState } from 'react'

export default function NextSectionBtn() {
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    // 檢查是否滾動到底部
    function checkScrollPosition() {
      const mainElement = document.querySelector('main')
      if (!mainElement) return

      // scrollTop: 元素內容向上滾動的距離（像素）
      // 0 表示在頂部，數值越大表示滾動得越深。
      // 是會變動的數值
      const scrollTop = mainElement.scrollTop

      // scrollHeight: 元素內容的總高度（包含被滾動隱藏的部分）
      // 這是整個可滾動內容的完整高度。如果畫面沒有變長，也都是固定的
      const scrollHeight = mainElement.scrollHeight

      // clientHeight: 元素的可視區域高度（不包含滾動條）
      // 這是用戶實際能看到的內容區域高度。都是固定的
      const clientHeight = mainElement.clientHeight

      // 判斷是否接近底部（留 50px 的緩衝區）
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
      setIsAtBottom(isNearBottom)

      console.log('滾動位置檢查:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        isNearBottom,
      })
    }

    // 滾動按鈕點擊處理
    function handleScrollButtonClick() {
      console.log('滾動按鈕被點擊了！')

      const mainElement = document.querySelector('main')
      if (!mainElement) {
        console.log('找不到 main 元素')
        return
      }

      if (isAtBottom) {
        // 如果在底部，回到頂部
        console.log('回到頂部')
        mainElement.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      } else {
        // 否則滾動到下一個 section
        const currentScrollY = mainElement.scrollTop
        const viewportHeight = window.innerHeight
        const navbarHeight = 59

        const scrollDistance = viewportHeight - navbarHeight
        const targetScrollY = currentScrollY + scrollDistance

        console.log('滾動到下一個 section:', {
          currentScrollY,
          viewportHeight,
          scrollDistance,
          targetScrollY,
        })

        mainElement.scrollTo({
          top: targetScrollY,
          behavior: 'smooth',
        })
      }
    }

    // 找到按鈕元素並添加事件監聽器
    const button = document.querySelector('.scroll-to-next-btn')
    const mainElement = document.querySelector('main')

    if (button) {
      button.addEventListener('click', handleScrollButtonClick)
    }

    if (mainElement) {
      mainElement.addEventListener('scroll', checkScrollPosition)
      // 初始檢查
      checkScrollPosition()
    }

    // 清理函式：組件卸載時移除事件監聽器
    return () => {
      if (button) {
        button.removeEventListener('click', handleScrollButtonClick)
      }
      if (mainElement) {
        mainElement.removeEventListener('scroll', checkScrollPosition)
      }
    }
  }, [isAtBottom]) // 依賴 isAtBottom 狀態

  return (
    <button
      className={`scroll-to-next-btn ${isAtBottom ? 'at-bottom' : ''}`}
      title={isAtBottom ? '回到頂部' : '向下滾動'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {isAtBottom ? (
          // 回到頂部圖示（向上箭頭）
          <path
            d="M7 14L12 9L17 14"
            // MoveTo, LineTo
            // M7 14: 移動到起點 (7, 14) - 箭頭左側底部
            // L12 9: 畫線到 (12, 9) - 箭頭頂部尖端
            // L17 14: 畫線到 (17, 14) - 箭頭右側底部
            // 形成一個向上的箭頭形狀
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          // 向下滾動圖示（向下箭頭）
          <path
            d="M7 10L12 15L17 10"
            // M7 10: 移動到起點 (7, 10) - 箭頭左側頂部
            // L12 15: 畫線到 (12, 15) - 箭頭底部尖端
            // L17 10: 畫線到 (17, 10) - 箭頭右側頂部
            // 形成一個向下的箭頭形狀
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}
