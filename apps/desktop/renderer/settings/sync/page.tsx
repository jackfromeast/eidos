import { AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

import { SyncForm } from "./sync-form"

export default function SettingsSyncPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings.sync", "Sync")}</h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "settings.sync.description",
            "Configure synchronization settings."
          )}
        </p>
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            {t(
              "settings.sync.experimentalWarning",
              "This is an experimental feature. Still in development."
            )}
          </AlertDescription>
        </Alert>
      </div>
      <Separator />
      <SyncForm />
    </div>
  )
}
