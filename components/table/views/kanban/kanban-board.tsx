"use client"

import { useVirtualList } from "ahooks"
import { Plus } from "lucide-react"
import { useTheme } from "next-themes"
import { memo, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { DataCard } from "@/components/table/views/shared/data-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanBoard as OriginKanbanBoard,
} from "@/components/ui/kibo-ui/kanban"
import { SelectField } from "@/lib/fields/select"
import { IField } from "@/lib/store/interface"
import { cn } from "@/lib/utils"

import { IGalleryViewProperties } from "../gallery/properties"
import { computeCardHeight } from "../gallery/utils"
import { KanbanItem, StatusCount, useKanbanItemOperations } from "./hooks"
import { IKanbanViewProperties } from "./properties"

export const KanbanBoard = memo(
  ({
    status,
    items,
    showFields,
    uiColumnMap,
    rawIdNameMap,
    tableId,
    space,
    properties,
    hiddenFields,
  }: {
    status: StatusCount
    items: KanbanItem[]
    showFields: IField[]
    uiColumnMap: Map<string, IField>
    rawIdNameMap: Map<string, string>
    tableId: string
    space: string
    properties?: IGalleryViewProperties & IKanbanViewProperties
    hiddenFields?: string[]
  }) => {
    const containerRef = useRef(null)
    const wrapperRef = useRef(null)
    const cardHeight = computeCardHeight(showFields.length)
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { createItem } = useKanbanItemOperations(
      tableId,
      space,
      properties?.groupByField
    )
    const [isAdding, setIsAdding] = useState(false)
    const [newItemTitle, setNewItemTitle] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const memoizedItems = useMemo(() => items || [], [items])

    const [list] = useVirtualList(memoizedItems, {
      containerTarget: containerRef,
      wrapperTarget: wrapperRef,
      itemHeight: (index) => {
        const item = items[index]
        if (!item) {
          return 0
        }
        if (!properties?.coverPreview) {
          return cardHeight - 200
        }
        return cardHeight
      },
      overscan: 10,
    })
    const bgColor = SelectField.getColorValue(
      status.color || "gray",
      theme === "dark" ? "dark" : "light",
      0.2
    )
    const cardWidth =
      properties?.cardSize === "small"
        ? "w-[300px]"
        : properties?.cardSize === "medium"
        ? "w-[350px]"
        : "w-[400px]"

    const handleCreateNewItem = async () => {
      const title = newItemTitle.trim()
      if (!title) return
      setNewItemTitle("")
      await createItem(title, status.status)
      setIsAdding(false)
    }

    return (
      <OriginKanbanBoard
        id={status.status}
        className={cn("flex flex-col shrink-0", cardWidth)}
        style={{
          backgroundColor: bgColor,
        }}
      >
        <KanbanHeader
          name={`${status.status} (${status.count})`}
          color={status.color || "gray"}
        />
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          ref={containerRef}
        >
          <KanbanCards ref={wrapperRef}>
            {list.map(({ data: item, index }) => (
              <KanbanCard
                key={item.id}
                id={item.id}
                name={item.title || item.name || item.id}
                parent={status.status}
                index={index}
                className={`h-[${cardHeight}px`}
              >
                <DataCard
                  key={item.id}
                  item={item}
                  showFields={showFields}
                  uiColumnMap={uiColumnMap}
                  rawIdNameMap={rawIdNameMap}
                  tableId={tableId}
                  space={space}
                  properties={properties}
                  hideCover={!properties?.coverPreview}
                  hiddenFields={hiddenFields}
                  style={{ padding: 0 }}
                />
              </KanbanCard>
            ))}
          </KanbanCards>
        </div>

        <div className="relative">
          {isAdding ? (
            <Card className="absolute bottom-full left-0 right-0 mb-2 p-2 shadow-lg">
              <input
                ref={inputRef}
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("kanban.newItem.inputTitle")}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItemTitle) {
                    handleCreateNewItem()
                  } else if (e.key === "Escape") {
                    setIsAdding(false)
                    setNewItemTitle("")
                  }
                }}
                onBlur={() => {
                  if (!newItemTitle.trim()) {
                    setIsAdding(false)
                  }
                }}
              />
            </Card>
          ) : null}

          <Button
            variant="ghost"
            className="w-full py-2 mt-2 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            onClick={() => {
              setIsAdding(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
          >
            <Plus size={16} />
            <span>{t("kanban.addNew")}</span>
          </Button>
        </div>
      </OriginKanbanBoard>
    )
  }
)
