"use client"

import { useConnectionStatus } from "@/hooks/use-connection-status"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected, transport } = useConnectionStatus()

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Wifi className="w-3 h-3 mr-1" />
          Connected ({transport})
        </Badge>
      ) : (
        <Badge variant="destructive">
          <WifiOff className="w-3 h-3 mr-1" />
          Disconnected
        </Badge>
      )}
    </div>
  )
}
