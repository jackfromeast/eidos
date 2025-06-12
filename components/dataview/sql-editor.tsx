import { useEffect, useRef } from "react"
import { sql } from "@codemirror/lang-sql"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { keymap } from "@codemirror/view"
import { tags } from "@lezer/highlight"
import { EditorView, basicSetup } from "codemirror"
import { format } from "sql-formatter"

import { formatSql } from "@/lib/sqlite/helper"

const syntaxHighlightingTheme = HighlightStyle.define([
  {
    tag: tags.keyword,
    color: "var(--token-function-color)",
    fontWeight: "bold",
  },
  {
    tag: tags.function(tags.variableName),
    color: "var(--token-function-color)",
    fontWeight: "bold",
  },
  {
    tag: tags.className,
    color: "hsl(var(--primary))",
    fontWeight: "bold",
  },
  {
    tag: tags.propertyName,
    color: "var(--token-property-color)",
  },
  {
    tag: tags.variableName,
    color: "var(--token-variable-color)",
  },
  {
    tag: tags.typeName,
    color: "hsl(var(--accent))",
  },
  {
    tag: tags.string,
    color: "var(--token-attr-color)",
  },
  {
    tag: tags.number,
    color: "hsl(var(--chart-2))",
  },
  {
    tag: tags.comment,
    color: "var(--token-comment-color)",
    fontStyle: "italic",
  },
  {
    tag: tags.operator,
    color: "var(--token-operator-color)",
  },
  {
    tag: tags.punctuation,
    color: "var(--token-punctuation-color)",
  },
  {
    tag: tags.bracket,
    color: "var(--token-punctuation-color)",
  },
])

export const SqlEditor = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)
  const isUpdatingRef = useRef(false)

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && !editorViewRef.current) {
      const view = new EditorView({
        doc: value,
        extensions: [
          basicSetup,
          sql({
            upperCaseKeywords: true,
          }),
          syntaxHighlighting(syntaxHighlightingTheme),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !isUpdatingRef.current) {
              onChange(update.state.doc.toString())
            }
          }),
          keymap.of([
            {
              key: "Shift-Alt-f",
              run: (view) => {
                const currentValue = view.state.doc.toString()
                try {
                  const formatted = formatSql(currentValue)
                  isUpdatingRef.current = true
                  view.dispatch({
                    changes: {
                      from: 0,
                      to: view.state.doc.length,
                      insert: formatted,
                    },
                  })
                  isUpdatingRef.current = false
                  return true
                } catch (error) {
                  console.error("Failed to format SQL:", error)
                  return false
                }
              },
            },
          ]),
          EditorView.theme({
            "&": {
              height: "100%",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.375rem",
              backgroundColor: "hsl(var(--popover))",
            },
            "&.cm-focused": {
              outline: "none",
              boxShadow: "none",
            },
            ".cm-scroller": {
              fontFamily: "monospace",
            },
            ".cm-gutters": {
              display: "none",
            },
            ".cm-content": {
              color: "hsl(var(--foreground))",
            },
            "&.cm-focused .cm-cursor": {
              borderLeftColor: "hsl(var(--foreground))",
            },
            ".cm-selectionBackground": {
              backgroundColor: "hsl(var(--accent) / 0.2)",
            },
            "&.cm-focused .cm-selectionBackground": {
              backgroundColor: "hsl(var(--accent) / 0.3)",
            },
          }),
        ],
        parent: editorRef.current,
      })

      editorViewRef.current = view

      return () => {
        view.destroy()
        editorViewRef.current = null
      }
    }
  }, [])

  // Update editor content when value prop changes
  useEffect(() => {
    const view = editorViewRef.current
    if (view && value !== view.state.doc.toString()) {
      isUpdatingRef.current = true
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      })
      isUpdatingRef.current = false
    }
  }, [value])

  return <div ref={editorRef} className="w-full h-full" />
}
