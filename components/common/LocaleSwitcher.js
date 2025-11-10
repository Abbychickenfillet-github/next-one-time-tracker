'use client'

import React from 'react'
import { Form } from 'react-bootstrap'

const DEFAULT_LOCALES = [
  { value: 'zh-TW', label: '中文（台灣）' },
  { value: 'zh-CN', label: '中文（中國大陸）' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'ja-JP', label: '日本語（日本）' },
  { value: 'ko-KR', label: '한국어 (대한민국)' },
  { value: 'fr-FR', label: 'Français (France)' },
]

export default function LocaleSwitcher({
  value,
  onChange,
  options = DEFAULT_LOCALES,
  size = 'sm',
  className = '',
  style,
}) {
  const handleChange = (event) => {
    onChange?.(event.target.value)
  }

  return (
    <Form.Select
      aria-label="切換顯示語系"
      value={value}
      onChange={handleChange}
      size={size}
      className={className}
      style={style}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  )
}
