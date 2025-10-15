'use client'
import styles from '@/styles/legal.module.scss'

export default function Terms() {
  return (
    <div className={`container py-5 ${styles.legalPage}`}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className={styles.legalCard}>
            <div className="card-body">
              <h1 className="text-center mb-5">📋 服務須知（會員服務條款）</h1>

              <div className={styles.section}>
                <h2>TimeLog 服務條款</h2>
                <p className="lead">
                  歡迎您使用由陳芸茜（以下簡稱「本網站經營者」）經營之
                  TimeLog（以下簡稱「本網站」）服務。
                </p>
                <p>
                  本服務條款構成您與本網站經營者之間具有法律效力之約定。在您註冊成為會員或使用本網站任何服務前，請務必詳細閱讀以下條款。當您完成註冊或開始使用本網站服務時，即視為您已閱讀、瞭解並同意接受本服務條款之所有內容。
                </p>
              </div>

              <div className={styles.section}>
                <h3>一、服務介紹與網站營運者資訊</h3>
                <div className={styles.infoBox}>
                  <p>
                    <strong>網站名稱：</strong> TimeLog
                  </p>
                  <p>
                    <strong>服務責任承擔者（網站開發者）：</strong> 陳芸茜
                  </p>
                  <p>
                    <strong>實質收費方：</strong> 特武設計工作室
                  </p>
                  <p>
                    <strong>客服信箱：</strong> glitteroceaneyesca@gmail.com
                  </p>
                  <p>
                    <strong>客服電話：</strong> 0917167098
                  </p>
                  <p>
                    <strong>聯絡地址：</strong> [請填寫陳芸茜的地址]
                  </p>
                  <p>
                    <strong>服務時間：</strong> [請填寫服務時間]
                  </p>
                </div>
              </div>

              <div className={styles.section}>
                <h3>二、會員帳號與密碼</h3>
                <ul>
                  <li>您承諾於本網站註冊時提供正確、最新且完整的個人資料。</li>
                  <li>
                    <strong>資訊安全承諾：</strong>{' '}
                    本網站承諾，您的使用者密碼將會被雜湊處理後存放於資料表，以保障您的密碼資訊安全。
                  </li>
                  <li>
                    您有義務妥善保管您的帳號及密碼，對於所有使用該帳號和密碼所從事之行為，應由您負擔相關法律責任。
                  </li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3>三、交易行為與服務性質</h3>
                <ul>
                  <li>本網站提供之商品或服務主要為軟體工具及數位內容。</li>
                  <li>收費將由特武設計工作室負責執行。</li>
                  <li>
                    關於軟體服務的退換貨，請參閱本網站另行公告之《退換貨政策》中七日鑑賞期之不適用規定。
                  </li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3>四、服務之停止或終止</h3>
                <ul>
                  <li>
                    本網站經營者保有在任何時間不經通知隨時修改、暫停或終止本服務之權利。
                  </li>
                  <li>
                    本網站的雲端託管平台為
                    zeabur。如因平台維護或其他因素導致服務暫停或中斷，本網站無法預先通知。
                  </li>
                  <li>
                    <strong>服務終止影響：</strong>{' '}
                    如本網站停止服務或終止營運，使用者將無法行使個人資料相關權利（如查詢、更正、刪除等），建議使用者自行備份重要資料。
                  </li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3>五、詐騙帳戶與資金凍結賠償責任</h3>
                <div className={styles.warningBox}>
                  <h4>⚠️ 重要責任條款</h4>
                  <p>
                    如使用者帳戶為詐騙帳戶，或使用者進行惡意轉帳至本網站收付帳戶，無論係故意或非故意行為，導致本網站收付帳戶（特武設計工作室）資金被凍結、限制或遭受其他損失者，使用者應負擔完全賠償責任。
                  </p>
                </div>
                <ul>
                  <li>
                    <strong>賠償範圍：</strong>{' '}
                    包括但不限於被凍結資金、相關手續費、法律費用、營業損失及其他衍生損失。
                  </li>
                  <li>
                    <strong>賠償對象：</strong>{' '}
                    特武設計工作室（本網站實質收費方）。
                  </li>
                  <li>
                    <strong>責任認定：</strong>{' '}
                    一旦發生資金凍結或限制，即推定使用者帳戶存在問題，使用者需自行舉證證明其無過失。
                  </li>
                  <li>
                    <strong>法律追償：</strong>{' '}
                    本網站經營者及特武設計工作室保留對使用者進行法律追償之權利。
                  </li>
                </ul>
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
