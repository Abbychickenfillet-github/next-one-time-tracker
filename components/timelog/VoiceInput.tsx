'use client'
import { useEffect } from 'react'
export default function VoiceInput({ onResult }: { onResult: (text: string) => void }) {
  useEffect(() => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!Recognition) return
    const recognizer = new Recognition()
    recognizer.lang = 'zh-TW'
    recognizer.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) onResult(transcript)
    }
    recognizer.onerror = () => alert('語音輸入發生錯誤，請再試一次')
    document.getElementById('voiceBtn')?.addEventListener('click', () => recognizer.start())
  }, [onResult])
  return null
}
