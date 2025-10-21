### 登出時清除 LocalStorage 的 Timelog 資料

為避免不同帳號切換後，在 `/dashboard` 或 Timelog 頁面看到上一位使用者的活動與步驟，本專案在登出流程中加入了 LocalStorage 清除邏輯。

---

### 清除鍵值

- `timelog-storage`
- `trial-timelog-storage`

---

### 清除位置

在 `hooks/use-auth.js` 的登出函式中執行。程式碼片段如下：

```javascript
// hooks/use-auth.js 中的登出流程（節錄）
try {
  // ...
  localStorage.removeItem('timelog-storage')
  localStorage.removeItem('trial-timelog-storage')
  // ...
} catch (e) {
  console.warn('清除 timelog localStorage 失敗或無權限，已忽略。')
}
```

---

### 使用說明

- 透過導覽列或任何呼叫 `useAuth().logout()` 的地方登出時，上述兩個 LocalStorage key 會被移除。
- 若仍看到舊資料，請手動在瀏覽器 DevTools → Application → Local Storage 檢查並清除，或確認瀏覽器未在隱私/封鎖 Storage 的模式下運行。

---

### 背景說明

Timelog 的活動與步驟會儲存在瀏覽器的 LocalStorage，若不在登出時清除，切換不同帳號時可能短暫看到上一位使用者的紀錄。此變更可確保帳號切換時的資料隔離。

