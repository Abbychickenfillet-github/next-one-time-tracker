'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhTW from '@/locales/zh-TW.json'
import zhCN from '@/locales/zh-CN.json'
import enUS from '@/locales/en-US.json'
import jaJP from '@/locales/ja-JP.json'
import koKR from '@/locales/ko-KR.json'
import frFR from '@/locales/fr-FR.json'

// 检测浏览器语言
const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'zh-TW'

  const savedLanguage = localStorage.getItem('i18nextLng')
  if (savedLanguage) return savedLanguage

  const browserLang =
    (navigator.languages && navigator.languages.length > 0
      ? navigator.languages[0]
      : navigator.language) || 'zh-TW'

  // 支持的语言列表
  const supportedLanguages = [
    'zh-TW',
    'zh-CN',
    'en-US',
    'ja-JP',
    'ko-KR',
    'fr-FR',
  ]

  // 检查完整匹配
  if (supportedLanguages.includes(browserLang)) {
    return browserLang
  }

  // 检查语言代码匹配（例如 'zh' 匹配 'zh-TW'）
  const langCode = browserLang.split('-')[0]
  const matched = supportedLanguages.find((lang) => lang.startsWith(langCode))

  return matched || 'zh-TW'
}

i18n.use(initReactI18next).init({
  resources: {
    'zh-TW': {
      translation: zhTW,
    },
    'zh-CN': {
      translation: zhCN,
    },
    'en-US': {
      translation: enUS,
    },
    'ja-JP': {
      translation: jaJP,
    },
    'ko-KR': {
      translation: koKR,
    },
    'fr-FR': {
      translation: frFR,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'zh-TW',
  interpolation: {
    escapeValue: false, // React 已经转义了
  },
  react: {
    useSuspense: false, // 避免在 Next.js 中使用 Suspense
  },
})

// 监听语言变化，保存到 localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lng)
  }
})

export default i18n