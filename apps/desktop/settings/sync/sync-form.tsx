"use client"

import { useEffect, useState } from "react"
import { GraftConfig } from "@/electron/config"
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

type FormData = Partial<GraftConfig>

export function SyncForm() {
  const [initialConfig, setInitialConfig] = useState<GraftConfig | null>(null)

  const { reload } = useEngine()
  const form = useForm<FormData>({
    // We will set defaultValues once the config is loaded
    defaultValues: {},
  })

  useEffect(() => {
    async function fetchConfig() {
      if (window.eidos?.config) {
        const syncConfig = await window.eidos.config.get("sync")
        setInitialConfig(syncConfig.graft)
        // Reset form with fetched values
        form.reset(syncConfig.graft)
      }
    }
    fetchConfig()
  }, [form]) // Dependency array includes form to ensure reset happens correctly

  async function onSubmit(data: FormData) {
    if (window.eidos?.config) {
      try {
        await window.eidos.config.set("sync", { graft: data as GraftConfig })
        toast({
          title: "Success",
          description: "Sync settings saved.",
        })
        // Optionally refetch or update state if needed
        const updatedConfig = await window.eidos.config.get("sync")
        setInitialConfig(updatedConfig.graft)
        form.reset(updatedConfig.graft) // Reset form with potentially updated values (e.g., auto-generated clientId)
        await reload()
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
          name="autosync"
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
