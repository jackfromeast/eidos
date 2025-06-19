import { create } from "zustand"
import { persist } from "zustand/middleware"

type Store = {
  currentSysPrompt: string
  setCurrentSysPrompt: (value: string) => void
  enabledTools: Record<string, Record<string, boolean>>
  getEnabledTools: (space: string) => Record<string, boolean>
  setEnabledTools: (space: string, tools: Record<string, boolean>) => void
  toggleTool: (space: string, toolName: string) => void
  maxSteps: Record<string, number>
  getMaxSteps: (space: string) => number
  setMaxSteps: (space: string, steps: number) => void
}

export const useAIChatStore = create<Store>()(
  persist(
    (set, get) => ({
      currentSysPrompt: "base",
      setCurrentSysPrompt: (value) => set(() => ({ currentSysPrompt: value })),
      enabledTools: {},
      getEnabledTools: (space: string) => {
        return get().enabledTools[space] || {}
      },
      setEnabledTools: (space: string, tools: Record<string, boolean>) => {
        set((state) => ({
          enabledTools: {
            ...state.enabledTools,
            [space]: tools
          }
        }))
      },
      toggleTool: (space: string, toolName: string) => {
        set((state) => {
          const spaceTools = state.enabledTools[space] || {}
          return {
            enabledTools: {
              ...state.enabledTools,
              [space]: {
                ...spaceTools,
                [toolName]: !spaceTools[toolName]
              }
            }
          }
        })
      },
      maxSteps: {},
      getMaxSteps: (space: string) => {
        return get().maxSteps[space] || 5
      },
      setMaxSteps: (space: string, steps: number) => {
        set((state) => ({
          maxSteps: {
            ...state.maxSteps,
            [space]: steps
          }
        }))
      }
    }),
    {
      name: "ai-chat-store",
      getStorage: () => localStorage,
      partialize: (state) => ({
        enabledTools: state.enabledTools,
        maxSteps: state.maxSteps
      })
    }
  )
)

