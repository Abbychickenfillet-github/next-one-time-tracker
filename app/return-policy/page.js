'use client'
import styles from '@/styles/legal.module.scss'

export default function ReturnPolicy() {
  return (
    <div className={`container py-5 ${styles.legalPage}`}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className={styles.legalCard}>
            <div className="card-body">
              <h1 className="text-center mb-5">🔄 退換貨政策</h1>

              <div className={styles.section}>
                <p className="lead">
                  本網站由陳芸茜（以下簡稱「本網站經營者」）提供服務，並依照中華民國《消費者保護法》及其他相關法令之規定，處理退換貨事宜。
                </p>
              </div>

              <div className={styles.section}>
                <h3>一、七日鑑賞期（猶豫期）之排除適用</h3>
                <p>
                  依據《消費者保護法》及行政院頒布之《通訊交易解除權合理例外情事適用準則》規定，本網站所提供之軟體工具及數位服務，不適用七日鑑賞期之規定：
                </p>

                <div className={styles.warningBox}>
                  <h4>🚫 不適用七日鑑賞期的服務類型：</h4>
                  <ul>
                    <li>
                      <strong>經拆封的電腦軟體：</strong>{' '}
                      本網站提供的軟體工具，不論是以光碟、電子郵件下載連結或其他形式交付，在您取得並開始使用（視同拆封）後，即屬可複製之數位內容，無法回復原狀，故不適用七日鑑賞期。
                    </li>
                    <li>
                      <strong>
                        非以有形媒介提供的數位內容或一經提供即為完成的線上服務：
                      </strong>{' '}
                      本網站提供的軟體授權、數位內容或線上服務，經您事先同意提供後，因性質上已難以返還，故不適用七日鑑賞期。
                    </li>
                  </ul>
                </div>

                <div className={styles.importantBox}>
                  <p>
                    <strong>⚠️ 重要提醒：</strong>{' '}
                    一旦您透過本網站完成軟體服務或數位內容的購買、下載、啟用或開始使用，即代表服務已履行完畢，不得以任何理由要求退貨或解除契約。
                  </p>
                </div>
              </div>

              <div className={styles.section}>
                <h3>二、例外情況（瑕疵擔保）</h3>
                <p>
                  儘管排除鑑賞期，若發生以下情形，本網站經營者陳芸茜將依法承擔瑕疵擔保責任：
                </p>
                <ul>
                  <li>
                    服務或軟體工具本身有重大瑕疵、功能與描述嚴重不符（非因人為操作或非屬規格內應有的狀況）。
                  </li>
                  <li>收到之商品（若有實體交付物）與訂單內容不符。</li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3>三、申訴與處理流程</h3>
                <p>請於發生問題後七日內，透過以下方式聯絡本網站經營者：</p>

                <div className={styles.contactBox}>
                  <h4>📞 聯絡資訊</h4>
                  <p>
                    <strong>客服信箱：</strong> glitteroceaneyesca@gmail.com
                  </p>
                  <p>
                    <strong>客服電話：</strong> 0917167098
                  </p>
                </div>

                <div className={styles.requiredInfo}>
                  <h4>📋 申訴時需提供資訊：</h4>
                  <ul>
                    <li>姓名</li>
                    <li>訂單編號</li>
                    <li>聯絡電話</li>
                    <li>問題詳細描述及相關截圖</li>
                  </ul>
                </div>

                <p>
                  本網站經營者確認問題屬實後，將會提供後續處理方式（如：軟體修復、帳號重置、或依法辦理退款）。
                </p>
                <p>
                  退款事宜由陳芸茜負責處理，並透過特武設計工作室的收費機制進行退費程序。
                </p>
              </div>

              <div className={styles.footer}>
                <p className="text-muted">
                  <small>最後更新日期：2025年10月</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
