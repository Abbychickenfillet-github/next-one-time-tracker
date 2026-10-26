'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/straightening-steps-animation.module.scss'

// 整支動畫是時間 t（秒）的純函式：t 決定每個圖形該長什麼樣子，
// 所以拖進度條、跳到某一步、暫停都能保持畫面、說明與時間戳同步。
const TAU = Math.PI * 2
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (x) => x * x * (3 - 2 * x)
const easeOutBack = (x) =>
  1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2)
const lerp = (a, b, u) => a + (b - a) * u
// 淡入 a→b，維持，淡出 c→d
const ramp = (t, a, b, c, d) =>
  clamp((t - a) / (b - a)) * (1 - clamp((t - c) / (d - c)))

const hexToRgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mixColor = (a, b, u) => {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return `#${A.map((v, i) =>
    Math.round(lerp(v, B[i], u))
      .toString(16)
      .padStart(2, '0')
  ).join('')}`
}

// 表格裡的九個步驟（名稱、說明、耗時都來自 about 頁的步驟表格）
const STEPS = [
  { name: '噴濕頭髮', short: '噴濕', note: '目的：讓毛鱗片打開' },
  { name: '上第一劑 髮根區', short: '髮根', note: '從最捲的地方開始' },
  {
    name: '上第一劑 髮中區',
    short: '髮中',
    note: '逐步上藥水，測試 7 圈回彈效果',
  },
  {
    name: '上第一劑 髮尾區',
    short: '髮尾',
    note: '髮尾用較弱藥水，用尖尾梳測試整頭軟化程度',
  },
  { name: '用洗髮精洗頭', short: '洗頭', note: '徹底清潔第一劑殘留' },
  { name: '吹乾頭髮', short: '吹乾', note: '完全吹乾，準備上第二劑' },
  { name: '上第二劑', short: '第二劑', note: '乳狀第二劑，讓頭髮充分吸收藥水' },
  {
    name: '等待吸收',
    short: '等待',
    note: '讓第二劑充分滲透，濃稠度適中，用途是定型',
  },
  { name: '完成', short: '完成', note: '整個流程完成，總耗時約 47 分鐘' },
]

// dur 是動畫秒數，rt 是表格裡的實際時間（距 10:00:00 的秒數）。
// 髮中區與髮尾區都拆成上藥與 7 圈測試兩段，兩段合起來剛好是表格裡各自的起訖時間
const SCENE_DEFS = [
  { id: 'spray', step: 0, dur: 5, rt: [0, 135] },
  { id: 'root', step: 1, dur: 5, rt: [135, 510] },
  { id: 'mid', step: 2, dur: 5, rt: [510, 690] },
  { id: 'test', step: 2, dur: 24, rt: [690, 885], zone: '髮中' },
  { id: 'tip', step: 3, dur: 5, rt: [885, 1000] },
  { id: 'tipTest', step: 3, dur: 24, rt: [1000, 1200], zone: '髮尾' },
  { id: 'wash', step: 4, dur: 5, rt: [1200, 1530] },
  { id: 'dry', step: 5, dur: 5, rt: [1530, 2100] },
  { id: 'second', step: 6, dur: 5, rt: [2100, 2540] },
  { id: 'wait', step: 7, dur: 5, rt: [2540, 2840] },
  { id: 'done', step: 8, dur: 6, rt: [2840, 2840] },
]
let acc = 0
const SCENES = SCENE_DEFS.map((s) => {
  const o = { ...s, start: acc }
  acc += s.dur
  return o
})
const TOTAL = acc
const S = Object.fromEntries(SCENES.map((s) => [s.id, s]))
const STEP_START = STEPS.map((_, i) => SCENES.find((s) => s.step === i).start)

function sceneIndexAt(t) {
  let idx = 0
  SCENES.forEach((s, i) => {
    if (t >= s.start) idx = i
  })
  return idx
}

