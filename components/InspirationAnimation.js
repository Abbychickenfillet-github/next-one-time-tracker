'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/inspiration-animation.module.scss'

// 整支動畫是時間 t（秒）的純函式：t 決定每個圖形該長什麼樣子，不用 CSS keyframes，
// 所以拖曳進度條、跳到某一步、暫停都能保持畫面與說明同步。
const TOTAL = 30
const SCENES = [
  { start: 0, name: '準備', caption: '挑出一縷髮絲，尖尾梳從左邊伸進來' },
  { start: 4, name: '纏繞', caption: '用尖尾梳把髮絲纏繞 7 圈' },
  { start: 11, name: '拉住', caption: '拉一下，停 7 秒' },
  { start: 18, name: '放開', caption: '放開，看有沒有回彈回去' },
  {
    start: 24,
    name: '等待',
    caption: '至少 5 圈沒有回彈，就至少有 80% 軟化成功，再停留 3 分鐘左右',
  },
]

const TAU = Math.PI * 2
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (x) => x * x * (3 - 2 * x)
// 淡入 a→b，維持，淡出 c→d
const ramp = (t, a, b, c, d) =>
  clamp((t - a) / (b - a)) * (1 - clamp((t - c) / (d - c)))

const HAIR_X = 250
const STRIPE_GAP = 20
const STRIPE_W = 12
const STRIPE_TOP = 166
const STRIPE_BOTTOM = 194
const HAIR_END_Y = 320
const RING_R = 34
const RING_C = TAU * RING_R

function sceneIndexAt(t) {
  let idx = 0
  SCENES.forEach((s, i) => {
    if (t >= s.start) idx = i
  })
  return idx
}

function wavePoints(cx, top, bottom, amplitude, waves) {
  const pts = []
  for (let y = top; y <= bottom; y += 4) {
    const x =
      cx + amplitude * Math.sin(((y - top) / (bottom - top)) * TAU * waves)
    pts.push(`${x.toFixed(1)},${y}`)
  }
  return pts.join(' ')
}

