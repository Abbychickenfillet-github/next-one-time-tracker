import React from 'react'
import styles from './glowing-text.module.scss'

const GlowingText = ({ text }) => {
  return (
    <div className={styles.glowing_txt}>
      <h1>
        {text.split(/(\s+)/).map((segment, segmentIndex) => {
          // 如果是空格，返回空格元素
          if (/\s+/.test(segment)) {
            return (
              <span key={`space-${segmentIndex}`} className={styles.space}>
                &nbsp;
              </span>
            )
          }
          // split(/(\s+)/) 是使用正則表達式（Regular Expression，簡稱 regex）。讓我解釋這個正則表達式的組成：

          // /...../ - 斜線是正則表達式的標記符號
          // \s - 代表任何空白字符（空格、tab、換行等）
          // + - 代表前面的字符出現一次或多次
          // () - 捕獲組，保留匹配到的空白字符
          // 如果是文字，拆分成單個字母
          return segment
            .split('')
            .map((letter, letterIndex) => (
              <span key={`${segmentIndex}-${letterIndex}`}>{letter}</span>
            ))
        })}
      </h1>
    </div>
  )
}

export default GlowingText
