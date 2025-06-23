import Image from 'next/image'
import styles from '../_styles/card.module.scss'

export default function CardLoading({ loading = true }) {
  return (
    <>
      <div className={styles['grid-item']}>
        <div>
          <div className={loading ? styles.deferloading : ''}>
            <Image
              // 根據loading狀態決定圖片
              src={'/images/cat/c1.webp'}
              alt="..."
              priority
              width={300}
              height={188}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <div>
            {/*  根據loading狀態決定文字 */}
            <h3 className={loading ? styles.deferloading : ''}>
              商品標題商品標題商品標題
            </h3>
            {/*  根據loading狀態決定文字 */}
            <p className={loading ? styles.deferloading : ''}>
              一些商品描述…一些商品描述…一些商品描述…
            </p>
            {/*  根據loading狀態決定呈現按鈕 */}
            <div className={loading ? styles.deferloading : ''}>
              <button>加入購物車</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
