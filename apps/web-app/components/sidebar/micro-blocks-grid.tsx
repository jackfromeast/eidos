import { ToyBrickIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { useCurrentPathInfo } from "@/apps/web-app/hooks/use-current-pathinfo"
import { useFavBlocks } from "@/apps/web-app/hooks/use-fav-blocks"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useTranslation } from "react-i18next"

export const MicroBlocksGrid = () => {
  const { space } = useCurrentPathInfo()
  const { favBlocks, removeFavBlock } = useFavBlocks()
  const { t } = useTranslation()

  if (favBlocks.length === 0) {
    return null
  }

  const handleRemoveFav = (blockId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeFavBlock(blockId)
  }

  // 根据数量动态确定列数
  const getGridCols = () => {
    const count = favBlocks.length
    if (count <= 2) return "grid-cols-2"
    if (count <= 9) return "grid-cols-3"
    return "grid-cols-4"
  }

  return (
    <div className={`grid ${getGridCols()} gap-3 p-2`}>
      {favBlocks.map((mblock) => (
        <ContextMenu key={mblock.id}>
          <ContextMenuTrigger asChild>
            <Link
              to={`/${space}/blocks/${mblock.id}`}
              className="group block"
            >
              <div className="relative w-full aspect-[2/1] rounded-md bg-secondary flex items-center justify-center overflow-hidden transition-colors duration-200 hover:ring-1">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-gray-800/20"></div>

                {/* Icon container */}
                <div className="relative z-10">
                  {mblock.icon && mblock.icon.startsWith("data:image") ? (
                    <img
                      src={mblock.icon}
                      alt={mblock.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <ToyBrickIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
              </div>
            </Link>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={(e) => handleRemoveFav(mblock.id, e)}
              className="text-destructive focus:text-destructive"
            >
              {t("common.remove")}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  )
}
