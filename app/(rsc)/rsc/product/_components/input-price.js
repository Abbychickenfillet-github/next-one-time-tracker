import React, { useState, useCallback, useEffect } from 'react'
import _ from 'lodash'

export default function InputPrice({
  forceReset,
  priceGte,
  setPriceGte,
  priceLte,
  setPriceLte,
}) {
  const [priceGteInput, setPriceGteInput] = useState(priceGte)
  const [priceLteInput, setPriceLteInput] = useState(priceLte)

  // eslint-disable-next-line
  const debouncePriceGteInput = useCallback(
    _.debounce((value) => {
      setPriceGte(value)
    }, 500),
    []
  )
  // eslint-disable-next-line
  const debouncePriceLteInput = useCallback(
    _.debounce((value) => {
      setPriceLte(value)
    }, 500),
    []
  )

  useEffect(() => {
    if (forceReset) {
      setPriceGteInput(priceGte)
      setPriceLteInput(priceLte)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceReset])

  return (
    <div>
      價格 ({priceGte}~{priceLte})
      <label>
        <label>
          從:
          <input
            type="number"
            value={priceGteInput}
            onChange={(e) => {
              setPriceGteInput(Number(e.target.value))
              if (!forceReset) debouncePriceGteInput(Number(e.target.value))
            }}
          />
        </label>
        到:
        <input
          type="number"
          value={priceLteInput}
          onChange={(e) => {
            setPriceLteInput(Number(e.target.value))
            if (!forceReset) debouncePriceLteInput(Number(e.target.value))
          }}
        />
      </label>
    </div>
  )
}
