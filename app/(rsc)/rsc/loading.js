'use client'

import React, { useEffect } from 'react'
import { useLoader } from '@/hooks/use-loader'

export default function Loading() {
  const { showLoader } = useLoader()

  useEffect(() => {
    showLoader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}
