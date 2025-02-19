import { useEffect, useState } from "react"
import { useWhyDidYouUpdate } from "ahooks"
import { Settings2, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { Chart, type ChartConfig, type ChartType, type SeriesConfig } from "."

// Import the Chart component

interface ChartConfigFormProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChartConfigForm({
  config,
  onConfigChange,
  open,
  onOpenChange,
}: ChartConfigFormProps) {
  const [previewConfig, setPreviewConfig] = useState<ChartConfig>(config)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    console.log("config", config)
    setPreviewConfig(config)
  }, [config])
  const form = useForm<ChartConfig>({
    defaultValues: config,
  })

  // 修改 useEffect 中的监听逻辑
  useEffect(() => {
    const subscription = form.watch((value) => {
      // 直接使用表单的完整值作为预览配置
      const formValues = form.getValues()
      setPreviewConfig(formValues as ChartConfig)
      setIsDirty(JSON.stringify(formValues) !== JSON.stringify(config))
    })
    return () => subscription.unsubscribe()
  }, [form, config])

  // 新增：使用 form.watch 获取 series 值，然后在 useEffect 中检测并自动更新类型
  const series = form.watch("series")

  useEffect(() => {
    const uniqueSeriesTypes = new Set((series || []).map((s) => s.type))
    if (uniqueSeriesTypes.size > 1 && form.getValues("type") !== "composed") {
      form.setValue("type", "composed")
    }
  }, [series, form])

  const onSubmit = (values: Partial<ChartConfig>) => {
    console.log("Form values:", values)
    console.log("Merged config:", {
      ...config,
      ...values,
    })

    onConfigChange({
      ...config,
      ...values,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[90vw] max-w-[80vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Chart Configuration</DialogTitle>
            <div
              className="flex gap-2 transition-opacity duration-200"
              style={{
                opacity: isDirty ? 1 : 0,
                pointerEvents: isDirty ? "auto" : "none",
              }}
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-[3fr_5fr] gap-6 h-[calc(90vh-80px)]">
          {/* Configuration Form */}
          <div className="overflow-y-auto pr-4 pb-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Settings</h3>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chart Type</FormLabel>
                        <Select
                          onValueChange={(value: ChartType) =>
                            field.onChange(value)
                          }
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select chart type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="line">Line</SelectItem>
                            <SelectItem value="bar">Bar</SelectItem>
                            <SelectItem value="area">Area</SelectItem>
                            <SelectItem value="pie">Pie</SelectItem>
                            <SelectItem value="scatter">Scatter</SelectItem>
                            <SelectItem value="radar">Radar</SelectItem>
                            <SelectItem value="composed">Composed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Width and Height */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="100% or number"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="400" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Series Configuration */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Series Configuration
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newSeries = [...form.getValues().series]
                        newSeries.push({
                          type: "line",
                          dataKey: "",
                          name: "",
                          style: {},
                        })
                        form.setValue("series", newSeries)
                      }}
                    >
                      Add Series
                    </Button>
                  </div>

                  {form.watch("series")?.map((_, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Series {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newSeries = [...form.getValues().series]
                              newSeries.splice(index, 1)
                              form.setValue("series", newSeries)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`series.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                  onValueChange={(
                                    value: SeriesConfig["type"]
                                  ) => field.onChange(value)}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="line">Line</SelectItem>
                                    <SelectItem value="bar">Bar</SelectItem>
                                    <SelectItem value="area">Area</SelectItem>
                                    <SelectItem value="scatter">
                                      Scatter
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`series.${index}.dataKey`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Key</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select data key" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {config.data.length > 0 &&
                                      Object.keys(config.data[0])
                                        .filter((key) => {
                                          const value = config.data[0][key]
                                          // 只显示数值类型的字段作为 dataKey 选项
                                          return (
                                            typeof value === "number" ||
                                            !isNaN(Number(value))
                                          )
                                        })
                                        .map((key) => (
                                          <SelectItem key={key} value={key}>
                                            {key}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`series.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter series name"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`series.${index}.stack`}
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Stack</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Style Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`series.${index}.style.stroke`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stroke Color</FormLabel>
                                <FormControl>
                                  <Input
                                    type="color"
                                    {...field}
                                    className="h-10"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`series.${index}.style.fill`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fill Color</FormLabel>
                                <FormControl>
                                  <Input
                                    type="color"
                                    {...field}
                                    className="h-10"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Display Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Options</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="showGrid"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Show Grid</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showTooltip"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Show Tooltip</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showLegend"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Show Legend</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Preview Section */}
          <div className="border rounded-lg p-4 overflow-hidden bg-muted/30">
            <div className="flex flex-col h-full">
              {/* Chart Preview */}
              <div className="flex-1 min-h-[50%]">
                <h3 className="text-lg font-medium mb-4">Chart Preview</h3>
                <div className="w-full h-[calc(100%-40px)]">
                  <Chart {...previewConfig} />
                </div>
              </div>

              {/* Data Preview */}
              <div className="flex-1 min-h-[50%] mt-4">
                <h3 className="text-lg font-medium mb-4">Data Preview</h3>
                <div className="overflow-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {config.data.length > 0 &&
                          Object.keys(config.data[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-2 text-left font-medium"
                            >
                              {key}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {config.data.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t">
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="px-4 py-2">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {config.data.length > 5 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground border-t">
                      Showing 5 of {config.data.length} rows
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
