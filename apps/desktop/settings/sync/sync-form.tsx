"use client"

import { useEffect, useState } from "react"
import { AppConfig, GraftConfig } from "@/electron/config"
import { useForm } from "react-hook-form"

import { useEngine } from "@/hooks/use-engine"
// Assuming GraftConfig is exported
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

// Define a type for the form data, including the top-level enabled flag
// and the graft settings.
type SyncFormData = {
  enabled: boolean
} & Partial<GraftConfig>

// Define a type for the full sync config object
type SyncConfig = AppConfig["sync"]

export function SyncForm() {
  // State to hold the full initial sync config (enabled + graft)
  const [initialConfig, setInitialConfig] = useState<SyncConfig | null>(null)

  const { reload } = useEngine()
  const form = useForm<SyncFormData>({
    // Default values will be set once the config is loaded
    defaultValues: {
      enabled: false, // Start with a default for enabled
      // Graft defaults will come from fetched config
    },
  })

  useEffect(() => {
    async function fetchConfig() {
      if (window.eidos?.config) {
        const syncConfig = await window.eidos.config.get("sync")
        setInitialConfig(syncConfig)
        // Reset form with fetched values, merging enabled and graft
        form.reset({
          enabled: syncConfig.enabled,
          ...syncConfig.graft, // Spread graft properties
        })
      }
    }
    fetchConfig()
  }, [form]) // Dependency array includes form

  async function onSubmit(data: SyncFormData) {
    if (window.eidos?.config) {
      try {
        // Separate enabled flag from graft settings
        const { enabled, ...graftConfig } = data

        // Construct the full sync object to save
        const syncConfigToSave: SyncConfig = {
          enabled: enabled,
          graft: graftConfig as GraftConfig, // Assume graftConfig has all needed fields or defaults
        }

        await window.eidos.config.set("sync", syncConfigToSave)
        toast({
          title: "Success",
          description: "Sync settings saved.",
        })

        // Refetch and reset form
        const updatedConfig = await window.eidos.config.get("sync")
        setInitialConfig(updatedConfig)
        form.reset({
          enabled: updatedConfig.enabled,
          ...updatedConfig.graft,
        })
        await reload() // Reload engine after successful save
      } catch (error) {
        console.error("Failed to save sync settings:", error)
        toast({
          title: "Error",
          description: "Failed to save sync settings.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Error",
        description: "Configuration manager not available.",
        variant: "destructive",
      })
    }
  }

  async function testMetaStoreConnection() {
    const metaStoreUrl = form.getValues("metastore")
    if (!metaStoreUrl) {
      toast({
        title: "Error",
        description: "Please enter a MetaStore URL.",
        variant: "destructive",
      })
      return
    }

    let healthUrl: URL
    try {
      // Ensure the base URL ends with a slash before appending /health
      const baseUrl = metaStoreUrl.endsWith("/")
        ? metaStoreUrl
        : `${metaStoreUrl}/`
      healthUrl = new URL("health", baseUrl)
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid MetaStore URL format.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(healthUrl.toString())
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const text = await response.text()
      // Convert response text to lowercase for case-insensitive comparison
      if (text.trim().toLowerCase() === "ok") {
        toast({
          title: "Success",
          description: "MetaStore connection successful!",
        })
      } else {
        toast({
          title: "Error",
          description: `MetaStore connection test failed. Expected "ok", received "${text}".`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("MetaStore connection test failed:", error)
      toast({
        title: "Error",
        description: `MetaStore connection failed: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  async function testPageStoreConnection() {
    const pageStoreUrl = form.getValues("pagestore")
    if (!pageStoreUrl) {
      toast({
        title: "Error",
        description: "Please enter a PageStore URL.",
        variant: "destructive",
      })
      return
    }

    let healthUrl: URL
    try {
      const baseUrl = pageStoreUrl.endsWith("/")
        ? pageStoreUrl
        : `${pageStoreUrl}/`
      healthUrl = new URL("health", baseUrl)
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid PageStore URL format.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(healthUrl.toString())
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const text = await response.text()
      if (text.trim().toLowerCase() === "ok") {
        toast({
          title: "Success",
          description: "PageStore connection successful!",
        })
      } else {
        toast({
          title: "Error",
          description: `PageStore connection test failed. Expected "ok", received "${text}".`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("PageStore connection test failed:", error)
      toast({
        title: "Error",
        description: `PageStore connection failed: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  if (!initialConfig) {
    // Optionally show a loading state
    return <div>Loading sync settings...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Enable Sync Toggle */}
        <FormField
          control={form.control}
          name="enabled" // Target the top-level enabled flag
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Sync</FormLabel>
                <FormDescription>
                  Enable or disable all synchronization features.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Graft Settings Section (Conditionally Rendered?) */}
        {/* You might want to disable/hide these when sync is disabled */}
        {/* For now, just keep them always visible but controlled by the form */}

        {/* MetaStore URL */}
        <FormField
          control={form.control}
          name="metastore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MetaStore URL</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input placeholder="http://127.0.0.1:3001" {...field} />
                </FormControl>
                <Button
                  type="button" // Prevent form submission
                  variant="outline"
                  onClick={testMetaStoreConnection}
                  disabled={!form.watch("metastore")} // Disable if URL is empty
                >
                  Test Connection
                </Button>
              </div>
              <FormDescription>
                The URL of your Graft MetaStore server.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PageStore URL */}
        <FormField
          control={form.control}
          name="pagestore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PageStore URL</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input placeholder="http://127.0.0.1:3000" {...field} />
                </FormControl>
                <Button
                  type="button" // Prevent form submission
                  variant="outline"
                  onClick={testPageStoreConnection}
                  disabled={!form.watch("pagestore")} // Disable if URL is empty
                >
                  Test Connection
                </Button>
              </div>
              <FormDescription>
                The URL of your Graft PageStore server.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* API Token */}
        {/*
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Token</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Optional token"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Optional authentication token for MetaStore and PageStore.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        {/* AutoSync Toggle */}
        <FormField
          control={form.control}
          name="autosync" // This now correctly maps to graft.autosync via form data
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable AutoSync</FormLabel>
                <FormDescription>
                  Automatically sync changes in the background.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Client ID (Read Only) - Usually auto-managed by Graft */}
        {/*
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client ID</FormLabel>
              <FormControl>
                <Input
                  readOnly
                  placeholder="Auto-generated"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Unique identifier for this client (usually auto-generated).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        <Button type="submit" disabled={!form.formState.isDirty}>
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