// 頭髮：從彎曲波浪（amp 大）一路被拉直（amp 趨近 0）
const AMP_KEYS = [
  [0, 16],
  [S.wash.start, 16],
  [S.dry.start, 10],
  [S.second.start, 10],
  [S.wait.start, 4],
  [S.done.start, 0],
  [TOTAL, 0],
]
function ampAt(t) {
  for (let i = 0; i < AMP_KEYS.length - 1; i++) {
    const [t0, a0] = AMP_KEYS[i]
    const [t1, a1] = AMP_KEYS[i + 1]
    if (t <= t1) return lerp(a0, a1, ease(clamp((t - t0) / (t1 - t0))))
  }
  return 0
}

const HX = 170
const HTOP = 30
const HBOT = 340
const halfWidth = (y) =>
  (44 + (10 * (y - HTOP)) / (HBOT - HTOP)) * Math.sqrt(clamp((y - HTOP) / 16))
const wave = (y, amp) => amp * Math.sin((y - HTOP) / 38)
function hairPath(amp) {
  const left = []
  const right = []
  for (let y = HTOP; y <= HBOT; y += 10) {
    const dx = wave(y, amp)
    left.push(`${(HX - halfWidth(y) + dx).toFixed(1)} ${y}`)
    right.push(`${(HX + halfWidth(y) + dx).toFixed(1)} ${y}`)
  }
  return `M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z`
}
function strandPoints(f, amp) {
  const pts = []
  for (let y = HTOP + 16; y <= HBOT; y += 10) {
    pts.push(`${(HX + f * halfWidth(y) + wave(y, amp)).toFixed(1)},${y}`)
  }
  return pts.join(' ')
}

const ZONES = [
  { name: '髮根區', top: 30, h: 100 },
  { name: '髮中區', top: 130, h: 105 },
  { name: '髮尾區', top: 235, h: 105 },
]

const DRY_COLOR = '#a8765a'
const WET_COLOR = '#5b3a30'

// 7 圈回彈測試用的尺寸（與靈感頁最初的動畫相同）
const COIL_X = 250
const COIL_GAP = 20
const COIL_W = 12
const COIL_TOP = 166
const COIL_BOTTOM = 194
const COIL_END_Y = 320
const RING_R = 34
const RING_C = TAU * RING_R

function wavePoints(cx, top, bottom, amplitude, waves) {
  const pts = []
  for (let y = top; y <= bottom; y += 4) {
    const x =
      cx + amplitude * Math.sin(((y - top) / (bottom - top)) * TAU * waves)
    pts.push(`${x.toFixed(1)},${y}`)
  }
  return pts.join(' ')
}

const STAR = 'M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z'
const SPARKLES = [
  { x: 96, y: 70, s: 1.1, p: 0, c: '#ffffff' },
  { x: 250, y: 90, s: 0.9, p: 0.3, c: '#ffd166' },
  { x: 90, y: 210, s: 0.8, p: 0.6, c: '#ffd166' },
  { x: 255, y: 250, s: 1.2, p: 0.15, c: '#ffffff' },
  { x: 130, y: 330, s: 0.7, p: 0.45, c: '#ffffff' },
]
const BURST_CX = 480
const BURST_CY = 170
const BURST = Array.from({ length: 36 }, (_, i) => {
  const r = i % 2 === 0 ? 78 : 61
  const a = (i / 36) * TAU
  return `${(BURST_CX + r * Math.cos(a)).toFixed(1)},${(BURST_CY + r * Math.sin(a)).toFixed(1)}`
}).join(' ')

const pad2 = (n) => String(n).padStart(2, '0')
function clockText(sec) {
  const s = Math.floor(sec)
  return `${10 + Math.floor(s / 3600)}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`
}

