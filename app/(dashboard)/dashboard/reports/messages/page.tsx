
import AdminChatDashboard from "@/components/dashboard/chat/AdminChatDashboard"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"

export default async function AdminChatPage() {
  try {
    const user = await getAuthenticatedUser()

    // Only allow admins
    if (!user.isAdmin) {
      redirect("/chat")
    }

    return (
      <div className="h-screen bg-gray-50">
        <AdminChatDashboard currentUserId={user.id} />
      </div>
    )
  } catch (error) {
    console.error("Admin chat page error:", error)
    redirect("/")
  }
}
