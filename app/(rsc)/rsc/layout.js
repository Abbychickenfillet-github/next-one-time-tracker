// import './global.css'
import { Suspense } from 'react'
import '@/styles/globals.scss'

export default function RscLayout({ children }) {
  return <Suspense>{children}</Suspense>
}