// 7 圈回彈測試：lt 是這個場景自己的時間（0 到 24 秒）
function CoilTest({ lt, zone }) {
  let coils = 0
  if (lt < 12) coils = clamp(lt / 5) * 7
  else coils = 7 * (1 - ease(clamp((lt - 12) / 2.5)))
  const full = Math.floor(coils)
  const frac = coils - full
  const stripes = Array.from({ length: 7 }, (_, k) => ({
    k,
    p: k < full ? 1 : k === full ? frac : 0,
    x: COIL_X + k * COIL_GAP,
  })).filter((s) => s.p > 0)
  const endIdx = Math.min(full, 6)
  const endP = full >= 7 ? 1 : frac
  const endX = COIL_X + endIdx * COIL_GAP + COIL_W * endP
  const endY = COIL_TOP + (COIL_BOTTOM - COIL_TOP) * endP
  const pull =
    28 * ease(clamp((lt - 5) / 0.8)) * (1 - ease(clamp((lt - 12) / 0.6)))
  const holdSec = clamp(Math.ceil(7 - (lt - 5)), 1, 7)
  const spring = ease(clamp((lt - 15) / 1.5))
  const rest = clamp((lt - 19.5) / 1.5)

  const visDiagram = ramp(lt, -1, 0, 14.2, 15)
  const visResult = ramp(lt, 14.5, 15.3, 18.2, 19)
  const visRest = ramp(lt, 18.8, 19.6, 23.4, 24)

  return (
    <g>
      <text
        className={styles.zoneActive}
        x={20}
        y={40}
        opacity={ramp(lt, 0, 0.4, 23.4, 24)}
      >
        {`測試${zone}的軟化程度`}
      </text>
      <g opacity={visDiagram}>
        <line
          className={styles.hairLine}
          x1={COIL_X}
          y1={20}
          x2={COIL_X}
          y2={COIL_TOP}
        />
        <polygon className={styles.tool} points="170,174 520,180 170,186" />
        <rect
          className={styles.tool}
          x={20}
          y={166}
          width={150}
          height={28}
          rx={14}
        />
        {stripes.map(({ k, p, x }) => (
          <line
            key={k}
            className={styles.hairLine}
            x1={x}
            y1={COIL_TOP}
            x2={x + COIL_W}
            y2={COIL_BOTTOM}
            pathLength={1}
            strokeDasharray={`${p} 1`}
          />
        ))}
        <line
          className={styles.hairLine}
          x1={endX}
          y1={endY}
          x2={endX}
          y2={COIL_END_Y + pull}
        />
        <g opacity={ramp(lt, 0, 0.4, 4.7, 5.2)}>
          <text className={styles.label} x={420} y={86}>
            {`第 ${Math.min(7, full + 1)} 圈，共 7 圈`}
          </text>
        </g>
        <g opacity={ramp(lt, 5, 5.5, 11.5, 12)}>
          <polygon
            className={styles.accent}
            points={`${endX - 9},${COIL_END_Y + pull + 2} ${endX + 9},${COIL_END_Y + pull + 2} ${endX},${COIL_END_Y + pull + 18}`}
          />
          <circle className={styles.ringTrack} cx={560} cy={70} r={RING_R} />
          <circle
            className={styles.ring}
            cx={560}
            cy={70}
            r={RING_R}
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * clamp((lt - 5) / 7)}
            transform="rotate(-90 560 70)"
          />
          <text className={styles.count} x={560} y={82} textAnchor="middle">
            {holdSec}
          </text>
          <text className={styles.labelSm} x={560} y={126} textAnchor="middle">
            停 7 秒
          </text>
        </g>
      </g>

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
        {Array.from({ length: 7 }, (_, k) => (
          <circle
            key={k}
            className={k < 5 ? styles.dotFull : styles.dotHalf}
            cx={320 + (k - 3) * 40}
            cy={262}
            r={11}
            opacity={clamp((lt - 16.3 - k * 0.25) / 0.25)}
          />
        ))}
        <text className={styles.labelSm} x={320} y={304} textAnchor="middle">
          7 圈至少 5 圈沒有回彈，6 到 7 圈是比較鬆彈
        </text>
      </g>

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
          transform={`rotate(${360 * clamp((lt - 20.5) / 3)} 320 236)`}
        />
        <text className={styles.labelSm} x={320} y={310} textAnchor="middle">
          此時再停留 3 分鐘左右
        </text>
      </g>
    </g>
  )
}

