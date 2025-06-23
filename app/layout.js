// app/layout.js
import { Suspense } from 'react'
import { Providers } from './providers'
import TopNavbar from '@/components/top-navbar'
import NextBreadCrumb from '@/components/next-breadcrumb'
import '@/app/globals.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import OffcanvasNav from '@/components/timelog/OffcanvasNav'
import Header from '@/components/timelog/Header'
import '@/app/globals.scss';


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <TopNavbar />
        <Header />
        <Suspense>
          <Providers>
            <OffcanvasNav/>
            <Suspense>
              <NextBreadCrumb />
              {children}
            </Suspense>
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
