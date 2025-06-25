import { getAllUsers } from "@/actions/users"
import { ChatDashboard } from "@/components/chats/ChatDashboard"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"

export default async function ChatPage() {

    const user = await getAuthenticatedUser()

    const users = getAllUsers()

    return (
      <div className="h-screen bg-gray-100">
        <ChatDashboard currentUserId={user.id} isAdmin={user.isAdmin} />
      </div>
    )
}
