import ChatDashboard from "@/components/chats/ChatDashboard"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"

export default async function ChatPage() {
  try {
    const user = await getAuthenticatedUser()

    return (
      <div className="h-screen bg-gray-100">
        <ChatDashboard currentUserId={user.id} isAdmin={user.isAdmin} />
      </div>
    )
  } catch (error) {
    console.error("Chat page error:", error)
    redirect("/")
  }
}
