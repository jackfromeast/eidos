import { forwardRef } from "react"
import { useTranslation } from "react-i18next"

import { isDesktopMode } from "@/lib/env"
import { useMblock } from "@/apps/web-app/hooks/use-mblock"

import { type BlockRendererRef } from "./block-renderer"
import { WebViewBlock } from "./webview-block"

export const ExtNodeBlockApp = forwardRef<
  BlockRendererRef,
  {
    space: string
    blockId: string | null
    nodeId: string
  }
>(({ space, blockId, nodeId }, ref) => {
  const { t } = useTranslation()
  const block = useMblock(blockId || undefined)
  if (!blockId) {
    // extnode need an enabled handle block to work
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="text-sm text-gray-500">
          {t("common.tips.extNodeNeedHandleBlock")}
        </div>
      </div>
    )
  }
  if (!block) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="text-sm text-gray-500">
          {t("common.tips.notFoundBlock")}
        </div>
      </div>
    )
  }
  if (!isDesktopMode) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="text-sm text-gray-500">
          {t(
            "common.tips.extNodeOnlyWorksOnDesktop",
            "ExtNode only works on desktop"
          )}
        </div>
      </div>
    )
  }

  if (isDesktopMode) {
    return (
      <WebViewBlock
        blockId={blockId}
        width="100%"
        height="100%"
        extraPath={nodeId}
      />
    )
  }
  return null
})

ExtNodeBlockApp.displayName = "ExtNodeBlockApp"
