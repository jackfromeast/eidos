import { useEffect, useMemo } from "react"
import { Message } from "ai"
import { create } from "zustand"
import { uuidv7 } from "@/lib/utils"
import { useSqlite } from "@/hooks/use-sqlite"

export const EIDOS_CHAT_PROJECT_ID = "EIDOS_CHAT"

interface AIChatHistoryState {
    chatId: string
    chatHistory: Message[]
    chatHistoryMap: Map<string, Message[]>

    // Actions
    setChatId: (chatId: string) => void
    setChatHistory: (messages: Message[]) => void
    setChatHistoryMap: (map: Map<string, Message[]>) => void
    addMessage: (message: Message) => void
    clearChatHistory: () => void
}

export const useAIChatHistoryStore = create<AIChatHistoryState>((set, get) => ({
    chatId: "",
    chatHistory: [],
    chatHistoryMap: new Map(),

    setChatId: (chatId: string) => set({ chatId }),

    setChatHistory: (messages: Message[]) => {
        const { chatId, chatHistoryMap } = get()
        set({ chatHistory: messages })

        if (chatId) {
            const newMap = new Map(chatHistoryMap)
            newMap.set(chatId, messages)
            set({ chatHistoryMap: newMap })
        }
    },

    setChatHistoryMap: (map: Map<string, Message[]>) => set({ chatHistoryMap: map }),

    addMessage: (message: Message) => {
        const { chatHistory } = get()
        const newHistory = [...chatHistory, message]
        get().setChatHistory(newHistory)
    },

    clearChatHistory: () => set({
        chatId: "",
        chatHistory: [],
        chatHistoryMap: new Map()
    }),
}))

interface UseAIChatHistoryReturn {
    chatId: string
    chatHistory: Message[]
    chatHistoryMap: Map<string, Message[]>
    sortedChats: Array<{
        id: string
        messages: Message[]
        updatedAt: Date
    }>
    createNewChat: () => Promise<void>
    switchChat: (id: string) => void
    deleteChat: (id: string) => Promise<void>
    setChatHistory: (messages: Message[]) => void
    addMessage: (message: Message) => void
}

const getChatIds = async (sqlite: any) => {
    const chats = await sqlite?.chat.list({ project_id: EIDOS_CHAT_PROJECT_ID })
    if (!chats || chats.length === 0) return []
    return chats.map((chat: any) => ({
        id: chat.id,
        title: chat.title || 'Untitled Chat',
        created_at: chat.created_at
    }))
}

const listChatHistory = async (sqlite: any, chatId: string): Promise<Message[]> => {
    if (!chatId) return []
    const messages = await sqlite?.message.list({ chat_id: chatId })
    return messages.map((m: any) => ({
        id: m.id,
        content: m.content,
        createdAt: new Date(m.created_at!.replace(' ', 'T') + 'Z'),
        role: m.role as Message["role"],
    }))
}

export function useAIChatHistory(): UseAIChatHistoryReturn {
    const { sqlite } = useSqlite()
    const {
        chatId,
        chatHistory,
        chatHistoryMap,
        setChatId,
        setChatHistory,
        setChatHistoryMap,
        addMessage
    } = useAIChatHistoryStore()

    const sortedChats = useMemo(() => {
        return Array.from(chatHistoryMap.entries())
            .map(([id, messages]) => ({
                id,
                messages,
                updatedAt:
                    messages.length > 0
                        ? messages[messages.length - 1]?.createdAt ?? new Date(0)
                        : new Date(0),
            }))
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    }, [chatHistoryMap])

    useEffect(() => {
        async function fetchChatHistories() {
            if (sqlite) {
                const chats = await getChatIds(sqlite)
                if (chats.length > 0) {
                    const firstChatId = chats[0].id
                    setChatId(firstChatId)

                    const historyMap = new Map()
                    await Promise.all(
                        chats.map(async ({ id }: { id: string }) => {
                            const history = await listChatHistory(sqlite, id)
                            historyMap.set(id, history)
                        })
                    )
                    setChatHistoryMap(historyMap)

                    const currentHistory = historyMap.get(firstChatId) || []
                    setChatHistory(currentHistory)
                } else {
                    // 如果没有聊天记录，创建一个新的
                    const newChatId = uuidv7()
                    await sqlite.chat.add({
                        id: newChatId,
                        project_id: EIDOS_CHAT_PROJECT_ID,
                    })

                    const newMap = new Map()
                    newMap.set(newChatId, [])
                    setChatHistoryMap(newMap)
                    setChatId(newChatId)
                    setChatHistory([])
                }
            }
        }
        fetchChatHistories()
    }, [sqlite, setChatId, setChatHistory, setChatHistoryMap])

    const createNewChat = async () => {
        if (!sqlite) return

        const newChatId = uuidv7()
        await sqlite.chat.add({
            id: newChatId,
            project_id: EIDOS_CHAT_PROJECT_ID,
        })

        const newMap = new Map(chatHistoryMap)
        newMap.set(newChatId, [])
        setChatHistoryMap(newMap)
        setChatId(newChatId)
        setChatHistory([])
    }

    const switchChat = (id: string) => {
        setChatId(id)
        const history = chatHistoryMap.get(id) || []
        setChatHistory(history)
    }

    const deleteChat = async (id: string) => {
        if (!sqlite) return
        await sqlite.chat.delete(id)
        const newMap = new Map(chatHistoryMap)
        newMap.delete(id)
        setChatHistoryMap(newMap)

        if (id === chatId) {
            const remainingIds = Array.from(newMap.keys())
            if (remainingIds.length > 0) {
                switchChat(remainingIds[0])
            } else {
                setChatId("")
                setChatHistory([])
            }
        }
    }

    return {
        chatId,
        chatHistory,
        chatHistoryMap,
        sortedChats,
        createNewChat,
        switchChat,
        deleteChat,
        setChatHistory,
        addMessage,
    }
} 