'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ===== 時間處理工具函數（避免時區問題） =====
/**
 * 將 Date 物件轉換為本地時間字串格式（用於儲存）
 *
 * 為什麼不能用 toLocaleString()？
 * - toLocaleString() 格式不標準，例如："2025/11/1 上午11:28:00"
 * - 無法直接用 new Date() 解析回 Date 物件
 *
 * 為什麼不能用 new Date(dateString)？
 * - new Date('2025-11-01T11:28:00') 沒有時區信息時，不同瀏覽器行為可能不同
 * - 可能被當作 UTC 時間解析，造成時差
 *
 * 解決方案：使用標準格式但手動解析為本地時間
 */
const formatDateForStorage = (date) => {
  if (!date) return null
  // 使用標準格式：YYYY-MM-DDTHH:mm:ss（不包含時區信息）
  // 這樣儲存時不會被 JSON.stringify 轉為 UTC
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * 將本地時間字串轉換回 Date 物件（用於讀取）
 *
 * 為什麼不能直接用 new Date(dateString)？
 * - new Date('2025-11-01T11:28:00') 沒有時區時，可能被解析為 UTC
 * - 需要明確指定這是本地時間
 */
const parseLocalDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null

  // 如果已經是 ISO 格式（包含 Z 或時區），直接解析
  if (dateString.includes('Z') || dateString.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(dateString)
  }

  // 否則視為本地時間字串，使用 new Date() 的構造函數形式手動解析
  // new Date(year, month, day, hours, minutes, seconds) 會創建本地時間
  const [datePart, timePart] = dateString.split('T')
  if (!datePart || !timePart) return new Date(dateString)

  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds] = timePart.split(':').map(Number)

  // 使用 new Date() 構造函數形式（明確指定本地時間）
  return new Date(year, month - 1, day, hours, minutes, seconds || 0)
}

