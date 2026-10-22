'use client'
import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/about.module.scss'
import DecorativeIcons from '@/components/DecorativeIcons'
import InspirationAnimation from '@/components/InspirationAnimation'
import SmoothHairAnimation from '@/components/SmoothHairAnimation'
import StraighteningStepsAnimation from '@/components/StraighteningStepsAnimation'

// 每個區塊是一張投影片：標題用在右側的圓點導覽
const SLIDES = [
  '為什麼需要',
  '靈感',
  '燙直步驟',
  'Q&A',
  '紀錄步驟',
  '工具清單',
  '心得建議',
  '燙髮紀錄',
]

function Tabs({ tabs, value, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default function About() {
  const deckRef = useRef(null)
  const [active, setActive] = useState(0)
  const [inspireTab, setInspireTab] = useState('coil')
  const [stepsTab, setStepsTab] = useState('anim')

  // main 是這個站的捲動容器：量出它的高度當投影片高度，並開啟 scroll-snap
  useEffect(() => {
    const deck = deckRef.current
    const main = deck?.closest('main')
    if (!deck || !main) return
    const apply = () => deck.style.setProperty('--deck-h', `${main.clientHeight}px`)
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(main)
    window.addEventListener('resize', apply)
    main.classList.add(styles.snapMain)

    const slides = [...deck.querySelectorAll('[data-slide]')]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.slide))
        })
      },
      { root: main, threshold: 0.5 }
    )
    slides.forEach((s) => io.observe(s))

    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return
      const dir = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key]
      if (!dir) return
      e.preventDefault()
      const cur = slides.findIndex((s) => {
        const r = s.getBoundingClientRect()
        const m = main.getBoundingClientRect()
        return r.top - m.top > -m.height / 2
      })
      slides[Math.min(slides.length - 1, Math.max(0, cur + dir))]?.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)

    return () => {
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('resize', apply)
      window.removeEventListener('keydown', onKey)
      main.classList.remove(styles.snapMain)
    }
  }, [])

  const goTo = (i) => {
    deckRef.current
      ?.querySelector(`[data-slide="${i}"]`)
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={styles.aboutPage} ref={deckRef}>
      {/* 像素風裝飾圖示 */}
      <DecorativeIcons />

      <nav className={styles.dots} aria-label="頁面區塊">
        {SLIDES.map((name, i) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </nav>

      <section className={styles.slide} data-slide={0}>
        <div className={`card ${styles.card1} ${styles.cardZindex}`}>
          <div className="card-body">
            <h2 className="card-title">為什麼需要這個網站？</h2>
            <div className={styles.twoCol}>
              <div>
                <p className="card-text">
                  在現代數位時代，我們習慣使用各種工具來管理時間，但你是否發現一個問題？
                </p>
                <div className="alert alert-warning">
                  <h5>現有工具的不足</h5>
                  <ul className="mb-0">
                    <li className={styles.liHeight}>
                      <strong>Google Calendar：</strong>
                      只能記錄事件，無法精確到秒的時間戳
                    </li>
                    <li className={styles.liHeight}>
                      <strong>手機計時器：</strong>功能單一，無法記錄多步驟流程
                    </li>
                    <li className={styles.liHeight}>
                      <strong>筆記軟體：</strong>缺乏時間追蹤和統計分析功能
                    </li>
                    <li className={styles.liHeight}>
                      <strong>專業軟體：</strong>過於複雜，不適合日常簡單任務
                    </li>
                    <li className={styles.liHeight}>
                      <strong>低成本取代監視鏡頭分析行為：</strong>
                      不需要昂貴的監控設備，只需要一個簡單的網頁就能精確記錄時間
                    </li>
                    <li className={styles.liHeight}>
                      <strong>
                        手機計時器雖然有鬧鐘功能，但是無法記錄確切的時間：
                      </strong>
                      手機計時器只能提醒，無法提供精確的時間戳記錄和歷史追蹤
                    </li>
                    <li className={styles.liHeight}>
                      <strong>
                        AI雖然可以直接分析事件，但是對於時間的概念會錯誤：
                      </strong>
                      AI可能對時間順序和持續時間產生誤判，人工記錄更準確可靠
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <p className="card-text">
                  這就是為什麼我們創造了
                  TimeLog！我們提供了一個簡單、精確、實用的時間記錄解決方案，讓你能夠：
                </p>
                <ul>
                  <li className={styles.liHeight}>
                    <strong>精確到秒</strong>：記錄每個步驟的開始和結束時間
                  </li>
                  <li className={styles.liHeight}>
                    <strong>多步驟管理</strong>：同時追蹤多個進行中的任務
                  </li>
                  <li className={styles.liHeight}>
                    <strong>數據分析</strong>：了解時間分配，提升效率
                  </li>
                  <li className={styles.liHeight}>
                    <strong>雲端同步</strong>：資料永不丟失，多裝置同步
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.slide} data-slide={1}>
        <div className={`card ${styles.card1} ${styles.cardZindex}`}>
          <div className="card-body">
            <h2 className="card-title">靈感</h2>
            <div className={styles.twoCol}>
              <div>
                <p className="card-text">
                  在自己操作燙直頭髮的時候，發現自己是粗硬髮質，要判斷第一劑在依照包裝上標準指示時間判斷軟化是不夠的！用尖尾梳將一縷髮絲纏繞7圈，拉一下停7秒放開，看有沒有回彈回去看看捲度的效果，有沒有觀察是否軟化，7圈至少5圈沒有回彈、6-7圈是比較鬆彈的話，就至少有80%軟化成功，此時會再停留3分鐘左右。
                </p>
                <p className="card-text">
                  藥水影響髮質的時候時間是一分一秒在過的，因為要記錄精準的時間。所以做出了這個小功能，自用請朋友用都可以。
                </p>
                <p className="card-text">
                  每一個步驟的結束都可以在按下結束按鈕，步驟運行時間有可能重疊，符合生活中多工的實際情形。
                </p>
              </div>
              <div>
                <Tabs
                  tabs={[
                    { id: 'coil', label: '7 圈回彈測試' },
                    { id: 'smooth', label: '柔順成果' },
                  ]}
                  value={inspireTab}
                  onChange={setInspireTab}
                />
                {inspireTab === 'coil' ? <InspirationAnimation /> : <SmoothHairAnimation />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.slide} data-slide={2}>
        <div className={`card ${styles.cardZindex}`}>
          <div className="card-body">
            <div className={styles.titleRow}>
              <h2 className="card-title">離子燙藥水燙直步驟 trial</h2>
              <Tabs
                tabs={[
                  { id: 'anim', label: '動畫' },
                  { id: 'table', label: '表格' },
                ]}
                value={stepsTab}
                onChange={setStepsTab}
              />
            </div>
            {stepsTab === 'anim' ? (
              <StraighteningStepsAnimation />
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-sm mb-2">
                    <thead>
                      <tr>
                        <th>步驟</th>
                        <th>開始時間</th>
                        <th>結束時間</th>
                        <th>耗時</th>
                        <th>說明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>噴濕頭髮</strong>
                        </td>
                        <td>10:00:00</td>
                        <td>10:02:15</td>
                        <td>2分15秒</td>
                        <td>目的：讓毛鱗片打開</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>上第一劑 - 髮根區</strong>
                        </td>
                        <td>10:02:15</td>
                        <td>10:08:30</td>
                        <td>6分15秒</td>
                        <td>從最捲的地方開始</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>上第一劑 - 髮中區</strong>
                        </td>
                        <td>10:08:30</td>
                        <td>10:14:45</td>
                        <td>6分15秒</td>
                        <td>逐步上藥水，測試7圈回彈效果</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>上第一劑 - 髮尾區</strong>
                        </td>
                        <td>10:14:45</td>
                        <td>10:20:00</td>
                        <td>5分15秒</td>
                        <td>髮尾用較弱藥水，用尖尾梳測試整頭軟化程度</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>用洗髮精洗頭</strong>
                        </td>
                        <td>10:20:00</td>
                        <td>10:25:30</td>
                        <td>5分30秒</td>
                        <td>徹底清潔第一劑殘留</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>吹乾頭髮</strong>
                        </td>
                        <td>10:25:30</td>
                        <td>10:35:00</td>
                        <td>9分30秒</td>
                        <td>完全吹乾，準備上第二劑</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>上第二劑</strong>
                        </td>
                        <td>10:35:00</td>
                        <td>10:42:20</td>
                        <td>7分20秒</td>
                        <td>乳狀第二劑，讓頭髮充分吸收藥水</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>等待吸收</strong>
                        </td>
                        <td>10:42:20</td>
                        <td>10:47:20</td>
                        <td>5分00秒</td>
                        <td>讓第二劑充分滲透，濃稠度適中。用途是定型</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>完成</strong>
                        </td>
                        <td>10:47:20</td>
                        <td>-</td>
                        <td>-</td>
                        <td>整個流程完成</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <small className="text-muted">
                  <strong>總耗時：</strong>約 47 分鐘　<strong>注意：</strong>
                  第二劑建議使用乳狀或霜狀，有重量更可以將頭髮往下帶
                </small>
              </>
            )}
          </div>
        </div>
      </section>

      <section className={styles.slide} data-slide={3}>
        <div className={`card ${styles.cardZindex}`}>
          <div className="card-body">
            <h2 className="card-title">Q&A</h2>
            <div className="accordion" id="faqAccordion">
              <div className="accordion-item">
                <h3 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq1"
                  >
                    隔多久燙一次？
                  </button>
                </h3>
                <div
                  id="faq1"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    我觀察自己大概每2個月其實就又會捲了、甚至一個月。如果每個月都要燙，應用直髮膏。
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h3 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq2"
                  >
                    護髮產品是直接加在第二劑嗎？
                  </button>
                </h3>
                <div
                  id="faq2"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    一般的潤絲也可以加進去嗎？我買到的直髮第二劑是水狀的。需要更服貼一點的話不要買到水狀的!乳狀或霜狀因為有重量更可以將頭髮往下帶。水狀的話是不是只能等我洗髮的時候才用潤絲了？
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h3 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq3"
                  >
                    水狀 vs 乳狀第二劑
                  </button>
                </h3>
                <div
                  id="faq3"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    <strong>水狀：</strong>吸收速度快但滲透性較差
                    <br />
                    <strong>乳狀：</strong>有重量更可以將頭髮往下帶
                    <br />
                    <br />
                    「滲透性較差」意味著這種液體難以深入或穿透頭髮的內部結構，只停留在髮表面，無法深入到髮絲的皮質層，不能有效修復或改變髮絲的內部結構。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.slide} data-slide={4}>
        <div className={`card ${styles.cardZindex}`}>
          <div className="card-body">
            <h2 className="card-title">時間紀錄步驟</h2>
            <ul className={`list-group list-group-flush ${styles.cols2}`}>
              <li className="list-group-item">紀錄...一開始按下紀錄</li>
              <li className="list-group-item">結束髮根區以後按分圈</li>
              <li className="list-group-item">結束中層以後按分圈</li>
              <li className="list-group-item">
                結束外(上)層以後按分圈紀錄整體停留時間
              </li>
              <li className="list-group-item">去洗頭按分圈</li>
              <li className="list-group-item">結束洗頭按分圈</li>
              <li className="list-group-item">開始吹頭髮以後按分圈</li>
              <li className="list-group-item">吹乾放下吹風機以後按分圈</li>
              <li className="list-group-item">用平板夾開始按分圈</li>
              <li className="list-group-item">上第二劑以後開始按分圈</li>
              <li className="list-group-item">全部動作完成以後按分圈</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.slide} data-slide={5}>
        <div className={`card ${styles.cardZindex}`}>
          <div className="card-body">
            <h2 className="card-title">工具清單</h2>
            <div className="row">
              <div className="col-md-6">
                <h5>基本工具</h5>
                <ul>
                  <li>直髮膏</li>
                  <li>護髮油</li>
                  <li>塑膠寬齒扁梳</li>
                  <li>尖尾梳(買藥水通常會附贈)</li>
                  <li>鬃毛梳(好像會導致靜電)</li>
                  <li>塑膠碗(買藥水通常會附贈)</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5>保護用品</h5>
                <ul>
                  <li>耳罩(買藥水通常會附贈)</li>
                  <li>額頭貼紙</li>
                  <li>橡膠/塑膠手套</li>
                  <li>毛巾(第一劑洗完頭擦頭髮用)</li>
                  <li>一次性塑膠披肩</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.slide} data-slide={6}>
        <div className={`card ${styles.cardZindex}`}>
          <div className="card-body">
            <h2 className="card-title">心得建議</h2>
            <div className={styles.twoCol}>
              <div className="alert alert-info">
                <h5>剪髮注意事項</h5>
                <p>會在燙直以後再剪髮，因為拉直以後頭髮會看起來變長！</p>
                <p>
                  剪髮時讓設計師將頭髮順到前面再修剪，才不會修太短。因為先把頭髮放在後面修剪很容易搬到前面看時太短！
                </p>
                <p className="mb-0">
                  我的部分需要請設計師『接順』：臉頰兩側羽毛剪、髮尾剪齊或者低層次、斜瀏海眉上
                </p>
              </div>

              <div className="alert alert-warning">
                <h5>諾曼的做法</h5>
                <ul className="mb-0">
                  <li>有燙前深層洗髮把雜質跟矽靈排出來</li>
                  <li>燙前護髮1-2劑</li>
                  <li>會將頭髮加熱十分鐘讓頭髮整個吸收</li>
                  <li>髮中髮尾用另外的配方(髮尾用比較弱的藥水)</li>
                  <li>停留5分鐘才上髮尾藥水，目的讓兩部分的時間類似</li>
                  <li>諾曼用洗髮精再做清潔，才不會有沒清潔乾淨情形</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.slide} data-slide={7}>
        <div className={`card ${styles.cardZindex}`}>
          <div className="card-body">
            <h2 className="card-title">燙髮紀錄</h2>
            <p>
              <strong>2024燙髮日期：</strong>
              大概4月還5月初一次、8月一次、2024/12/4
            </p>
            <p>
              <strong>下次要準備：</strong>頭髮抗熱噴霧
            </p>
            <p className="text-muted mb-0">
              <strong>後悔：</strong>沒有單買膏狀第二劑
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
