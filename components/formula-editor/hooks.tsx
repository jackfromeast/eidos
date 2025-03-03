import { useEffect, useRef, useState } from "react"
import { completionStatus } from "@codemirror/autocomplete"
import { EditorView } from "codemirror"

import { Udf, UiColumn } from "./completions"

export interface UseEditorProps {
  editorRef: React.RefObject<HTMLDivElement>
  editorViewRef: React.MutableRefObject<EditorView | null>
  initializedRef: React.MutableRefObject<boolean>
  value: string
  onChange: (value: string) => void
  onSave?: (value: string) => void
  onEsc?: () => void
  columns?: UiColumn[]
  udfs?: Udf[]
  createEditorView: (
    element: HTMLElement,
    value: string,
    onChange: (value: string) => void,
    onSave?: (value: string) => void,
    uiColumns?: UiColumn[],
    udfs?: Udf[],
    language?: string,
    onEsc?: () => void,
    height?: string,
    onCurrentTokenChange?: (
      token: { text: string; type: string } | null
    ) => void,
    onArrowUp?: () => void,
    onArrowDown?: () => void,
    onEnter?: () => void
  ) => EditorView
  language?: string
  theme?: "light" | "dark"
  height?: string
  onCurrentTokenChange?: (token: { text: string; type: string } | null) => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onEnter?: () => void
}

/**
 * Custom hook to manage the CodeMirror editor instance
 */
export function useEditor({
  editorRef,
  editorViewRef,
  initializedRef,
  value,
  onChange,
  onSave,
  onEsc,
  columns,
  udfs,
  createEditorView,
  language = "sql",
  theme = "light",
  height = "100px",
  onCurrentTokenChange,
  onArrowUp,
  onArrowDown,
  onEnter,
}: UseEditorProps) {
  // Track completion state
  const [isCompletionActive, setIsCompletionActive] = useState(false)

  // Add a flag to track if the editor is destroyed
  const isDestroyedRef = useRef(false)

  // Initialize editor
  useEffect(() => {
    if (
      editorRef.current &&
      !initializedRef.current &&
      typeof window !== "undefined"
    ) {
      const view = createEditorView(
        editorRef.current,
        value,
        onChange,
        onSave,
        columns,
        udfs,
        language,
        onEsc,
        height,
        onCurrentTokenChange,
        onArrowUp,
        onArrowDown,
        onEnter
      )
      editorViewRef.current = view
      initializedRef.current = true

      // Set up a more reliable completion detection using state polling
      const checkCompletionStatus = () => {
        if (editorViewRef.current && !isDestroyedRef.current) {
          const isActive =
            completionStatus(editorViewRef.current.state) !== null
          if (isActive !== isCompletionActive) {
            setIsCompletionActive(isActive)
          }
        }
      }

      // Check initially
      checkCompletionStatus()

      // Set up interval to check regularly - use a shorter interval for better responsiveness
      const intervalId = setInterval(checkCompletionStatus, 50)

      // Always return a cleanup function
      return () => {
        clearInterval(intervalId)
        isDestroyedRef.current = true
        if (editorViewRef.current) {
          try {
            editorViewRef.current.destroy()
          } catch (error) {
            console.error("Error destroying editor:", error)
          }
          editorViewRef.current = null
          initializedRef.current = false
        }
      }
    }

    // Return a cleanup function even if we didn't initialize
    return () => {
      isDestroyedRef.current = true
      if (editorViewRef.current) {
        try {
          editorViewRef.current.destroy()
        } catch (error) {
          console.error("Error destroying editor:", error)
        }
        editorViewRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  // Handle external value changes
  useEffect(() => {
    if (
      editorViewRef.current &&
      initializedRef.current &&
      !isDestroyedRef.current &&
      editorViewRef.current.state.doc.toString() !== value
    ) {
      const currentCursor = editorViewRef.current.state.selection.main

      // Create a valid selection that's within the bounds of the new document
      const validSelection = {
        anchor: Math.min(currentCursor.anchor, value.length),
        head: Math.min(currentCursor.head, value.length),
      }

      const transaction = editorViewRef.current.state.update({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: value,
        },
        selection: validSelection,
      })

      editorViewRef.current.dispatch(transaction)
    }
  }, [value])

  // Add event listeners for ArrowUp and ArrowDown with improved completion detection
  useEffect(() => {
    if (editorViewRef.current && (onArrowUp || onArrowDown || onEnter)) {
      const editorDOM = editorViewRef.current.dom

      const handleKeyDown = (event: KeyboardEvent) => {
        // More reliable check for active completions
        const currentCompletionActive =
          editorViewRef.current &&
          completionStatus(editorViewRef.current.state) !== null

        // Skip custom key handling if completion is active
        if (currentCompletionActive) {
          return true
        }

        if (event.key === "ArrowUp" && onArrowUp) {
          event.preventDefault()
          event.stopPropagation()
          onArrowUp()
          return false
        }

        if (event.key === "ArrowDown" && onArrowDown) {
          event.preventDefault()
          event.stopPropagation()
          onArrowDown()
          return false
        }

        if (event.key === "Enter" && onEnter) {
          event.preventDefault()
          event.stopPropagation()
          onEnter()
          return false
        }
      }

      editorDOM.addEventListener("keydown", handleKeyDown, { capture: true })

      return () => {
        editorDOM.removeEventListener("keydown", handleKeyDown, {
          capture: true,
        })
      }
    }
  }, [editorViewRef.current, onArrowUp, onArrowDown, onEnter])

  // Update editor theme
  useEffect(() => {
    if (
      editorViewRef.current &&
      initializedRef.current &&
      !isDestroyedRef.current
    ) {
      try {
        // Theme update logic
      } catch (error) {
        console.error("Error updating editor theme:", error)
      }
    }
  }, [theme])
}
