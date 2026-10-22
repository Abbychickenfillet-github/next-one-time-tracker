'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/smooth-hair-animation.module.scss'

// 後髮、前面兩束側髮、瀏海：同一組輪廓給「髮色」與「高光裁切」共用
const BACK_HAIR =
  'M 168 150 C 164 64, 214 30, 240 30 C 266 30, 316 64, 312 150 C 316 230, 326 292, 306 334 L 174 334 C 154 292, 164 230, 168 150 Z'
const LOCK_L = 'M 170 112 C 168 200, 176 280, 164 332 L 192 332 C 202 270, 196 190, 194 120 Z'
const LOCK_R = 'M 310 112 C 312 200, 304 280, 316 332 L 288 332 C 278 270, 284 190, 286 120 Z'
const BANGS = 'M 176 124 C 178 62, 240 36, 304 112 C 280 84, 228 80, 196 120 Z'
const SHOULDERS = 'M 168 360 C 174 262, 214 244, 240 244 C 266 244, 306 262, 312 360 Z'

const STAR = 'M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z'
const SPARKLES = [
  { x: 112, y: 84, s: 1.1, d: 0, c: '#ffffff' },
  { x: 372, y: 58, s: 0.9, d: 0.5, c: '#ffd166' },
  { x: 104, y: 252, s: 0.8, d: 1.1, c: '#ffd166' },
  { x: 356, y: 236, s: 1.2, d: 0.3, c: '#ffffff' },
  { x: 284, y: 18, s: 0.7, d: 0.9, c: '#ffffff' },
  { x: 140, y: 168, s: 0.6, d: 1.4, c: '#ffd166' },
]

const BURST_CX = 500
const BURST_CY = 150
const BURST = Array.from({ length: 36 }, (_, i) => {
  const r = i % 2 === 0 ? 82 : 64
  const a = (i / 36) * Math.PI * 2
  return `${(BURST_CX + r * Math.cos(a)).toFixed(1)},${(BURST_CY + r * Math.sin(a)).toFixed(1)}`
}).join(' ')

export default function SmoothHairAnimation() {
  const [run, setRun] = useState(0)
  const [inView, setInView] = useState(false)
  const rootRef = useRef(null)

  // 沒捲到眼前就暫停動畫，省 CPU
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={styles.wrap} ref={rootRef}>
      <svg
        key={run}
        className={`${styles.stage} ${inView ? '' : styles.paused}`}
        viewBox="0 0 640 360"
        role="img"
        aria-label="示意動畫：離子燙後柔順的直髮閃出光澤，旁邊閃爍著成功字樣"
      >
        <defs>
          <clipPath id="smooth-hair-clip">
            <path d={BACK_HAIR} />
            <path d={LOCK_L} />
            <path d={LOCK_R} />
            <path d={BANGS} />
          </clipPath>
          <linearGradient id="smooth-hair-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 貼圖風白邊：每個輪廓底下先墊一層加粗的白色 */}
        <g className={styles.outline}>
          <path d={BACK_HAIR} />
          <ellipse cx={240} cy={140} rx={62} ry={66} />
          <path d={SHOULDERS} />
        </g>

        <g className={styles.sway}>
          <path className={styles.hair} d={BACK_HAIR} />
        </g>
        <rect className={styles.skin} x={222} y={196} width={36} height={56} rx={10} />
        <path className={styles.shirt} d={SHOULDERS} />
        <ellipse className={styles.skin} cx={240} cy={140} rx={62} ry={66} />

        {/* 臉：閉眼笑、腮紅、笑嘴 */}
        <path className={styles.eye} d="M 208 152 Q 218 140 228 152" />
        <path className={styles.eye} d="M 252 152 Q 262 140 272 152" />
        <ellipse className={styles.blush} cx={200} cy={170} rx={10} ry={5.5} />
        <ellipse className={styles.blush} cx={280} cy={170} rx={10} ry={5.5} />
        <path className={styles.mouth} d="M 230 168 Q 240 186 250 168 Z" />

        <g className={styles.sway}>
          <path className={styles.hair} d={BANGS} />
          <path className={styles.hair} d={LOCK_L} />
          <path className={styles.hair} d={LOCK_R} />
          {/* 頭頂的天使環反光 */}
          <path className={styles.halo} d="M 190 78 Q 240 50 290 78" />
          {/* 光澤掃過：裁切成髮絲輪廓，只在頭髮上閃 */}
          <g clipPath="url(#smooth-hair-clip)">
            <rect
              className={styles.shine}
              x={60}
              y={-20}
              width={46}
              height={420}
              fill="url(#smooth-hair-shine)"
            />
          </g>
        </g>

        {SPARKLES.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
            <path
              className={styles.spark}
              d={STAR}
              fill={s.c}
              style={{ animationDelay: `${s.d}s` }}
            />
          </g>
        ))}

        {/* 右邊的「成功」貼圖 */}
        <g className={styles.pop}>
          <g className={styles.burstWrap}>
            <polygon className={styles.burst} points={BURST} />
          </g>
          <g className={styles.flash}>
            <text className={styles.success} x={BURST_CX} y={BURST_CY + 18} textAnchor="middle">
              成功
            </text>
          </g>
          <text className={styles.sub} x={BURST_CX} y={BURST_CY + 50} textAnchor="middle">
            柔順直髮
          </text>
        </g>
      </svg>

      <div className={styles.controls}>
        <button type="button" onClick={() => setRun((r) => r + 1)}>
          重播
        </button>
      </div>
    </div>
  )
}
