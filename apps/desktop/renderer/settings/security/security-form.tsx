"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/react-hook-form/form"

const securityFormSchema = z.object({
  webSecurity: z.boolean(),
  crossOriginDomains: z.array(z.string()),
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

export function SecurityForm() {
  const { t } = useTranslation()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: undefined,
  })
  const { reset, watch } = form

  useEffect(() => {
    if (!isInitialized) return

    const subscription = watch(() => {
      setIsDirty(true)
    })

    return () => subscription.unsubscribe()
  }, [watch, isInitialized])

  const onSubmit = async (value: SecurityFormValues) => {
    await window.eidos.config.set("security", { 
      webSecurity: value.webSecurity ?? true,
      crossOriginDomains: value.crossOriginDomains?.filter((domain): domain is string => typeof domain === 'string') || []
    })
    toast({
      title: t("settings.security.settingsUpdated"),
    })
    await window.eidos.reloadApp()
    setIsDirty(false)
  }

  useEffect(() => {
    const loadConfig = async () => {
      const securityConfig = await window.eidos.config.get("security")
      reset({ 
        webSecurity: securityConfig?.webSecurity ?? true,
        crossOriginDomains: securityConfig?.crossOriginDomains || []
      })
      setIsInitialized(true)
    }

    loadConfig()
  }, [reset])

  if (!isInitialized) {
    return null
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="webSecurity"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("settings.security.webSecurity")}
                </FormLabel>
                <FormDescription>
                  {t("settings.security.webSecurityDescription")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="crossOriginDomains"
          render={({ field }) => (
            <FormItem className="flex flex-col rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t("settings.security.crossOriginDomains")}
                  </FormLabel>
                  <FormDescription>
                    {t("settings.security.crossOriginDomainsDescription")}
                  </FormDescription>
                </div>
                <Button 
                  type="submit" 
                  disabled={!isDirty}
                  size="sm"
                >
                  {t("common.save")}
                </Button>
              </div>
              <FormControl>
                <div className="space-y-2">
                  {field.value.map((domain, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => {
                          const newDomains = [...field.value]
                          newDomains[index] = e.target.value
                          field.onChange(newDomains)
                        }}
                        className="flex-1 rounded-md border px-3 py-2"
                        placeholder="example.com"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newDomains = field.value.filter((_, i) => i !== index)
                          field.onChange(newDomains)
                        }}
                      >
                        {t("common.delete")}
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      field.onChange([...field.value, ""])
                    }}
                  >
                    {t("settings.security.addDomain")}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
