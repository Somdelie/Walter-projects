"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"

interface ChatNavigationProps {
  showBackButton?: boolean
}

export function ChatNavigation({ showBackButton = false }: ChatNavigationProps) {
  const router = useRouter()

  return (
    <div className="flex items-center space-x-2 p-4 border-b bg-white">
      {showBackButton && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/chat")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Conversations
        </Button>
      )}
      <div className="flex items-center space-x-2">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h1 className="text-lg font-semibold">Chat</h1>
      </div>
    </div>
  )
}
