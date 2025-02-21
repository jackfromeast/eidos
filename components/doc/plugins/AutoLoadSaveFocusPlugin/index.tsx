import { useCallback, useEffect, useRef } from "react"
import { $convertToMarkdownString } from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useDebounceFn, useKeyPress } from "ahooks"

import { useSqlite } from "@/hooks/use-sqlite"

import { allTransformers } from "../const"

interface AutoSavePluginProps {
  docId: string
  disableManuallySave?: boolean
  isEditable?: boolean
}

export const DefaultState = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
}

// this plugin is just used for eidos doc not a general plugin
export function EidosAutoLoadSaveFocusPlugin(props: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext()
  const { docId, disableManuallySave, isEditable } = props
  const lock = useRef(false)
  const { updateDoc, getDoc } = useSqlite()

  const handleSave = useCallback(async () => {
    if (!editor.isEditable()) return

    editor.update(async () => {
      const json = editor.getEditorState().toJSON()
      const content = JSON.stringify(json)
      const markdown = $convertToMarkdownString(allTransformers)
      await updateDoc(docId, content, markdown)
    })
  }, [docId, editor, updateDoc])

  useKeyPress(["ctrl.s", "meta.s"], (e) => {
    e.preventDefault()
    if (disableManuallySave) return
    handleSave()
  })

  useEffect(() => {
    editor.setEditable(Boolean(isEditable))
    if (isEditable) {
      if (editor._config.namespace === "eidos-notes-home-page") {
        // disable auto focus for home page's editor
        return
      }
      setTimeout(
        () => editor.focus(undefined, { defaultSelection: "rootStart" }),
        0
      )
    }
  }, [editor, isEditable])

  useEffect(() => {
    const loadInitialContent = async () => {
      lock.current = true
      const initContent = await getDoc(docId)

      let state = JSON.stringify(DefaultState)
      if (initContent) {
        try {
          state = initContent
        } catch (error) {
          console.error("Error parsing content:", error)
        }
      }

      editor.update(() => {
        const parsedState = editor.parseEditorState(state)
        editor.setEditorState(parsedState)
        editor.setEditable(Boolean(isEditable))

        if (editor.isEditable()) {
          if (editor._config.namespace === "eidos-notes-home-page") {
            // disable auto focus for home page's editor
            return
          }
          setTimeout(
            () => editor.focus(undefined, { defaultSelection: "rootStart" }),
            0
          )
        }
        lock.current = false
      })
    }

    loadInitialContent()
  }, [editor, docId, getDoc, isEditable])

  const { run: debounceSave } = useDebounceFn(updateDoc, { wait: 500 })

  useEffect(() => {
    const unRegister = editor.registerUpdateListener(
      ({ editorState, prevEditorState }) => {
        if (lock.current) return

        editor.update(() => {
          const json = editorState.toJSON()
          const oldJson = prevEditorState.toJSON()
          const content = JSON.stringify(json)
          const oldContent = JSON.stringify(oldJson)

          if (content === oldContent) return

          const markdown = $convertToMarkdownString(allTransformers)
          debounceSave(docId, content, markdown)
        })
      }
    )
    return () => unRegister()
  }, [editor, debounceSave, docId])

  return null
}
