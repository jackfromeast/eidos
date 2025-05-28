import { forwardRef } from "react"
import { IScript } from "@/worker/web-worker/meta-table/script"

import { Button } from "@/components/ui/button"
import { BlockRenderer } from "@/components/block-renderer/block-renderer"
import { DocEditorPlayground } from "@/components/doc-editor-playground"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface ScriptPreviewProps {
  script: IScript
  currentCompiledDraftCode: string
  height?: number
  onCompileAndSubmit: () => Promise<void>
}

export const ScriptPreview = forwardRef<HTMLDivElement, ScriptPreviewProps>(
  ({ script, currentCompiledDraftCode, height, onCompileAndSubmit }, ref) => {
    if (!script.code) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            No preview available. Build first to see the preview.
          </p>
          <Button onClick={onCompileAndSubmit} size="sm">
            Build
          </Button>
        </div>
      )
    }

    return (
      <div className="h-full p-2" ref={ref}>
        {script.type === "doc_plugin" && (
          <DocEditorPlayground code={currentCompiledDraftCode || script.code} />
        )}
        {script.type === "prompt" && (
          <div className="h-full overflow-auto p-2">
            <MarkdownRenderer>
              {currentCompiledDraftCode || script.code}
            </MarkdownRenderer>
          </div>
        )}
        {script.type === "m_block" && (
          <BlockRenderer
            blockId={script.id}
            code={script.ts_code || ""}
            compiledCode={currentCompiledDraftCode || script.code || ""}
            env={script.env_map}
            bindings={script.bindings}
            height={height}
          />
        )}
      </div>
    )
  }
)

ScriptPreview.displayName = "ScriptPreview"
