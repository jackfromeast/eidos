import { z } from "zod"
import { create } from "zustand"
// can use anything: IndexedDB, Ionic Storage, etc.
import { createJSONStorage, persist } from "zustand/middleware"

import { LLMProviderType } from "@/lib/ai/helper"

import { indexedDBStorage } from "@/lib/storage/indexeddb"

// Define the enum using all provider types directly
const providerTypes: [LLMProviderType, ...LLMProviderType[]] = [
  "openai",
  "google",
  "deepseek",
  "groq",
  "xai",
  "openrouter",
  "anthropic",
  "azure",
  "amazon-bedrock",
  // "fal",
  "deepinfra",
  "mistral",
  "togetherai",
  "cohere",
  "fireworks",
  "cerebras",
  // "replicate",
  "perplexity",
  // "luma",
  "openai-compatible",
];

export const llmProviderSchema = z.object({
  type: z.enum(providerTypes).default("openai"),
  name: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional().or(z.literal('')),
  models: z.string().default(""),
  enabled: z.boolean().optional(),
})

export type LLMProvider = z.infer<typeof llmProviderSchema>

export const aiFormSchema = z.object({
  localModels: z.array(z.string()).default([]),
  llmProviders: z.array(llmProviderSchema).default([]),
  // runtime
  autoLoadEmbeddingModel: z.boolean().default(false),
  // task model
  embeddingModel: z.string().optional(),
  translationModel: z.string().optional(),
  codingModel: z.string().optional(),
})

export type AIFormValues = z.infer<typeof aiFormSchema>

interface ConfigState {
  aiConfig: AIFormValues
  setAiConfig: (aiConfig: AIFormValues) => void
  addLLMProvider: (provider: LLMProvider) => void
  updateLLMProvider: (provider: LLMProvider) => void
  removeLLMProvider: (name: string) => void
}

export const useAIConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      aiConfig: {
        localModels: [],
        llmProviders: [],
        autoLoadEmbeddingModel: false,
      },
      setAiConfig: (aiConfig) => set({ aiConfig }),
      addLLMProvider: (provider: LLMProvider) =>
        set((state) => ({
          aiConfig: {
            ...state.aiConfig,
            llmProviders: [...state.aiConfig.llmProviders, provider],
          },
        })),
      updateLLMProvider: (provider: LLMProvider) =>
        set((state) => ({
          aiConfig: {
            ...state.aiConfig,
            llmProviders: state.aiConfig.llmProviders.map((p) => (p.name === provider.name ? provider : p)),
          },
        })),
      removeLLMProvider: (name: string) =>
        set((state) => ({
          aiConfig: {
            ...state.aiConfig,
            llmProviders: state.aiConfig.llmProviders.filter((p) => p.name !== name),
          },
        })),
    }),
    {
      name: "config-ai",
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
)
