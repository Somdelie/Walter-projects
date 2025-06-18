"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/Skeleton"

export function SettingsLoading() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
