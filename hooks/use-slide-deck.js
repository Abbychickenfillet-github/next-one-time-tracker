'use client'

import { useCallback, useEffect, useState } from 'react'

// 把本站的捲動容器 main 當成投影片放映機：
// 1. 量出 main 的可視高度，寫成 deck 上的 CSS 變數 --deck-h，投影片用它當 min-height
// 2. 幫 main 加上 snapClass（內含 scroll-snap），一次停在一張
// 3. 用 IntersectionObserver 回報目前是哪一張（有 data-slide 屬性的元素）
// 4. 上下鍵與 PageUp、PageDown 切換投影片
// 5. 滾輪一次手勢只換一張：不管作業系統設定一格滾幾行、一格送出多大的 deltaY，
//    也不管觸控板慣性送出多少事件，都只換一張，避免一格滾輪跳過好幾張
//
// 參數從哪裡來（呼叫端是 app/intro/page.js 與 app/about/page.js）：
//   deckRef   頁面用 useRef(null) 建立的盒子，再由 JSX 的 ref={deckRef} 在畫面建好後
//             放進最外層那個 <div>。這裡拿到的是「盒子」，不是 <div> 本身，
//             所以第一次執行這個函式時 deckRef.current 還是 null
//   snapClass 頁面傳進來的 CSS Modules class 名稱字串（例如 styles.snapMain，
//             編譯後長得像 intro-module-scss-module__Y1C7wq__snapMain），內含 scroll-snap 規則
//
// 回傳給頁面：
//   active    目前在畫面上的是第幾張投影片，給 <SlideDots> 標示黃色圓點
//   goTo      點圓點時呼叫，捲到指定那一張
export default function useSlideDeck(deckRef, snapClass) {
  // active 的流轉：初始 0（第一張）→ 下面 IntersectionObserver 看到某張進入畫面一半以上
  // 就呼叫 setActive(那張的編號) → React 重新渲染 → 頁面把新的 active 傳給 SlideDots
  const [active, setActive] = useState(0)

  // useEffect 在「畫面已經建好」之後才執行，這時 deckRef.current 才是真正的 <div>。
  // 依賴 [deckRef, snapClass]：這兩個值不變就只執行一次，頁面離開時執行最後 return 的清理函式
  useEffect(() => {
    // deck：最外層容器（.introPage 或 .aboutPage），來自 deckRef 盒子裡的 <div>
    const deck = deckRef.current
    // main：全站 layout.js 裡的 <main>，從 deck 往外找最近的祖先 <main> 得到。
    // 它才是真正在捲動的元素（globals.scss 設了 overflow-y: auto），所以要量它、對它加 class
    const main = deck?.closest('main')
    // 任何一個還是 null（例如元件已卸載）就整個放棄，避免後面讀 null 的屬性而報錯
    if (!deck || !main) return

    // apply：把 main 目前的可視高度寫成 deck 上的 CSS 變數 --deck-h。
    // main.clientHeight 每次呼叫都重新讀，所以視窗大小變了再呼叫就會更新。
    // 效果：scss 的 min-height: var(--deck-h) 讓每張投影片至少剛好填滿一個畫面
    const apply = () =>
      deck.style.setProperty('--deck-h', `${main.clientHeight}px`)
    apply() // 先量一次，投影片一開始就有正確高度
    // ro（ResizeObserver）：瀏覽器在 main 的尺寸變動時，自動呼叫 apply 重新量
    const ro = new ResizeObserver(apply)
    ro.observe(main)
    // 另外監聽視窗 resize 當備援，因為有些情況（例如被縮放模擬）ResizeObserver 不一定觸發
    window.addEventListener('resize', apply)
    // 把 snapClass 加到 main 上，啟用 scroll-snap：捲動時自動停在每張投影片的起點
    main.classList.add(snapClass)

    // slides：deck 裡所有標了 data-slide="0"、"1"... 的投影片元素，轉成真正的陣列。
    // 之後在 onKey、currentIndex、onWheel 裡都用「陣列的第幾個」代表「第幾張投影片」
    const slides = [...deck.querySelectorAll('[data-slide]')]
    // io（IntersectionObserver）：監看每張投影片有沒有進入 main 的可視範圍。
    //   root: main       用 main 當「視窗」，不是整個瀏覽器視窗
    //   threshold: 0.5   投影片露出一半以上才算「進入」，避免捲動途中兩張同時被判定
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          // e.target 是被觀察的那個 <section>，dataset.slide 讀它的 data-slide 屬性（字串），
          // Number() 轉成數字後交給 setActive，這就是 active 的資料來源
          if (e.isIntersecting) setActive(Number(e.target.dataset.slide))
        })
      },
      { root: main, threshold: 0.5 }
    )
    slides.forEach((s) => io.observe(s))

    // onKey：鍵盤切換投影片。e 是瀏覽器傳進來的 KeyboardEvent
    const onKey = (e) => {
      // 使用者正在輸入文字或操作表單時（e.target 是按鍵當下的焦點元素），
      // 上下鍵屬於那個控制項，不能攔截，否則輸入框、拖曳條會失效
      const tag = e.target.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        e.target.isContentEditable
      )
        return
      // dir：把按鍵對應成方向。往下是 1，往上是 -1，其他按鍵查不到會是 undefined
      const dir = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key]
      if (!dir) return // 不是我們關心的按鍵就不處理，交還給瀏覽器
      e.preventDefault() // 阻止瀏覽器原本的「捲一小段」，改由下面精準換頁
      // mainTop：main 上緣在螢幕上的位置（像素），當作「投影片該對齊的基準線」
      const mainTop = main.getBoundingClientRect().top
      // half：main 高度的一半，用來容忍「還沒完全對齊」的程度
      const half = main.clientHeight / 2
      // cur：目前是第幾張。找第一張「上緣比基準線高出不超過半個畫面」的投影片：
      // 上緣離基準線的距離（s.top - mainTop）大於 -half，代表它還沒被捲過頭
      const cur = slides.findIndex(
        (s) => s.getBoundingClientRect().top - mainTop > -half
      )
      // 目標 = cur + dir，再夾在 0 到 slides.length - 1 之間，避免超出第一張或最後一張。
      // ?. 是萬一 findIndex 回傳 -1 找不到元素時不報錯
      slides[
        Math.min(slides.length - 1, Math.max(0, cur + dir))
      ]?.scrollIntoView({
        behavior: 'smooth',
      })
    }
    window.addEventListener('keydown', onKey)

    // ---- 滾輪：攔下原生捲動，改成「一次手勢換一張」----

    // reduceMotion：使用者的系統設定是否要求「減少動態效果」（布林值），來自瀏覽器的 matchMedia
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    // scrollOpts：換頁時傳給 scrollIntoView 的選項。要求減少動態就瞬間跳過去，否則平滑捲動
    const scrollOpts = { behavior: reduceMotion ? 'auto' : 'smooth' }
    // lockStart：最近一次「成功換頁」的時間點（毫秒）。初始 0 代表從沒換過，
    // 換頁當下被設成 now，用來算「換頁後過了多久」
    let lockStart = 0
    // lastWheel：最近一次收到滾輪事件的時間點（毫秒），每個事件都會更新，
    // 用來算「這個事件跟上一個事件間隔多久」，間隔很短就是同一次手勢（例如觸控板慣性）
    let lastWheel = 0

    // innerCanScroll：判斷滾輪底下有沒有「自己還能捲的元素」（例如橫向滑動的方案卡、
    // 有捲軸的文字框）。target 是 onWheel 的 e.target，down 是 onWheel 算出的方向
    const innerCanScroll = (target, down) => {
      // 從滾輪正下方的元素開始，一層一層往父元素找，找到 main 為止（不含 main 本身）
      for (let el = target; el && el !== main; el = el.parentElement) {
        // oy：這個元素實際套用的垂直 overflow 值，例如 'auto'、'scroll'、'visible'
        const oy = getComputedStyle(el).overflowY
        // 必須同時：設定成可以捲，而且內容真的比框還高（+1 容忍小數點誤差）
        if (
          (oy === 'auto' || oy === 'scroll') &&
          el.scrollHeight > el.clientHeight + 1
        ) {
          // atEnd：它是不是已經捲到最底（scrollTop 是已捲的距離，加上框高等於總高就到底了）
          const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
          // 往下：還沒到底才算「它還能吃掉這次滾動」。往上：scrollTop > 0 才還能往上捲
          if (down ? !atEnd : el.scrollTop > 0) return true
        }
      }
      return false // 底下沒有誰還能捲，這次滾動歸投影片放映機處理
    }

    // currentIndex：算出「現在最貼近 main 上緣的是第幾張」，回傳 slides 陣列的索引。
    // 跟 onKey 裡的 cur 不同：這裡找「距離最近」的，不是「第一張沒被捲過頭」的
    const currentIndex = () => {
      const mainTop = main.getBoundingClientRect().top
      let best = 0 // 目前距離最小的那張的索引，先假設是第一張
      let bestDist = Infinity // 目前找到的最小距離，從無限大開始，第一張一定會更新它
      slides.forEach((s, i) => {
        // d：這張投影片上緣離 main 上緣有多遠（取絕對值，上下都算）
        const d = Math.abs(s.getBoundingClientRect().top - mainTop)
        if (d < bestDist) {
          best = i
          bestDist = d
        }
      })
      return best
    }

    // onWheel：滾輪事件處理。e 是瀏覽器傳進來的 WheelEvent，
    // e.deltaY 是這次滾動的垂直量（正數往下），e.deltaX 是水平量，e.ctrlKey 是否按著 Ctrl
    const onWheel = (e) => {
      // 這三種情況不是「換頁意圖」，直接交還給瀏覽器：
      // Ctrl+滾輪是縮放頁面、deltaY 為 0 沒有垂直移動、水平量比垂直量大是橫向滑動
      if (
        e.ctrlKey ||
        e.deltaY === 0 ||
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
      )
        return
      // down：這次是往下滾（true）還是往上滾（false），後面全部靠它判斷方向
      const down = e.deltaY > 0
      // 滾輪底下有自己還能捲的元素就讓它先捲，不換頁
      if (innerCanScroll(e.target, down)) return

      // i：目前這張的索引。r 是它的位置矩形，m 是 main 的位置矩形，用來比較兩者的上下緣
      const i = currentIndex()
      const r = slides[i].getBoundingClientRect()
      const m = main.getBoundingClientRect()
      // 投影片比畫面高（內容太多）：往下時，它的下緣還在 main 下緣之外，代表還有內容沒看完；
      // 往上時，它的上緣已經被捲到 main 上緣之上，也代表還有內容在上面。
      // 這時不攔截，讓瀏覽器照原本方式捲（+2 / -2 容忍小數點誤差）
      if (down && r.bottom > m.bottom + 2) return
      if (!down && r.top < m.top - 2) return

      // 走到這裡確定要由我們處理：阻止瀏覽器原本的捲動
      // （因為 addEventListener 傳了 passive: false，這裡才允許 preventDefault）
      e.preventDefault()
      // now：現在的時間點（毫秒），performance.now() 是頁面開啟後經過的時間
      const now = performance.now()
      // 同一次手勢的判斷（數字單位都是毫秒）：
      //   sinceLock  距離上次換頁過了多久
      //   gap        距離上一個滾輪事件過了多久
      // 規則：換頁後 600 以內一律忽略。超過 600 之後，如果事件還連續
      // （間隔小於 120，例如觸控板慣性），也繼續忽略，但最多忽略到 1000。
      // 事件停了才算下一次手勢
      const sinceLock = now - lockStart
      const gap = now - lastWheel
      lastWheel = now // 不論有沒有換頁，都記下這個事件的時間，給下一個事件算 gap
      if (sinceLock < 600 || (gap < 120 && sinceLock < 1000)) return

      // next：目標投影片的索引。往下 +1、往上 -1，夾在 0 到最後一張之間
      const next = Math.min(slides.length - 1, Math.max(0, i + (down ? 1 : -1)))
      if (next === i) return // 已經在第一張還往上、或最後一張還往下，沒有地方可去
      lockStart = now // 記下換頁時間，開始 600 毫秒的冷卻
      slides[next].scrollIntoView(scrollOpts) // 平滑捲到目標投影片的起點
    }
    // passive: false 是「我會呼叫 preventDefault」的聲明。預設 wheel 監聽是 passive，
    // 呼叫 preventDefault 會被瀏覽器忽略並警告
    main.addEventListener('wheel', onWheel, { passive: false })

    // 清理函式：頁面離開（元件卸載）或依賴值改變時執行，把上面註冊過的東西全部撤銷，
    // 否則切到別的頁面後，main 還會被這個 hook 攔截滾輪、持續加 snap 規則
    return () => {
      main.removeEventListener('wheel', onWheel)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('resize', apply)
      window.removeEventListener('keydown', onKey)
      main.classList.remove(snapClass)
    }
  }, [deckRef, snapClass])

  // goTo：點圓點時呼叫，i 是圓點的編號，等於目標投影片的 data-slide 值。
  // 流程：從 deckRef 盒子取出最外層 <div> → 在它裡面找 data-slide="i" 的投影片 →
  // 平滑捲到它的起點。?. 在 deckRef.current 為 null 或找不到那張時直接什麼都不做，不報錯。
  // useCallback 讓 goTo 在 deckRef 不變時保持同一個函式，頁面把它傳給 <SlideDots> 時
  // 才不會每次重新渲染都產生新函式
  const goTo = useCallback(
    (i) => {
      deckRef.current
        ?.querySelector(`[data-slide="${i}"]`)
        ?.scrollIntoView({ behavior: 'smooth' })
    },
    [deckRef]
  )

  return { active, goTo }
}