// 上藥場景右邊的道具：藥碗與刷子（刷子沿著髮區往下刷）
function applyProps(y, creamColor, label) {
  return (
    <g>
      <path className={styles.tool} d="M 420 250 Q 470 320 520 250 Z" />
      <ellipse cx={470} cy={248} rx={38} ry={11} fill={creamColor} />
      <text className={styles.labelSm} x={470} y={338} textAnchor="middle">
        {label}
      </text>
      <g transform={`translate(240 ${y})`}>
        <rect
          x={0}
          y={-5}
          width={90}
          height={10}
          rx={5}
          className={styles.tool}
        />
        <rect
          x={-14}
          y={-14}
          width={16}
          height={28}
          rx={4}
          fill={creamColor}
          className={styles.brushHead}
        />
      </g>
    </g>
  )
}

export default function StraighteningStepsAnimation() {
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

  const si = sceneIndexAt(t)
  const sc = SCENES[si]
  const lt = t - sc.start
  const lp = clamp(lt / sc.dur)
  const step = STEPS[sc.step]

  const amp = ampAt(t)
  const shift = sc.id === 'dry' ? 3 * Math.sin(lt * 9) : 0
  const wet =
    t < S.dry.start
      ? ease(clamp((t - S.spray.start) / 3))
      : 1 - ease(clamp((t - S.dry.start) / S.dry.dur))
  const hairColor = mixColor(DRY_COLOR, WET_COLOR, wet)
  const hairD = hairPath(amp)

  // 第一劑逐區上藥：t 超過該場景之後覆蓋率固定是 1，洗頭時才褪掉
  const cover = [
    clamp((t - S.root.start) / S.root.dur),
    clamp((t - S.mid.start) / S.mid.dur),
    clamp((t - S.tip.start) / S.tip.dur),
  ]
  const cream1 =
    t < S.wash.start ? 1 : 1 - ease(clamp((t - S.wash.start) / S.wash.dur))
  const cover2 = clamp((t - S.second.start) / S.second.dur)
  const cream2 = 1 - clamp((t - S.done.start) / 1.5)

  // 髮中與髮尾各有一段 7 圈測試：測試場景時頭髮淡出、測試圖淡入
  const fade = (id) => {
    const s = S[id]
    const end = s.start + s.dur
    return ramp(t, s.start, s.start + 0.6, end - 0.6, end)
  }
  const testVis = Math.max(fade('test'), fade('tipTest'))
  const hairVis = 1 - testVis
  const prop = (id) => {
    const s = S[id]
    return ramp(
      t,
      s.start,
      s.start + 0.4,
      s.start + s.dur - 0.4,
      s.start + s.dur
    )
  }

  const activeZone = { root: 0, mid: 1, tip: 2 }[sc.id]
  const doneIn = sc.id === 'done' ? lt : 0
  const rtSec = lerp(sc.rt[0], sc.rt[1], lp)

  const isTest = sc.id === 'test' || sc.id === 'tipTest'
  let caption = step.note
  if (isTest) {
    if (lt < 5) caption = '用尖尾梳把髮絲纏繞 7 圈'
    else if (lt < 12) caption = '拉一下，停 7 秒'
    else if (lt < 19) caption = '放開，看有沒有回彈回去'
    else caption = '至少有 80% 軟化成功，此時再停留 3 分鐘左右'
  }

  const remain = Math.max(0, Math.round(300 * (1 - lp)))

  return (
    <div className={styles.wrap} ref={rootRef}>
      <svg
        className={styles.stage}
        viewBox="0 0 640 360"
        role="img"
        aria-label="示意動畫：離子燙九個步驟，從噴濕頭髮、上第一劑並用七圈測試軟化、洗頭、吹乾、上第二劑、等待定型到頭髮變直完成"
      >
        <defs>
          <clipPath id="steps-hair-clip">
            <path d={hairD} />
          </clipPath>
          <linearGradient id="steps-hair-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <text className={styles.hud} x={16} y={26}>
          {clockText(rtSec)}
        </text>
        <text className={styles.hud} x={624} y={26} textAnchor="end">
          {`步驟 ${sc.step + 1} / ${STEPS.length}`}
        </text>

        {/* 頭髮與三個髮區 */}
        <g opacity={hairVis}>
          {ZONES.map((z, i) => (
            <text
              key={z.name}
              className={i === activeZone ? styles.zoneActive : styles.zone}
              x={14}
              y={z.top + z.h / 2 + 5}
            >
              {z.name}
            </text>
          ))}
          <g transform={`translate(${shift} 0)`}>
            <path d={hairD} fill={hairColor} className={styles.hairBody} />
            {[-0.65, -0.3, 0.05, 0.4, 0.7].map((f) => (
              <polyline
                key={f}
                className={styles.strand}
                points={strandPoints(f, amp)}
              />
            ))}
            <polyline
              className={styles.gloss}
              points={strandPoints(-0.3, amp)}
              opacity={ease(clamp(doneIn / 1))}
            />
            <g clipPath="url(#steps-hair-clip)">
              {ZONES.map((z, i) => (
                <rect
                  key={z.name}
                  x={60}
                  y={z.top}
                  width={220}
                  height={z.h * cover[i]}
                  fill="#ffe08a"
                  opacity={0.78 * cream1}
                />
              ))}
              <rect
                x={60}
                y={HTOP}
                width={220}
                height={(HBOT - HTOP) * cover2}
                fill="#ffffff"
                opacity={0.62 * cream2}
              />
              {sc.id === 'done' && (
                <rect
                  className={styles.shine}
                  x={60 + 230 * clamp((lt % 2.4) / 1.8)}
                  y={-20}
                  width={46}
                  height={420}
                  fill="url(#steps-hair-shine)"
                  transform="rotate(18 170 180)"
                />
              )}
            </g>
            {/* 洗頭的泡泡 */}
            {sc.id === 'wash' &&
              Array.from({ length: 12 }, (_, i) => {
                const bloom = clamp(lp * 2.2 - i * 0.06)
                const pop = 1 - clamp((lp - 0.82) / 0.18)
                return (
                  <circle
                    key={i}
                    className={styles.foam}
                    cx={HX + (((i * 53) % 90) - 45)}
                    cy={50 + ((i * 29) % 280)}
                    r={(6 + (i % 3) * 3) * bloom}
                    opacity={pop}
                  />
                )
              })}
          </g>
        </g>

        {/* 各場景右邊的道具 */}
        <g opacity={prop('spray')}>
          <rect
            className={styles.tool}
            x={400}
            y={150}
            width={50}
            height={110}
            rx={12}
          />
          <rect
            className={styles.tool}
            x={410}
            y={132}
            width={30}
            height={20}
            rx={4}
          />
          <rect
            className={styles.tool}
            x={380}
            y={134}
            width={40}
            height={14}
            rx={6}
          />
          {Array.from({ length: 12 }, (_, i) => {
            const u = (lt * 0.9 + i / 12) % 1
            return (
              <circle
                key={i}
                className={styles.water}
                cx={380 - u * 150}
                cy={141 + ((i % 4) - 1.5) * u * 22}
                r={2.6}
                opacity={1 - u}
              />
            )
          })}
        </g>

        <g opacity={prop('root')}>
          {applyProps(ZONES[0].top + ZONES[0].h * lp, '#ffe08a', '第一劑')}
        </g>
        <g opacity={prop('mid')}>
          {applyProps(ZONES[1].top + ZONES[1].h * lp, '#ffe08a', '第一劑')}
        </g>
        <g opacity={prop('tip')}>
          {applyProps(
            ZONES[2].top + ZONES[2].h * lp,
            '#fff3c4',
            '第一劑（髮尾用較弱藥水）'
          )}
        </g>
        <g opacity={prop('second')}>
          {applyProps(HTOP + (HBOT - HTOP) * lp, '#ffffff', '乳狀第二劑')}
        </g>

        <g opacity={prop('wash')}>
          <ellipse className={styles.tool} cx={420} cy={44} rx={46} ry={14} />
          <line className={styles.toolLine} x1={466} y1={44} x2={520} y2={20} />
          {Array.from({ length: 16 }, (_, i) => {
            const y = 62 + ((lt * 150 + i * 41) % 270)
            return (
              <line
                key={i}
                className={styles.waterLine}
                x1={382 + ((i * 17) % 80)}
                y1={y}
                x2={382 + ((i * 17) % 80)}
                y2={y + 11}
              />
            )
          })}
        </g>

        <g
          opacity={prop('dry')}
          transform={`translate(0 ${Math.sin(lt * 20) * 1.2})`}
        >
          <rect
            className={styles.tool}
            x={430}
            y={150}
            width={100}
            height={40}
            rx={14}
          />
          <rect
            className={styles.tool}
            x={405}
            y={156}
            width={28}
            height={28}
            rx={4}
          />
          <rect
            className={styles.tool}
            x={472}
            y={188}
            width={24}
            height={52}
            rx={8}
          />
          {[0, 1, 2, 3].map((k) => (
            <line
              key={k}
              className={styles.windLine}
              x1={250}
              y1={146 + k * 16}
              x2={400}
              y2={146 + k * 16}
              strokeDasharray="16 12"
              strokeDashoffset={lt * 70 + k * 5}
            />
          ))}
        </g>

        <g opacity={prop('wait')}>
          <circle className={styles.clockFace} cx={440} cy={160} r={62} />
          <line
            className={styles.clockHand}
            x1={440}
            y1={160}
            x2={440}
            y2={116}
            transform={`rotate(${360 * lp} 440 160)`}
          />
          <text className={styles.count} x={440} y={262} textAnchor="middle">
            {`${pad2(Math.floor(remain / 60))}:${pad2(remain % 60)}`}
          </text>
          <text className={styles.labelSm} x={440} y={290} textAnchor="middle">
            定型中
          </text>
        </g>

        <g opacity={prop('done')}>
          {SPARKLES.map((s, i) => {
            const k = clamp(Math.sin(((lt * 0.55 + s.p) % 1) * Math.PI))
            return (
              <path
                key={i}
                d={STAR}
                fill={s.c}
                transform={`translate(${s.x} ${s.y}) scale(${s.s * k}) rotate(${k * 90})`}
              />
            )
          })}
          <g
            transform={`translate(${BURST_CX} ${BURST_CY}) scale(${easeOutBack(clamp(lt / 0.8))}) translate(${-BURST_CX} ${-BURST_CY})`}
          >
            <g transform={`rotate(${lt * 25} ${BURST_CX} ${BURST_CY})`}>
              <polygon className={styles.burst} points={BURST} />
            </g>
            <text
              className={styles.success}
              x={BURST_CX}
              y={BURST_CY + 18}
              textAnchor="middle"
              fill={Math.floor(lt * 4) % 2 === 0 ? '#ffffff' : '#fff3b0'}
            >
              成功
            </text>
            <text
              className={styles.sub}
              x={BURST_CX}
              y={BURST_CY + 50}
              textAnchor="middle"
            >
              柔順直髮
            </text>
          </g>
        </g>

        {/* 7 圈回彈測試（髮中區與髮尾區各一段） */}
        <g opacity={testVis}>{isTest && <CoilTest lt={lt} zone={sc.zone} />}</g>
      </svg>

      <p className={styles.caption}>
        <strong>{step.name}</strong>
        {isTest ? `（測試${sc.zone}：7 圈回彈）` : ''}：{caption}
      </p>

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
        {STEPS.map((s, i) => (
          <li key={s.short}>
            <button
              type="button"
              aria-current={i === sc.step ? 'step' : undefined}
              onClick={() => setT(STEP_START[i])}
            >
              {i + 1}. {s.short}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
