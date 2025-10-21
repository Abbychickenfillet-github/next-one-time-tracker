'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Lap Timer Zustand Store - 支援分圈和暫停功能
export const useLapTimerStore = create(
  persist(
    (set, get) => ({
      // ===== 狀態 =====
      title: '', // 活動名稱
      desc: '', // 階段描述
      memo: '', // 活動備註/反思
      startTime: null, // 活動開始時間
      endTime: null, // 活動結束時間
      currentTime: null, // 目前時間
      isClient: false, // 客戶端渲染標記

      // 分圈相關狀態
      laps: [], // 分圈記錄
      currentLapStartTime: null, // 當前分圈開始時間
      isRunning: false, // 是否正在運行
      isPaused: false, // 是否暫停

      // 暫停相關狀態
      pausePeriods: [], // 暫停期間記錄 [{start: Date, end: Date}]
      currentPauseStart: null, // 當前暫停開始時間

      // 總計時間
      totalElapsedTime: 0, // 總經過時間（毫秒）
      netElapsedTime: 0, // 淨時間（排除暫停時間）

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

      // 開始活動
      startActivity: () => {
        const state = get()
        if (!state.title.trim()) {
          alert('請先輸入活動名稱')
          return
        }
        if (state.isRunning) {
          alert('活動已在進行中')
          return
        }

        const now = new Date()
        set({
          startTime: now,
          currentLapStartTime: now,
          isRunning: true,
          isPaused: false,
          currentPauseStart: null,
          pausePeriods: [],
          laps: [],
          totalElapsedTime: 0,
          netElapsedTime: 0,
        })
      },

      // 暫停活動
      pauseActivity: () => {
        const state = get()
        if (!state.isRunning || state.isPaused) {
          alert('活動未在進行中或已暫停')
          return
        }

        const now = new Date()
        set({
          isPaused: true,
          currentPauseStart: now,
        })
      },

      // 恢復活動
      resumeActivity: () => {
        const state = get()
        if (!state.isRunning || !state.isPaused) {
          alert('活動未在進行中或未暫停')
          return
        }

        const now = new Date()
        const pauseDuration = now.getTime() - state.currentPauseStart.getTime()

        // 記錄暫停期間
        const newPausePeriods = [
          ...state.pausePeriods,
          { start: state.currentPauseStart, end: now, duration: pauseDuration },
        ]

        set({
          isPaused: false,
          currentPauseStart: null,
          pausePeriods: newPausePeriods,
        })
      },

      // 記錄分圈
      recordLap: () => {
        const state = get()
        if (!state.isRunning || state.isPaused) {
          alert('請先開始活動且不能處於暫停狀態')
          return
        }

        const now = new Date()
        const lapDuration = now.getTime() - state.currentLapStartTime.getTime()

        const newLap = {
          id: Date.now(),
          lapNumber: state.laps.length + 1,
          startTime: state.currentLapStartTime,
          endTime: now,
          duration: lapDuration,
          description: state.desc || `分圈 ${state.laps.length + 1}`,
          timestamp: now,
        }

        set({
          laps: [...state.laps, newLap],
          currentLapStartTime: now,
          desc: '', // 清空描述輸入框
        })
      },

      // 結束活動
      endActivity: () => {
        const state = get()
        if (!state.isRunning) {
          alert('請先開始活動')
          return
        }

        const now = new Date()

        // 如果正在暫停，先結束暫停
        if (state.isPaused) {
          const pauseDuration =
            now.getTime() - state.currentPauseStart.getTime()
          const newPausePeriods = [
            ...state.pausePeriods,
            {
              start: state.currentPauseStart,
              end: now,
              duration: pauseDuration,
            },
          ]

          set({
            pausePeriods: newPausePeriods,
            currentPauseStart: null,
          })
        }

        // 計算總時間
        const totalDuration = now.getTime() - state.startTime.getTime()
        const totalPauseDuration = state.pausePeriods.reduce(
          (sum, period) => sum + period.duration,
          0
        )
        const netDuration = totalDuration - totalPauseDuration

        set({
          endTime: now,
          isRunning: false,
          isPaused: false,
          totalElapsedTime: totalDuration,
          netElapsedTime: netDuration,
        })
      },

      // 重置活動
      resetActivity: () => {
        set({
          title: '',
          desc: '',
          startTime: null,
          endTime: null,
          currentLapStartTime: null,
          isRunning: false,
          isPaused: false,
          currentPauseStart: null,
          pausePeriods: [],
          laps: [],
          totalElapsedTime: 0,
          netElapsedTime: 0,
        })
      },

      // 清除 localStorage
      clearStorage: () => {
        localStorage.removeItem('lap-timer-storage')
        set({
          title: '',
          desc: '',
          startTime: null,
          endTime: null,
          currentLapStartTime: null,
          isRunning: false,
          isPaused: false,
          currentPauseStart: null,
          pausePeriods: [],
          laps: [],
          totalElapsedTime: 0,
          netElapsedTime: 0,
        })
      },

      // 計算當前經過時間
      getCurrentElapsedTime: () => {
        const state = get()
        if (!state.startTime) return 0

        const now = state.currentTime || new Date()
        const totalDuration = now.getTime() - state.startTime.getTime()

        // 計算當前暫停時間
        let currentPauseDuration = 0
        if (state.isPaused && state.currentPauseStart) {
          currentPauseDuration =
            now.getTime() - state.currentPauseStart.getTime()
        }

        // 計算總暫停時間
        const totalPauseDuration =
          state.pausePeriods.reduce((sum, period) => sum + period.duration, 0) +
          currentPauseDuration

        return totalDuration - totalPauseDuration
      },

      // 獲取活動狀態
      getActivityStatus: () => {
        const state = get()
        if (!state.isRunning) return '準備中'
        if (state.isPaused) return '已暫停'
        return '進行中'
      },

      // 格式化時間
      formatTime: (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        if (hours > 0) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      },
    }),
    {
      name: 'lap-timer-storage',
      partialize: (state) => ({
        title: state.title,
        desc: state.desc,
        memo: state.memo,
        startTime: state.startTime,
        endTime: state.endTime,
        laps: state.laps,
        pausePeriods: state.pausePeriods,
        totalElapsedTime: state.totalElapsedTime,
        netElapsedTime: state.netElapsedTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 處理時間欄位
          if (state.startTime && typeof state.startTime === 'string') {
            state.startTime = new Date(state.startTime)
          }
          if (state.endTime && typeof state.endTime === 'string') {
            state.endTime = new Date(state.endTime)
          }

          // 處理分圈記錄中的時間
          if (state.laps && Array.isArray(state.laps)) {
            state.laps = state.laps.map((lap) => ({
              ...lap,
              startTime:
                lap.startTime && typeof lap.startTime === 'string'
                  ? new Date(lap.startTime)
                  : lap.startTime,
              endTime:
                lap.endTime && typeof lap.endTime === 'string'
                  ? new Date(lap.endTime)
                  : lap.endTime,
              timestamp:
                lap.timestamp && typeof lap.timestamp === 'string'
                  ? new Date(lap.timestamp)
                  : lap.timestamp,
            }))
          }

          // 處理暫停期間中的時間
          if (state.pausePeriods && Array.isArray(state.pausePeriods)) {
            state.pausePeriods = state.pausePeriods.map((period) => ({
              ...period,
              start:
                period.start && typeof period.start === 'string'
                  ? new Date(period.start)
                  : period.start,
              end:
                period.end && typeof period.end === 'string'
                  ? new Date(period.end)
                  : period.end,
            }))
          }

          // 重置運行狀態（避免頁面刷新後狀態不一致）
          state.isRunning = false
          state.isPaused = false
          state.currentPauseStart = null
          state.currentLapStartTime = null
        }
      },
    }
  )
)
