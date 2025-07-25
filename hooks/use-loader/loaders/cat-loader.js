'use client'

// import LottieAnimation from './lottie-animation'
import dynamic from 'next/dynamic'
// 可自訂載入動畫元件
const LottieAnimation = dynamic(() => import('./lottie-animation'), {
  ssr: false,
})

// show是用來控制是否顯示載入元件
export function CatLoader({ show = false }) {
  return <LottieAnimation show={show} animationName="cat.json" prefix="cat" />
}
