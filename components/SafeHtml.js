// ========================================
// 🛡️ SafeHtml — 安全渲染 HTML 字串的共用元件
// ========================================
// 用途：
//   當你「必須把一段字串當成 HTML 來渲染」時（例如 blog 富文字內文、
//   含 <b> <a> 等格式的內容），先用 DOMPurify 把 <script>、onerror=、
//   javascript: 之類的危險東西拆掉，只留下安全標籤，避免 XSS。
//
// ⚠️ 什麼時候「不要」用：
//   - 一般顯示純文字（名字、標題、活動內容）請直接寫 {value}，
//     React 會自動跳脫，更安全也更快，用不到這個元件。
//   - 只有「真的要把字串當 HTML 格式渲染出來」時才用 <SafeHtml />。
//
// 📏 專案規矩：
//   本專案禁止直接使用 dangerouslySetInnerHTML，
//   要渲染 HTML 一律走 <SafeHtml />，集中在這一個地方做消毒。
//
// 為什麼用 isomorphic-dompurify（而非一般 dompurify）：
//   它在「伺服器端」和「瀏覽器端」都能消毒，所以送到使用者瀏覽器的
//   HTML 已經是乾淨的，不會有未消毒的瞬間，元件也能在 Server Component 使用。
// ========================================

import DOMPurify from 'isomorphic-dompurify'

/**
 * 安全渲染 HTML。
 *
 * @param {string}   html              要渲染的 HTML 字串（可能含使用者輸入）
 * @param {string}   [as='div']        外層要用的標籤，例如 'article'、'span'
 * @param {string[]} [allowedTags]     （選用）只允許這些標籤，例如 ['b','i','a','p','br']
 * @param {string[]} [allowedAttributes] （選用）只允許這些屬性，例如 ['href','target']
 * @param {...any}   rest              其餘屬性（className、style、id…）會原封不動套到外層標籤
 */
export default function SafeHtml({
  html,
  as: Tag = 'div',
  allowedTags,
  allowedAttributes,
  ...rest
}) {
  // 空值就不渲染，避免出現空的標籤
  if (!html) return null

  // 不傳白名單時，使用 DOMPurify 的安全預設值
  // （預設就會移除 <script>、事件屬性 onload/onerror、javascript: 連結等）
  const config = {}
  if (allowedTags) config.ALLOWED_TAGS = allowedTags
  if (allowedAttributes) config.ALLOWED_ATTR = allowedAttributes

  const clean = DOMPurify.sanitize(String(html), config)

  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: clean }} />
}
