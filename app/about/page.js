'use client'
import styles from '@/styles/about.module.scss'
export default function About() {
  return (
    <div className={`container py-5 ${styles.aboutPage}`}>
      {/* 像素風裝飾圖示 */}
      <div className={styles.pixelIcons}></div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="text-center mb-5">為什麼我需要創造這個網頁</h1>

          <div className={`card ${styles.card1} mb-4`}>
            <div className="card-body">
              <h2 className="card-title">💡 靈感來源😊😊</h2>
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
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">💇‍♀️ 離子燙藥水燙直步驟</h2>
              <ol className="list-group list-group-numbered">
                <li className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>噴濕頭髮</strong><br/>
                      <small className="text-muted">目的：讓毛鱗片打開</small>
                    </div>
                    <small className="text-muted">⏱️ 2-3分鐘</small>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>上第一劑</strong><br/>
                      <small className="text-muted">從最捲的地方開始上(例如接近頭皮的地方)逐步按下計時器的分圈，用尖尾梳將一縷髮絲纏繞7圈，拉一下停7秒放開，看有沒有回彈回去看看捲度的效果，有沒有觀察是否軟化，7圈至少5圈沒有回彈、6-7圈是比較鬆彈的話，就至少有80%軟化成功，此時會再停留3分鐘左右。</small>
                    </div>
                    <small className="text-muted">⏱️ 15-20分鐘</small>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>吹乾</strong><br/>
                      <small className="text-muted">用平板夾的時候，應該注意要髮片與頭皮切線成90度，才不會扁蹋(髮中髮尾諾曼用另外的配方)</small>
                    </div>
                    <small className="text-muted">⏱️ 10-15分鐘</small>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>用洗髮精洗頭</strong>
                    </div>
                    <small className="text-muted">⏱️ 5-8分鐘</small>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>上第二劑</strong><br/>
                      <small className="text-muted">停留10-15分鐘</small>
                    </div>
                    <small className="text-muted">⏱️ 10-15分鐘</small>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">❓ Q&A</h2>
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      隔多久燙一次？
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      我觀察自己大概每2個月其實就又會捲了、甚至一個月。如果每個月都要燙，應用直髮膏。
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      護髮產品是直接加在第二劑嗎？
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      一般的潤絲也可以加進去嗎？我買到的直髮第二劑是水狀的。需要更服貼一點的話不要買到水狀的!乳狀或霜狀因為有重量更可以將頭髮往下帶。水狀的話是不是只能等我洗髮的時候才用潤絲了？
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      水狀 vs 乳狀第二劑
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      <strong>水狀：</strong>吸收速度快但滲透性較差<br/>
                      <strong>乳狀：</strong>有重量更可以將頭髮往下帶<br/><br/>
                      「滲透性較差」意味著這種液體難以深入或穿透頭髮的內部結構，只停留在髮表面，無法深入到髮絲的皮質層，不能有效修復或改變髮絲的內部結構。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">⏱️ 時間紀錄步驟</h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">紀錄...一開始按下紀錄</li>
                <li className="list-group-item">結束髮根區以後按分圈</li>
                <li className="list-group-item">結束中層以後按分圈</li>
                <li className="list-group-item">結束外(上)層以後按分圈紀錄整體停留時間</li>
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

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">🛠️ 工具清單</h2>
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

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">💡 心得建議</h2>
              <div className="alert alert-info">
                <h5>剪髮注意事項</h5>
                <p>會在燙直以後再剪髮，因為拉直以後頭髮會看起來變長！</p>
                <p>剪髮時讓設計師將頭髮順到前面再修剪，才不會修太短。因為先把頭髮放在後面修剪很容易搬到前面看時太短！</p>
                <p>我的部分需要請設計師『接順』：臉頰兩側羽毛剪、髮尾剪齊或者低層次、斜瀏海眉上</p>
              </div>

              <div className="alert alert-warning">
                <h5>諾曼的做法</h5>
                <ul>
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

          <div className="card">
            <div className="card-body">
              <h2 className="card-title">📅 燙髮紀錄</h2>
              <p><strong>2024燙髮日期：</strong>大概4月還5月初一次、8月一次、2024/12/4</p>
              <p><strong>下次要準備：</strong>頭髮抗熱噴霧</p>
              <p className="text-muted"><strong>後悔：</strong>沒有單買膏狀第二劑</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}