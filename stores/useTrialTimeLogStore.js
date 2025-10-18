'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

      // 重置狀態
      reset: () =>
        set({
          // set() 函數：批量重置所有狀態為初始值
          title: '',
          desc: '',
          startTime: null,
          endTime: null,
          steps: [],
          currentTime: null,
          lastStepTime: null,
        }),

      // 清除 localStorage 中的資料
      clearStorage: () => {
        localStorage.removeItem('trial-timelog-storage')
        set({
          title: '',
          desc: '',
          startTime: null,
          endTime: null,
          steps: [],
          currentTime: null,
          lastStepTime: null,
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
    }),
    {
      // persist() 中間件的配置選項
      name: 'trial-timelog-storage', // name 屬性：指定 localStorage 中儲存的 key 名稱
      partialize: (state) => ({
        // partialize 函數：選擇要持久化的狀態，過濾掉不需要的狀態
        // 只持久化這些狀態，不包含 currentTime 和 isClient
        // 只有當活動已結束時才持久化 steps，避免覆蓋主頁的已儲存資料
        title: state.title,
        desc: state.desc,
        startTime: state.startTime,
        endTime: state.endTime,
        steps: state.endTime ? state.steps : [], // 只有活動結束時才保存 steps
        lastStepTime: state.lastStepTime,
      }),
      // onRehydrateStorage: 當從 localStorage 恢復狀態時執行的回調函數
      // 問題：localStorage 只能儲存字串，Date 物件會被序列化為字串
      // 解決：在恢復時將字串轉換回 Date 物件
      onRehydrateStorage: () => (state) => {
        // 檢查 state 是否存在（防止空值錯誤）
        if (state) {
          // 處理 startTime：如果存在且為字串，轉換為 Date 物件
          if (state.startTime && typeof state.startTime === 'string') {
            state.startTime = new Date(state.startTime)
          }

          // 處理 endTime：如果存在且為字串，轉換為 Date 物件
          if (state.endTime && typeof state.endTime === 'string') {
            state.endTime = new Date(state.endTime)
          }

          // 處理 lastStepTime：如果存在且為字串，轉換為 Date 物件
          if (state.lastStepTime && typeof state.lastStepTime === 'string') {
            state.lastStepTime = new Date(state.lastStepTime)
          }

          // 處理 steps 陣列中的時間欄位
          // steps 是陣列，需要遍歷每個 step 並處理其時間欄位
          if (state.steps && Array.isArray(state.steps)) {
            state.steps = state.steps.map((step) => ({
              ...step, // 展開運算符：保留 step 的所有原有屬性
              // 處理 step.startTime：如果為字串則轉換為 Date，否則保持原值
              startTime:
                step.startTime && typeof step.startTime === 'string'
                  ? new Date(step.startTime) // 字串轉 Date
                  : step.startTime, // 保持原值（可能是 null 或已經是 Date）
              // 處理 step.endTime：如果為字串則轉換為 Date，否則保持原值
              endTime:
                step.endTime && typeof step.endTime === 'string'
                  ? new Date(step.endTime) // 字串轉 Date
                  : step.endTime, // 保持原值（可能是 null 或已經是 Date）
            }))
          }
        }
      },
    }
  ) // persist() 函數結束
) // create() 函數結束