// Trial TimeLog Zustand Store
export const useTrialTimeLogStore = create(
  persist(
    (set, get) => ({
      // ===== 狀態 =====
      title: '', // 活動名稱
      desc: '', // 階段描述
      memo: '', // 活動備註/反思
      startTime: null, // 活動開始時間
      endTime: null, // 活動結束時間
      steps: [], // 步驟列表
      currentTime: null, // 目前時間
      isClient: false, // 客戶端渲染標記
      lastStepTime: null, // 最後步驟時間
      titleHistory: [], // 活動名稱歷史，用於下拉選單
      savedActivities: [], // 已儲存的活動列表

      // ===== Actions =====

      // 設定客戶端渲染標記
      // 而非布林值切換。如果要切換的話要setClient(true)或setClient(false)
      setClient: (isClient) => set({ isClient }),

      // 更新目前時間
      updateCurrentTime: () => set({ currentTime: new Date() }),

      // 設定活動名稱
      setTitle: (title) => set({ title }),

      // 設定階段描述
      setDesc: (desc) => set({ desc }),

      // 設定活動備註
      setMemo: (memo) => set({ memo }),

      // 設定活動名稱歷史
      setTitleHistory: (titleHistory) => set({ titleHistory }),

      // 開始活動
      startActivity: () => {
        // 以下的const state = { ... } 是解構賦值，將 get() 函數返回的對象解構賦值給 state 變量。也是閉包的外部變數
        const state = get() // get() 函數：獲取當前 store 的完整狀態
        if (!state.title.trim()) {
          alert('請先輸入活動名稱')
          return
        }
        if (state.startTime && !state.endTime) {
          alert('活動尚未結束')
          return
        }

        const now = new Date()
        const newStep = {
          type: 'start',
          title: `開始：${state.title}`,
          description: state.desc || '活動開始',
          text: `✅ 開始：${state.title} | ${now.toLocaleString()}`,
          startTime: now,
          endTime: now,
          ended: true,
        }

        set({
          // set() 函數：批量更新多個狀態，合併到現有狀態中
          startTime: now,
          lastStepTime: now,
          endTime: null,
          steps: [...state.steps, newStep], // 展開運算符：將新步驟添加到現有步驟陣列中
        })
      },

      // 結束活動
      endActivity: () => {
        const state = get() // get() 函數：獲取當前 store 的完整狀態
        if (!state.startTime) {
          alert('請先開始活動')
          return
        }
        if (state.endTime) {
          alert('活動已結束')
          return
        }

        const now = new Date()

        // 自動結束所有未完成的步驟
        const updatedSteps = state.steps.map((step) => {
          if (!step.ended && step.type === 'step') {
            return {
              ...step,
              ended: true,
              endTime: now,
              text: step.text + ` (結束於: ${now.toLocaleTimeString()})`,
              description:
                step.description + ` (結束於: ${now.toLocaleTimeString()})`,
            }
          }
          return step
        })

        const newStep = {
          type: 'end',
          title: `結束：${state.title}`,
          description: `活動結束：${state.title}`,
          text: `結束：${state.title} | ${now.toLocaleString()}`,
          startTime: now,
          endTime: now,
          ended: true,
        }

        set({
          // set() 函數：批量更新多個狀態，合併到現有狀態中
          endTime: now,
          steps: [...updatedSteps, newStep], // 展開運算符：將新步驟添加到已更新的步驟陣列中
        })
      },

      // 新增階段步驟
      addStep: () => {
        const state = get() // get() 函數：獲取當前 store 的完整狀態
        if (!state.desc.trim()) {
          alert('請輸入階段描述')
          return
        }
        if (!state.startTime) {
          alert('請先開始活動')
          return
        }
        if (state.endTime) {
          alert('活動已結束')
          return
        }
        // 檢查步驟數量限制
        if (state.steps.length >= 100) {
          alert('每個活動最多只能有100個步驟')
          return
        }

        const now = new Date()
        const newStep = {
          type: 'step',
          title: state.desc,
          description: state.desc,
          text: `${state.desc} | ${now.toLocaleString()}`, //這邊的豎直號是字串分隔符號
          startTime: now,
          endTime: null,
          ended: false,
        }

        set({
          // set() 函數：批量更新多個狀態，合併到現有狀態中
          lastStepTime: now,
          steps: [...state.steps, newStep], // 展開運算符：將新步驟添加到現有步驟陣列中
          desc: '', // 清空描述輸入框
        })
      },

      // 結束子步驟
      endSubStep: (index) => {
        const state = get() // get() 函數：獲取當前 store 的完整狀態
        const now = new Date()

        set({
          // set() 函數：批量更新多個狀態，合併到現有狀態中
          steps: state.steps.map(
            (
              step,
              i // map() 函數：遍歷步驟陣列，返回新陣列
            ) =>
              i === index // 條件判斷：如果索引匹配
                ? {
                    ...step, // 展開運算符：複製原步驟的所有屬性
                    ended: true,
                    endTime: now,
                    text: step.text + ` (結束於: ${now.toLocaleTimeString()})`,
                    description:
                      step.description +
                      ` (結束於: ${now.toLocaleTimeString()})`,
                  }
                : step // 如果不匹配，返回原步驟不變
          ),
        })
      },

      // 語音輸入處理
      handleVoiceResult: (text) => {
        set({ desc: text }) // set() 函數：更新 desc 狀態為語音識別結果
      },

      // 清除 localStorage 中的資料
      clearStorage: () => {
        // 清除主要的 trial-timelog-storage
        localStorage.removeItem('trial-timelog-storage')

        // 清除所有帶序數的活動記錄
        for (let i = 1; i <= 10; i++) {
          localStorage.removeItem(`trial-activity-${i}`)
        }

        set({
          title: '',
          desc: '',
          startTime: null,
          endTime: null,
          steps: [],
          currentTime: null,
          lastStepTime: null,
          savedActivities: [],
        })
      },

      // 計算已進行時間（分鐘）
      getElapsedMinutes: () => {
        const state = get() // get() 函數：獲取當前 store 的完整狀態
        if (!state.startTime) return 0

        const endTime = state.endTime || state.currentTime
        if (!endTime) return 0

        return Math.floor(
          // Math.floor() 函數：向下取整，計算分鐘數
          (endTime.getTime() - state.startTime.getTime()) / 1000 / 60
        )
      },

      // 獲取活動狀態
      getActivityStatus: () => {
        const state = get() // get() 函數：獲取當前 store 的完整狀態
        if (state.startTime && !state.endTime) return '進行中'
        if (state.endTime) return '已結束'
        return '準備中'
      },

      // 儲存當前活動
      saveCurrentActivity: () => {
        const state = get()

        // 檢查是否有完整的活動資料
        if (!state.title.trim()) {
          alert('請先輸入活動名稱')
          return false
        }

        if (!state.startTime) {
          alert('請先開始活動')
          return false
        }

        if (!state.endTime) {
          alert('請先結束活動')
          return false
        }

        // 檢查實際的 localStorage 狀態，找到第一個空缺或下一個序號
        // 這樣可以避免覆蓋現有記錄

        // 邏輯 1：找第一個空缺（找到就停止，提高效率）
        let nextIndex = null
        for (let i = 1; i <= 10; i++) {
          const key = `trial-activity-${i}`
          if (!localStorage.getItem(key)) {
            nextIndex = i // 找到第一個空缺
            break // 找到就停止，不需要繼續檢查
          }
        }

        // 邏輯 2：計算實際存在的總數（需要遍歷所有）
        let actualCount = 0
        for (let i = 1; i <= 10; i++) {
          const key = `trial-activity-${i}`
          if (localStorage.getItem(key)) {
            actualCount++ // 每找到一個存在的就 +1
          }
        }

        // 如果沒有空缺（全部都有），使用下一個序號
        if (nextIndex === null) {
          nextIndex = actualCount + 1
        }

        // 檢查是否已達10筆限制
        if (nextIndex > 10) {
          alert('已達到試用版10筆記錄限制，請註冊升級享受無限記錄！')
          return false
        }

        // 創建活動記錄
        // 使用本地時間字串格式儲存，避免時區轉換問題
        const activityRecord = {
          id: Date.now(), // 使用時間戳作為唯一ID
          title: state.title,
          desc: state.desc,
          memo: state.memo,
          // 使用本地時間字串格式儲存，避免 UTC 轉換問題
          startTime: formatDateForStorage(state.startTime),
          endTime: formatDateForStorage(state.endTime),
          // steps 中的時間也需要轉換
          steps: state.steps.map((step) => ({
            ...step,
            startTime: formatDateForStorage(step.startTime),
            endTime: formatDateForStorage(step.endTime),
          })),
          createdAt: formatDateForStorage(new Date()),
          duration: state.endTime.getTime() - state.startTime.getTime(),
        }

        const storageKey = `trial-activity-${nextIndex}`

        try {
          localStorage.setItem(storageKey, JSON.stringify(activityRecord))

          // 更新已儲存活動列表
          set({
            savedActivities: [...state.savedActivities, activityRecord],
          })

          // 重置當前活動狀態
          set({
            title: '',
            desc: '',
            memo: '',
            startTime: null,
            endTime: null,
            steps: [],
            lastStepTime: null,
          })

          return true
        } catch (error) {
          console.error('儲存活動失敗:', error)
          alert('儲存失敗，請檢查 localStorage 空間')
          return false
        }
      },

      // 獲取已儲存活動數量
      getSavedActivitiesCount: () => {
        const state = get()
        return state.savedActivities.length
      },

      // 載入已儲存的活動
      loadSavedActivities: () => {
        if (typeof window === 'undefined') return

        try {
          const savedActivities = []

          // 檢查 localStorage 中所有 trial-activity-* 的 key
          for (let i = 1; i <= 10; i++) {
            const key = `trial-activity-${i}`
            const data = localStorage.getItem(key)

            if (data) {
              const activity = JSON.parse(data)

              // 轉換本地時間字串為 Date 物件（避免時區問題）
              if (activity.startTime) {
                activity.startTime = parseLocalDate(activity.startTime)
              }
              if (activity.endTime) {
                activity.endTime = parseLocalDate(activity.endTime)
              }
              if (activity.createdAt) {
                activity.createdAt = parseLocalDate(activity.createdAt)
              }

              // 處理 steps 中的時間
              if (activity.steps && Array.isArray(activity.steps)) {
                activity.steps = activity.steps.map((step) => ({
                  ...step,
                  startTime: parseLocalDate(step.startTime),
                  endTime: parseLocalDate(step.endTime),
                }))
              }

              savedActivities.push(activity)
            }
          }

          set({ savedActivities })
        } catch (error) {
          console.error('載入已儲存活動失敗:', error)
        }
      },

      // 刪除已儲存的活動
      deleteSavedActivity: (activityId) => {
        const state = get()

        // 找到要刪除的活動
        const activityToDelete = state.savedActivities.find(
          (activity) => activity.id === activityId
        )

        if (activityToDelete) {
          // 從 localStorage 中刪除
          const activityIndex = state.savedActivities.findIndex(
            (activity) => activity.id === activityId
          )
          const storageKey = `trial-activity-${activityIndex + 1}`
          localStorage.removeItem(storageKey)

          // 重新整理 localStorage 中的序數，確保序號連續
          state.reorganizeStorage()

          // 重新載入所有活動，確保狀態與 localStorage 同步
          const updatedActivities = []
          for (let i = 1; i <= 10; i++) {
            const key = `trial-activity-${i}`
            const data = localStorage.getItem(key)
            if (data) {
              const activity = JSON.parse(data)

              // 轉換本地時間字串為 Date 物件（避免時區問題）
              activity.startTime = parseLocalDate(activity.startTime)
              activity.endTime = parseLocalDate(activity.endTime)
              activity.createdAt = parseLocalDate(activity.createdAt)

              updatedActivities.push(activity)
            }
          }

          // 更新狀態（從實際的 localStorage 載入）
          set({
            savedActivities: updatedActivities,
          })
        }
      },

      // 重新整理 localStorage 序數
      reorganizeStorage: () => {
        if (typeof window === 'undefined') return

        try {
          const activities = []

          // 收集所有活動
          for (let i = 1; i <= 10; i++) {
            const key = `trial-activity-${i}`
            const data = localStorage.getItem(key)
            if (data) {
              activities.push(JSON.parse(data))
            }
          }

          // 清除所有舊的 key
          for (let i = 1; i <= 10; i++) {
            localStorage.removeItem(`trial-activity-${i}`)
          }

          // 重新儲存，確保序數連續
          activities.forEach((activity, index) => {
            const newKey = `trial-activity-${index + 1}`
            localStorage.setItem(newKey, JSON.stringify(activity))
          })
        } catch (error) {
          console.error('重新整理儲存失敗:', error)
        }
      },
    }),
    {
      // persist() 中間件的配置選項
      name: 'trial-timelog-storage', // name 屬性：指定 localStorage 中儲存的 key 名稱
      partialize: (state) => ({
        // partialize 函數：選擇要持久化的狀態，過濾掉不需要的狀態
        // 只持久化這些狀態，不包含 currentTime 和 isClient
        title: state.title,
        desc: state.desc,
        startTime: state.startTime,
        endTime: state.endTime,
        steps: state.steps,
        lastStepTime: state.lastStepTime,
        savedActivities: state.savedActivities, // 持久化已儲存的活動列表
      }),
      // onRehydrateStorage: 當從 localStorage 恢復狀態時執行的回調函數
      // 問題：localStorage 只能儲存字串，Date 物件會被序列化為字串
      // 解決：在恢復時將字串轉換回 Date 物件
      onRehydrateStorage: () => (state) => {
        // 檢查 state 是否存在（防止空值錯誤）
        if (state) {
          // 處理 startTime：如果存在且為字串，轉換為 Date 物件（使用本地時間解析）
          if (state.startTime && typeof state.startTime === 'string') {
            state.startTime = parseLocalDate(state.startTime)
          }

          // 處理 endTime：如果存在且為字串，轉換為 Date 物件（使用本地時間解析）
          if (state.endTime && typeof state.endTime === 'string') {
            state.endTime = parseLocalDate(state.endTime)
          }

          // 處理 lastStepTime：如果存在且為字串，轉換為 Date 物件（使用本地時間解析）
          if (state.lastStepTime && typeof state.lastStepTime === 'string') {
            state.lastStepTime = parseLocalDate(state.lastStepTime)
          }

          // 處理 steps 陣列中的時間欄位
          // steps 是陣列，需要遍歷每個 step 並處理其時間欄位
          if (state.steps && Array.isArray(state.steps)) {
            state.steps = state.steps.map((step) => ({
              ...step, // 展開運算符：保留 step 的所有原有屬性
              // 處理 step.startTime：如果為字串則轉換為 Date，否則保持原值
              startTime:
                step.startTime && typeof step.startTime === 'string'
                  ? parseLocalDate(step.startTime) // 使用本地時間解析
                  : step.startTime, // 保持原值（可能是 null 或已經是 Date）
              // 處理 step.endTime：如果為字串則轉換為 Date，否則保持原值
              endTime:
                step.endTime && typeof step.endTime === 'string'
                  ? parseLocalDate(step.endTime) // 使用本地時間解析
                  : step.endTime, // 保持原值（可能是 null 或已經是 Date）
            }))
          }

          // 處理 savedActivities 陣列中的時間欄位
          if (state.savedActivities && Array.isArray(state.savedActivities)) {
            state.savedActivities = state.savedActivities.map((activity) => ({
              ...activity,
              startTime:
                activity.startTime && typeof activity.startTime === 'string'
                  ? parseLocalDate(activity.startTime)
                  : activity.startTime,
              endTime:
                activity.endTime && typeof activity.endTime === 'string'
                  ? parseLocalDate(activity.endTime)
                  : activity.endTime,
              createdAt:
                activity.createdAt && typeof activity.createdAt === 'string'
                  ? parseLocalDate(activity.createdAt)
                  : activity.createdAt,
              // 處理 steps 中的時間
              steps:
                activity.steps && Array.isArray(activity.steps)
                  ? activity.steps.map((step) => ({
                      ...step,
                      startTime:
                        step.startTime && typeof step.startTime === 'string'
                          ? parseLocalDate(step.startTime)
                          : step.startTime,
                      endTime:
                        step.endTime && typeof step.endTime === 'string'
                          ? parseLocalDate(step.endTime)
                          : step.endTime,
                    }))
                  : activity.steps,
            }))
          }
        }
      },
    }
  ) // persist() 函數結束
) // create() 函數結束
