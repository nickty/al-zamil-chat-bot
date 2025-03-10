"use client"

import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import type { EstimationHistory } from "@/utils/api"
import { PencilLine, CheckCircle, FileBox, Archive, CalendarClock } from "lucide-react"

interface EstimationHistoryViewProps {
  history: EstimationHistory[]
}

export function EstimationHistoryView({ history }: EstimationHistoryViewProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No history available for this estimation</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <FileBox className="h-4 w-4" />
      case "updated":
        return <PencilLine className="h-4 w-4" />
      case "status_changed":
        return <CalendarClock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "archived":
        return <Archive className="h-4 w-4" />
      default:
        return <FileBox className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="relative space-y-6 ml-6 before:absolute before:inset-y-0 before:left-0 before:ml-3.5 before:border-l-2 before:border-muted">
          {history.map((item) => (
            <div key={item._id} className="relative pb-4">
              <div className="absolute -left-6 top-0 rounded-full bg-background flex items-center justify-center">
                <div className="h-7 w-7 rounded-full border-2 border-muted flex items-center justify-center bg-background">
                  {getActionIcon(item.action)}
                </div>
              </div>
              <div className="ml-6">
                <div className="text-sm">
                  <span className="font-medium">{item.user?.name || "System"} </span>
                  <span>{item.description}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(item.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </div>
                {item.details && (
                  <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(item.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

