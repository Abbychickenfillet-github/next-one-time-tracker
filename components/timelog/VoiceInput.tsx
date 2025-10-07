'use client'
import { useEffect } from 'react'
export default function VoiceInput({
  onResult,
}: {
  // eslint-disable-next-line no-unused-vars
  onResult: (text: string) => void
}) {
  useEffect(() => {
    // window as any 是 TypeScript 的類型斷言
    // 告訴 TypeScript："把 window 當作 any 類型處理"
    // 為什麼需要？
    // 1. window 物件沒有 SpeechRecognition 屬性
    // 2. 這是瀏覽器實驗性 API
    // 3. TypeScript 不知道這個屬性存在
    // 在純 JavaScript 中不需要 as any，直接寫 window.SpeechRecognition 即可
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!Recognition) return
    const recognizer = new Recognition()
    recognizer.lang = 'zh-TW'
    recognizer.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) onResult(transcript)
    }
    recognizer.onerror = () => alert('語音輸入發生錯誤，請再試一次')
    document
      .getElementById('voiceBtn')
      ?.addEventListener('click', () => recognizer.start())
  }, [onResult])
  return null
}
