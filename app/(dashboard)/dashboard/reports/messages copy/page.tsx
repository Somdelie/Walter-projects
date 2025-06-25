
import { getConversationStats } from "@/actions/admin-conversations"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/config/useAuth"
import { AdminMessagesClient } from "@/components/dashboard/messages/AdminMessagesClient"


interface ConversationStats {
  totalConversations: number
  unreadConversations: number
  todayMessages: number
}

export default async function MessagePage() {
  try {
    const user = await getAuthenticatedUser()

    if (!user.isAdmin) {
      redirect("/unauthorized")
    }

    // Fetch initial stats on the server
    const stats = await getConversationStats()

    return <AdminMessagesClient adminId={user.id} initialStats={stats} />
  } catch (error) {
    console.error("Authentication error:", error)
    // redirect("/login")
  }
}
