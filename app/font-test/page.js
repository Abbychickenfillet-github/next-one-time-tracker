'use client'

export default function FontTestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'var(--font-noto-sans-tc)' }}>
      <h1 style={{ fontWeight: 700 }}>思源黑體測試 - 粗體</h1>
      <h2 style={{ fontWeight: 500 }}>思源黑體測試 - 中等</h2>
      <p style={{ fontWeight: 400 }}>
        這是思源黑體的正常字重，支援繁體中文顯示。
      </p>
      <p style={{ fontWeight: 300 }}>這是思源黑體的細體字重。</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>字體資訊：</h3>
        <p>如果字體正確載入，您應該看到：</p>
        <ul>
          <li>清晰的中文字符</li>
          <li>現代簡潔的字型設計</li>
          <li>良好的可讀性</li>
        </ul>
      </div>
    </div>
  )
}
