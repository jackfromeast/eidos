import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ITreeNode } from "@/lib/store/ITreeNode"

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
  contextNodes: ITreeNode[]
  setContextNodes: (nodes: ITreeNode[]) => void
  addContextNode: (node: ITreeNode) => void
  removeContextNode: (nodeId: string) => void
  clearContextNodes: () => void
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
      },
      contextNodes: [],
      setContextNodes: (nodes: ITreeNode[]) => {
        set(() => ({ contextNodes: nodes }))
      },
      addContextNode: (node: ITreeNode) => {
        set((state) => {
          // Check if the node already exists to avoid duplicates
          const exists = state.contextNodes.some((n) => n.id === node.id)
          if (exists) {
            return state
          }
          return {
            contextNodes: [...state.contextNodes, node]
          }
        })
      },
      removeContextNode: (nodeId: string) => {
        set((state) => ({
          contextNodes: state.contextNodes.filter((node) => node.id !== nodeId)
        }))
      },
      clearContextNodes: () => {
        set(() => ({ contextNodes: [] }))
      }
    }),
    {
      name: "ai-chat-store",
      getStorage: () => localStorage,
      partialize: (state) => ({
        enabledTools: state.enabledTools,
        maxSteps: state.maxSteps,
        contextNodes: state.contextNodes
      })
    }
  )
)

