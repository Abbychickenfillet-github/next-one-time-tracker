// import CssLoader from './_components/css-loader'

// export default function Loading() {
//   return <CssLoader />
// }

'use client'

import { useEffect } from 'react'
import { useLoader } from '@/hooks/use-loader'

export default function Loading() {
  const { showLoader } = useLoader()

  useEffect(() => {
    showLoader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}
