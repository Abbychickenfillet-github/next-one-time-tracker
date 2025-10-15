'use client'
import styles from '@/styles/legal.module.scss'

export default function PrivacyPolicy() {
  return (
    <div className={`container py-5 ${styles.legalPage}`}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className={styles.legalCard}>
            <div className="card-body">
              <h1 className="text-center mb-5">🔒 隱私權政策</h1>

              <div className={styles.section}>
                <p className="lead">
                  本網站由陳芸茜（以下簡稱「本網站經營者」）負責經營。本隱私權政策旨在說明本網站如何蒐集、處理、利用您的個人資料。
                </p>
              </div>

              <div className={styles.section}>
                <h3>一、個人資料的蒐集、處理及利用</h3>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <h4>📊 資料蒐集目的</h4>
                    <p>
                      本網站經營者基於會員管理、網路購物、消費者服務、資訊管理等目的，蒐集您的個人資料。
                    </p>
                  </div>

                  <div className={styles.infoItem}>
                    <h4>📝 資料類別</h4>
                    <p>
                      包含姓名、電子郵件地址、電話號碼、IP
                      位址、以及瀏覽及點選資料記錄等。
                    </p>
                  </div>

                  <div className={styles.infoItem}>
                    <h4>👥 利用對象</h4>
                    <p>
                      陳芸茜本人、實際收費方特武設計工作室、業務往來之相關廠商（如金流服務商），以及依法有調查權之機關。
                    </p>
                  </div>

                  <div className={styles.infoItem}>
                    <h4>🌍 利用地區</h4>
                    <p>
                      本網站經營者營運之地區及雲端託管平台 (zeabur)
                      服務器所在之地區。
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>二、資訊安全與資料保護</h3>

                <div className={styles.securityBox}>
                  <h4>🔐 密碼加密承諾</h4>
                  <p>
                    本網站承諾，您的使用者密碼會被加密處理後放入資料表，此加密程序由網站開發者陳芸茜負責實施與維護，以防止密碼外洩。
                  </p>
                </div>

                <div className={styles.securityBox}>
                  <h4>☁️ 主機託管</h4>
                  <p>本網站使用 zeabur 雲端託管平台。</p>
                </div>

                <div className={styles.securityBox}>
                  <h4>🛡️ 安全措施</h4>
                  <p>
                    本網站經營者採取必要措施，防止您的個人資料被竊取、竄改、毀損、滅失或洩漏。
                  </p>
                </div>
              </div>

              <div className={styles.section}>
                <h3>三、Cookie 之使用</h3>
                <p>
                  本網站會在您的電腦中放置並存取我們的
                  Cookie，以提供服務並記錄您本人輸入的活動紀錄以及登入資訊。
                </p>
              </div>

              <div className={styles.section}>
                <h3>四、您的權利</h3>
                <p>根據《個人資料保護法》規定，您對個人資料享有以下權利：</p>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <h4>📖 查詢權</h4>
                    <p>您有權查詢本網站所蒐集、處理及利用您個人資料的情形。</p>
                  </div>

                  <div className={styles.infoItem}>
                    <h4>✏️ 更正權</h4>
                    <p>
                      如發現個人資料有錯誤或需要更新，您有權要求本網站更正或補充。
                    </p>
                  </div>

                  <div className={styles.infoItem}>
                    <h4>🗑️ 刪除權</h4>
                    <p>在特定情況下，您有權要求本網站刪除您的個人資料。</p>
                  </div>

                  <div className={styles.infoItem}>
                    <h4>🚫 停止利用權</h4>
                    <p>您有權要求本網站停止蒐集、處理或利用您的個人資料。</p>
                  </div>
                </div>

                <div className={styles.contactBox}>
                  <h4>📋 行使權利方式</h4>
                  <p>如您欲行使上述權利，請透過以下方式聯絡本網站經營者：</p>
                  <ul>
                    <li>
                      <strong>聯絡信箱：</strong> glitteroceaneyesca@gmail.com
                    </li>
                    <li>
                      <strong>聯絡電話：</strong> 0917167098
                    </li>
                    <li>
                      <strong>處理時限：</strong>{' '}
                      本網站將於收到請求後15個工作日內回覆
                    </li>
                  </ul>
                </div>

                <div className={styles.warningBox}>
                  <h4>⚠️ 注意事項</h4>
                  <ul>
                    <li>行使權利時需提供身分證明文件以確認身分</li>
                    <li>部分權利行使可能影響服務使用，請謹慎考慮</li>
                    <li>本網站保留在特定情況下拒絕權利行使請求的權利</li>
                    <li>
                      <strong>重要限制：</strong>{' '}
                      如本網站停止服務或終止營運，將無法提供上述權利行使服務，使用者需自行備份重要資料
                    </li>
                  </ul>
                </div>
              </div>

              <div className={styles.section}>
                <h3>五、政策修訂與聯絡方式</h3>
                <p>本網站經營者保有隨時修訂本隱私權政策之權利。</p>
                <p>
                  對於本隱私權政策有任何疑問，或欲行使個人資料保護相關權利，請透過以下方式聯絡：
                </p>

                <div className={styles.contactBox}>
                  <h4>📞 聯絡資訊</h4>
                  <p>
                    <strong>網站經營者/開發者：</strong> 陳芸茜
                  </p>
                  <p>
                    <strong>聯絡信箱：</strong> glitteroceaneyesca@gmail.com
                  </p>
                  <p>
                    <strong>聯絡電話：</strong> 0917167098
                  </p>
                </div>
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
