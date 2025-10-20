'use client'
import { useEffect, useState } from 'react'

export default function VoiceInput(
  // eslint-disable-next-line
  { onResult }: { onResult: (_text: string) => void }
  //這裡的冒號 : 是 TypeScript 型別註解 (Type Annotation) 的語法。
  // onResult 是一個函數，接受字串參數並回傳 void (沒有回傳值)
  // 這個函數用來通知父組件語音識別的結果
  // onResult: (text: string) => void
) {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 檢查是否為手機裝置
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )

    if (isMobile) {
      setError('手機裝置請使用鍵盤的語音輸入功能')
      return
    }

    // 檢查電腦裝置是否支援語音識別
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!Recognition) {
      setError('您的瀏覽器不支援語音識別功能')
      return
    }

    // 檢查是否為 HTTPS 或 localhost
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setError('語音識別需要 HTTPS 連線')
      return
    }

    setIsSupported(true)
    const recognizer = new Recognition()

    // 設定語音識別參數
    recognizer.lang = 'zh-TW'
    recognizer.continuous = false
    recognizer.interimResults = false
    recognizer.maxAlternatives = 1

    // 成功識別
    recognizer.onresult = (event: any) => {
      setIsListening(false)
      const text = event.results?.[0]?.[0]?.transcript
      if (text) {
        onResult(text)
        setError('')
      }
    }

    // 開始聆聽
    recognizer.onstart = () => {
      setIsListening(true)
      setError('')
    }

    // 結束聆聽
    recognizer.onend = () => {
      setIsListening(false)
    }

    // 錯誤處理
    recognizer.onerror = (event: any) => {
      setIsListening(false)
      console.error('語音識別錯誤:', event.error)

      switch (event.error) {
        case 'not-allowed':
          setError('請允許麥克風權限以使用語音輸入')
          break
        case 'no-speech':
          setError('沒有偵測到語音，請再試一次')
          break
        case 'network':
          setError('網路連線問題，請檢查網路後重試')
          break
        case 'aborted':
          setError('語音輸入被中斷')
          break
        default:
          setError('語音輸入發生錯誤，5秒後請再試一次')
      }
    }

    // 綁定按鈕點擊事件
    const voiceBtn = document.getElementById('voiceBtn')
    if (voiceBtn) {
      voiceBtn.addEventListener('click', async () => {
        try {
          // 檢查是否正在聆聽
          if (isListening) {
            recognizer.stop()
          } else {
            recognizer.start()
          }
        } catch (err) {
          console.error('啟動語音識別失敗:', err)
          setError('無法啟動語音識別，請檢查麥克風權限')
        }
      })
    }

    // 清理函數
    return () => {
      if (voiceBtn) {
        voiceBtn.removeEventListener('click', () => {})
      }
    }
  }, [onResult, isListening])

  // 更新按鈕狀態
  useEffect(() => {
    const voiceBtn = document.getElementById('voiceBtn')
    if (voiceBtn) {
      if (!isSupported) {
        ;(voiceBtn as HTMLButtonElement).disabled = true
        voiceBtn.title = error || '不支援語音識別'
      } else if (isListening) {
        ;(voiceBtn as HTMLButtonElement).innerHTML = '🎤 聆聽中...'
        voiceBtn.classList.add('btn-warning')
        voiceBtn.classList.remove('btn-outline-info')
      } else {
        voiceBtn.innerHTML = '🎤 語音'
        voiceBtn.classList.add('btn-outline-info')
        voiceBtn.classList.remove('btn-warning')
      }
    }
  }, [isSupported, isListening, error])

  // 顯示錯誤訊息
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError('')
      }, 5000) // 5秒後自動清除錯誤訊息
      return () => clearTimeout(timeout)
    }
  }, [error])

  // 清除錯誤訊息的函數
  const clearError = () => {
    setError('')
  }

  return (
    <>
      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show position-fixed"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '300px',
          }}
        >
          <small>{error}</small>
          <button
            type="button"
            className="btn-close"
            onClick={clearError}
          ></button>
        </div>
      )}
    </>
  )
}
