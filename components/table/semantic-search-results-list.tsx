import { RefObject, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

import {
  SemanticSearchResult,
  SemanticSearchResultData,
} from "./hooks/use-table-search-store"

interface SemanticSearchResultsListProps {
  isSearching: boolean
  results: SemanticSearchResultData[] | undefined
  meta: SemanticSearchResult["meta"] | undefined
  selectedIndex: number
  onResultClick: (result: SemanticSearchResultData) => void
  onResultMouseEnter: (index: number) => void
  listRef: RefObject<HTMLUListElement>
}

export const SemanticSearchResultsList = ({
  isSearching,
  results,
  meta,
  selectedIndex,
  onResultClick,
  onResultMouseEnter,
  listRef,
}: SemanticSearchResultsListProps) => {
  const { t } = useTranslation()
  const keydownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const keyHeldRef = useRef<string | null>(null)

  useEffect(() => {
    const resultsLength = results?.length ?? 0

    const updateIndex = (direction: "up" | "down") => {
      if (resultsLength === 0) return

      onResultMouseEnter(
        direction === "down"
          ? (selectedIndex + 1) % resultsLength
          : (selectedIndex - 1 + resultsLength) % resultsLength
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Enter key press first
      if (event.key === "Enter") {
        // Check if results exist and an item is selected
        if (selectedIndex !== -1 && results && results[selectedIndex]) {
          onResultClick(results[selectedIndex]);
        }
        event.preventDefault(); // Prevent default form submission if applicable
        return; // Stop further execution for Enter key
      }

      if (resultsLength === 0) return
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
      if (keyHeldRef.current === event.key) return // Already handling this key hold

      event.preventDefault()
      keyHeldRef.current = event.key
      const direction = event.key === "ArrowDown" ? "down" : "up"

      // Update immediately on first press
      updateIndex(direction)

      // Clear any existing interval before starting a new one
      if (keydownIntervalRef.current) {
        clearInterval(keydownIntervalRef.current)
      }

      // Start interval for continuous update
      keydownIntervalRef.current = setInterval(() => {
        updateIndex(direction)
      }, 100) // Adjust interval duration (ms) for desired scroll speed
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (keydownIntervalRef.current) {
          clearInterval(keydownIntervalRef.current)
          keydownIntervalRef.current = null
        }
        keyHeldRef.current = null
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // Cleanup function
    return () => {
      if (keydownIntervalRef.current) {
        clearInterval(keydownIntervalRef.current)
      }
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      keyHeldRef.current = null // Reset ref on cleanup
    }
  }, [results?.length, selectedIndex, onResultMouseEnter])

  useEffect(() => {
    if (selectedIndex !== -1 && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLLIElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "auto" })
      }
    }
  }, [selectedIndex, listRef]) // Ensure listRef is in dependencies if it can change, although it usually doesn't

  if (isSearching) {
    return (
      <div className="p-2 text-center text-sm text-muted-foreground">
        {t("common.searching")}
      </div>
    )
  }

  if (!results || results.length === 0 || !meta) {
    return (
      <div className="p-2 text-center text-sm text-muted-foreground">
        {t("common.noSemanticResultsFound")}
      </div>
    )
  }

  return (
    <ul ref={listRef} className="divide-y divide-border">
      {results.map((result, index) => (
        <li
          key={result._id}
          className={cn(
            "px-3 py-2 text-sm cursor-pointer",
            index === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
          )}
          onClick={() => onResultClick(result)}
          onMouseEnter={() => onResultMouseEnter(index)}
        >
          {/* Assuming 'title' is a standard property or handled appropriately */}
          {/* Adjust this line if 'title' isn't guaranteed */}
          <span className="font-medium">
            {(result as any).title || "Untitled"}
          </span>{" "}
          <span className="line-clamp-3 overflow-hidden text-muted-foreground">
            {result[meta.embeddingFieldId]}
          </span>
        </li>
      ))}
    </ul>
  )
}