export default function InspirationAnimation() {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [inView, setInView] = useState(false)
  const rootRef = useRef(null)

  // 使用者偏好減少動態時不自動播放
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPlaying(!reduce)
  }, [])

  // 沒捲到眼前就不跑動畫，省 CPU
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting)
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !inView) return
    let raf
    let last = performance.now()
    let lastPaint = last
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (now - lastPaint < 33) return
      const dt = (now - last) / 1000
      last = now
      lastPaint = now
      setT((prev) => (prev + dt) % TOTAL)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView])

  const sceneIdx = sceneIndexAt(t)

  // 場景一到三的圖：尖尾梳、髮絲、纏繞的條紋
  let coils = 0
  if (t >= 4 && t < 18) coils = clamp((t - 4) / 7) * 7
  else if (t >= 18) coils = 7 * (1 - ease(clamp((t - 18) / 2.5)))
  const full = Math.floor(coils)
  const frac = coils - full
  const stripes = Array.from({ length: 7 }, (_, k) => {
    const p = k < full ? 1 : k === full ? frac : 0
    const x = HAIR_X + k * STRIPE_GAP
    return { k, p, x }
  }).filter((s) => s.p > 0)
  const endIdx = Math.min(full, 6)
  const endX0 = HAIR_X + endIdx * STRIPE_GAP
  const endP = full >= 7 ? 1 : frac
  const endX = endX0 + STRIPE_W * endP
  const endY = STRIPE_TOP + (STRIPE_BOTTOM - STRIPE_TOP) * endP
  const holdIn = ease(clamp((t - 11) / 0.8))
  const holdOut = 1 - ease(clamp((t - 18) / 0.6))
  const pull = 28 * holdIn * holdOut
  const combX = -170 * (1 - ease(clamp(t / 3)))

  const holdSec = clamp(Math.ceil(7 - (t - 11)), 1, 7)
  const coilNo = Math.min(7, full + 1)

  // 場景四：放開後的回彈結果
  const spring = ease(clamp((t - 20) / 1.5))
  const rest = clamp((t - 24) / 1.5)
  const clockAngle = 360 * clamp((t - 25.5) / 4)

  const visDiagram = ramp(t, -1, 0, 20, 21)
  const visResult = ramp(t, 20, 21, 23.5, 24)
  const visRest = ramp(t, 24, 25, 29.4, 30)

  return (
    <div className={styles.wrap} ref={rootRef}>
      <svg
        className={styles.stage}
        viewBox="0 0 640 360"
        role="img"
        aria-label="示意動畫：用尖尾梳把一縷髮絲纏繞 7 圈，拉住停 7 秒後放開，觀察是否回彈來判斷軟化程度，再停留 3 分鐘"
      >
        {/* 場景一到三：尖尾梳纏繞髮絲 */}
        <g opacity={visDiagram}>
          <line
            className={styles.hair}
            x1={HAIR_X}
            y1={20}
            x2={HAIR_X}
            y2={STRIPE_TOP}
          />
          <g transform={`translate(${combX} 0)`}>
            <polygon className={styles.comb} points="170,174 520,180 170,186" />
            <rect
              className={styles.comb}
              x={20}
              y={166}
              width={150}
              height={28}
              rx={14}
            />
          </g>
          {stripes.map(({ k, p, x }) => (
            <line
              key={k}
              className={styles.hair}
              x1={x}
              y1={STRIPE_TOP}
              x2={x + STRIPE_W}
              y2={STRIPE_BOTTOM}
              pathLength={1}
              strokeDasharray={`${p} 1`}
            />
          ))}
          <line
            className={styles.hair}
            x1={endX}
            y1={endY}
            x2={endX}
            y2={HAIR_END_Y + pull}
          />
          <g opacity={ramp(t, 4, 4.5, 10.8, 11.3)}>
            <text className={styles.label} x={420} y={86}>
              {`第 ${coilNo} 圈，共 7 圈`}
            </text>
          </g>
          <g opacity={ramp(t, 11, 11.5, 17.5, 18)}>
            <polygon
              className={styles.accent}
              points={`${endX - 9},${HAIR_END_Y + pull + 2} ${endX + 9},${HAIR_END_Y + pull + 2} ${endX},${HAIR_END_Y + pull + 18}`}
            />
            <circle className={styles.ringTrack} cx={560} cy={70} r={RING_R} />
            <circle
              className={styles.ring}
              cx={560}
              cy={70}
              r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * clamp((t - 11) / 7)}
              transform="rotate(-90 560 70)"
            />
            <text className={styles.count} x={560} y={82} textAnchor="middle">
              {holdSec}
            </text>
            <text
              className={styles.labelSm}
              x={560}
              y={126}
              textAnchor="middle"
            >
              停 7 秒
            </text>
          </g>
        </g>

        {/* 場景四：放開後看有沒有回彈 */}
        <g opacity={visResult}>
          <text className={styles.labelSm} x={190} y={36} textAnchor="middle">
            沒有回彈（已軟化）
          </text>
          <polyline
            className={styles.hairShape}
            points={wavePoints(190, 56, 200, 5 * spring, 1)}
          />
          <text className={styles.labelSm} x={450} y={36} textAnchor="middle">
            回彈（還沒軟化）
          </text>
          <polyline
            className={styles.hairShape}
            points={wavePoints(450, 56, 200, 42 * spring, 2)}
          />
          {Array.from({ length: 7 }, (_, k) => {
            const shown = clamp((t - 21.5 - k * 0.25) / 0.25)
            return (
              <circle
                key={k}
                className={k < 5 ? styles.dotFull : styles.dotHalf}
                cx={320 + (k - 3) * 40}
                cy={262}
                r={11}
                opacity={shown}
              />
            )
          })}
          <text className={styles.labelSm} x={320} y={304} textAnchor="middle">
            7 圈至少 5 圈沒有回彈，6 到 7 圈是比較鬆彈
          </text>
        </g>

        {/* 場景五：軟化達標，再停留 3 分鐘 */}
        <g opacity={visRest}>
          <text className={styles.label} x={320} y={96} textAnchor="middle">
            至少 80% 軟化成功
          </text>
          <rect
            className={styles.barTrack}
            x={120}
            y={118}
            width={400}
            height={22}
            rx={11}
          />
          <rect
            className={styles.barFill}
            x={120}
            y={118}
            width={400 * 0.8 * ease(rest)}
            height={22}
            rx={11}
          />
          <circle className={styles.clockFace} cx={320} cy={236} r={46} />
          <line
            className={styles.clockHand}
            x1={320}
            y1={236}
            x2={320}
            y2={202}
            transform={`rotate(${clockAngle} 320 236)`}
          />
          <text className={styles.labelSm} x={320} y={310} textAnchor="middle">
            此時再停留 3 分鐘左右
          </text>
        </g>
      </svg>

      <p className={styles.caption}>{SCENES[sceneIdx].caption}</p>

      <div className={styles.controls}>
        <button type="button" onClick={() => setPlaying((p) => !p)}>
          {playing ? '暫停' : '播放'}
        </button>
        <button
          type="button"
          onClick={() => {
            setT(0)
            setPlaying(true)
          }}
        >
          重播
        </button>
        <input
          type="range"
          min={0}
          max={TOTAL}
          step={0.1}
          value={t}
          aria-label="動畫進度"
          onChange={(e) => setT(Number(e.target.value))}
        />
      </div>
      <ol className={styles.steps}>
        {SCENES.map((s, i) => (
          <li key={s.name}>
            <button
              type="button"
              aria-current={i === sceneIdx ? 'step' : undefined}
              onClick={() => setT(s.start)}
            >
              {i + 1}. {s.name}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
