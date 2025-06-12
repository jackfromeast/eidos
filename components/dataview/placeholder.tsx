import { useState } from "react"
import { useTranslation } from "react-i18next"

import { formatSql } from "@/lib/sqlite/helper"
import { shortenId } from "@/lib/utils"
import { useDataView } from "@/hooks/use-data-view"
import { Button } from "@/components/ui/button"

import { SqlEditor } from "./sql-editor"
import { templates } from "./template"

export const DataViewPlaceholder = ({
  nodeId,
  onCreated,
}: {
  nodeId: string
  onCreated: () => void
}) => {
  const [sql, setSql] = useState("")
  const { createDataView } = useDataView()
  const { t } = useTranslation()

  const handleCreate = () => {
    createDataView(shortenId(nodeId), sql).then(onCreated)
  }

  const handleTemplateSelect = (templateSql: string) => {
    setSql(formatSql(templateSql))
  }

  return (
    <div className="p-4">
      <div className="flex gap-8 h-full">
        <div className="w-64 flex-shrink-0">
          <label className="block text-sm font-medium text-muted-foreground mb-4">
            {t("common.templates")}
          </label>
          <div className="flex flex-col gap-2">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => handleTemplateSelect(template.sql.trim())}
                className="p-2 text-left border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className="font-medium">{t(template.i18nKey)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t(template.descriptionKey)}
                </div>
                {template.tags && template.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="sql"
              className="block text-sm font-medium text-muted-foreground"
            >
              {t("common.sqlQuery")}
            </label>
            <Button size="xs" onClick={handleCreate}>
              {t("common.createDataView")}
            </Button>
          </div>
          <SqlEditor value={sql} onChange={setSql} />
        </div>
      </div>
    </div>
  )
}
