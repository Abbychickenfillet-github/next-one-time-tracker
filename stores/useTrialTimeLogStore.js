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
        const now = new Date()
        set({
          startTime: now,
          endTime: null,
          lastStepTime: now,
          steps: [],
        })
      },

      // 結束活動
      endActivity: () => {
        set({ endTime: new Date() })
      },

      // 新增階段步驟
      addStep: () => {
        const state = get()
        const now = new Date()
        const newStep = {
          name: `步驟 ${state.steps.length + 1}`,
          description: '',
          startTime: now,
          endTime: null,
        }
        set({
          steps: [...state.steps, newStep],
          lastStepTime: now,
        })
      },

      // 結束子步驟
      endSubStep: (index) => {
        const state = get()
        const updatedSteps = state.steps.map((step, i) =>
          i === index ? { ...step, endTime: new Date() } : step
        )
        set({ steps: updatedSteps })
      },

      // 語音輸入處理
      handleVoiceResult: (result) => {
        if (result.title) set({ title: result.title })
        if (result.desc) set({ desc: result.desc })
      },

      // 清除 localStorage
      clearStorage: () => {
        set({
          title: '',
          desc: '',
          memo: '',
          startTime: null,
          endTime: null,
          steps: [],
          currentTime: null,
          isClient: false,
          lastStepTime: null,
          titleHistory: [],
        })
      },

      // 計算已進行時間（分鐘）
      getElapsedMinutes: () => {
        const state = get()
        if (!state.startTime) return 0
        const endTime = state.endTime || state.currentTime
        if (!endTime) return 0
        return Math.floor(
          (endTime.getTime() - state.startTime.getTime()) / 1000 / 60
        )
      },

      // 獲取活動狀態
      getActivityStatus: () => {
        const state = get()
        if (state.startTime && !state.endTime) return '進行中'
        if (state.endTime) return '已結束'
        return '準備中'
      },
    }),
    {
      // persist() 中間件的配置選項
      name: 'trial-timelog-storage', // 試用版專用 localStorage key
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
  )
)
