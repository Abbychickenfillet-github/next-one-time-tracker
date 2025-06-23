'use client'

import { useEffect } from 'react'
import { useLoader } from '@/hooks/use-loader'

export default function LoadingLayer() {
  const { showLoader } = useLoader()

  useEffect(() => {
    showLoader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}
