import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"

interface CalloutProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function Callout({
  children,
  className,
  icon = <InfoIcon className="h-4 w-4" />,
}: CalloutProps) {
  return (
    <div
      className={cn(
        "flex items-start rounded-md border border-blue-200 bg-blue-50 p-4",
        className
      )}
    >
      <div className="mr-4 mt-[2px] flex-shrink-0 text-blue-500">{icon}</div>
      <div className="text-sm text-blue-700">{children}</div>
    </div>
  )
} 