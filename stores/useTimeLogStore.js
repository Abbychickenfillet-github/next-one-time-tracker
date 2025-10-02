'use client'

import { create } from 'zustand' // 導入 Zustand 的核心函數，用於創建狀態管理 store
import { persist } from 'zustand/middleware' // 導入持久化中間件，用於將狀態保存到 localStorage

// TimeLog Zustand Store
export const useTimeLogStore = create(
  // create() 函數：創建一個新的 Zustand store
  persist(
    // persist() 函數：包裝 store 以添加持久化功能，自動保存到 localStorage
    (set, get) => ({
      // set 函數：用於更新狀態；get 函數：用於獲取當前狀態
      // ===== 狀態 =====
      title: '', // 活動名稱
      desc: '', // 階段描述
      startTime: null, // 活動開始時間
      endTime: null, // 活動結束時間
      steps: [], // 步驟列表
      currentTime: null, // 目前時間
      isClient: false, // 客戶端渲染標記
      lastStepTime: null, // 最後步驟時間

      // ===== Actions =====

      // 設定客戶端渲染標記
      setClient: (isClient) => set({ isClient }), // set() 函數：更新 isClient 狀態為傳入的值

      // 更新目前時間
      updateCurrentTime: () => set({ currentTime: new Date() }), // set() 函數：更新 currentTime 為當前時間

      // 設定活動名稱
      setTitle: (title) => set({ title }), // set() 函數：更新 title 狀態為傳入的值

      // 設定階段描述
      setDesc: (desc) => set({ desc }), // set() 函數：更新 desc 狀態為傳入的值

      // 開始活動
      startActivity: () => {
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
        const newStep = {
          type: 'end',
          title: `結束：${state.title}`,
          description: `活動結束：${state.title}`,
          text: `🏁 結束：${state.title} | ${now.toLocaleString()}`,
          startTime: now,
          endTime: now,
          ended: true,
        }

        set({
          // set() 函數：批量更新多個狀態，合併到現有狀態中
          endTime: now,
          steps: [...state.steps, newStep], // 展開運算符：將新步驟添加到現有步驟陣列中
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

        const now = new Date()
        const newStep = {
          type: 'step',
          title: state.desc,
          description: state.desc,
          text: `${state.desc} | ${now.toLocaleString()}`,
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

      // 儲存到資料庫
      saveToDB: async (user, isAuth) => {
        const state = get() // get() 函數：獲取當前 store 的完整狀態

        if (!state.title.trim()) {
          alert('請先輸入活動名稱')
          return
        }
        if (!state.startTime) {
          alert('活動尚未開始')
          return
        }
        if (!state.endTime) {
          alert('活動尚未結束')
          return
        }

        // 檢查是否已登入
        if (!isAuth) {
          alert('請先登入才能儲存到資料庫')
          return
        }

        try {
          // 儲存主活動到 TimeLog 資料表
          const timeLogRes = await fetch('/api/timelog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: state.title,
              startTime: state.startTime,
              endTime: state.endTime,
              userId: user?.id || null,
            }),
          })

          if (!timeLogRes.ok) throw new Error('Failed to save TimeLog')
          const timeLogResult = await timeLogRes.json()

          if (timeLogResult.status !== 'success') {
            throw new Error(timeLogResult.message || 'Failed to save TimeLog')
          }

          const newLog = timeLogResult.data
          console.log('✅ TimeLog 創建成功:', newLog)

          // 儲存所有步驟到 Step 資料表
          for (const step of state.steps) {
            if (step.type === 'step') {
              const stepRes = await fetch('/api/step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  timeLogId: newLog.id,
                  title: step.title || step.text,
                  description: step.description || step.text,
                  startTime: step.startTime || new Date(),
                  endTime: step.endTime,
                }),
              })

              if (!stepRes.ok) throw new Error('Failed to save step')

              const stepResult = await stepRes.json()
              if (stepResult.status !== 'success') {
                throw new Error(stepResult.message || 'Failed to save step')
              }

              console.log('✅ Step 創建成功:', stepResult.data)
            }
          }

          console.log('✅ 成功儲存所有資料')
          alert('已儲存到資料庫')
        } catch (err) {
          console.error('❌ 儲存錯誤:', err)
          alert('儲存失敗，請檢查伺服器')
        }
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
        localStorage.removeItem('timelog-storage')
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
      name: 'timelog-storage', // name 屬性：指定 localStorage 中儲存的 key 名稱
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
      onRehydrateStorage: () => (state) => {
        // 當從 localStorage 恢復狀態時，將字串轉換回 Date 物件
        if (state) {
          if (state.startTime && typeof state.startTime === 'string') {
            state.startTime = new Date(state.startTime)
          }
          if (state.endTime && typeof state.endTime === 'string') {
            state.endTime = new Date(state.endTime)
          }
          if (state.lastStepTime && typeof state.lastStepTime === 'string') {
            state.lastStepTime = new Date(state.lastStepTime)
          }
          // 處理 steps 陣列中的時間
          if (state.steps && Array.isArray(state.steps)) {
            state.steps = state.steps.map((step) => ({
              ...step,
              startTime:
                step.startTime && typeof step.startTime === 'string'
                  ? new Date(step.startTime)
                  : step.startTime,
              endTime:
                step.endTime && typeof step.endTime === 'string'
                  ? new Date(step.endTime)
                  : step.endTime,
            }))
          }
        }
      },
    }
  ) // persist() 函數結束
) // create() 函數結束
