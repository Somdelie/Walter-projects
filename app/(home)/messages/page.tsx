// pages/messages/page.tsx (or wherever your page is)
import { MessagesComponent } from "@/components/frontend/messages/MessagesComponent"
import { getAuthenticatedUser } from "@/config/useAuth"


export default async function MessagesPage() {
  const user = await getAuthenticatedUser()
  
  return <MessagesComponent currentUserId={user.id} />
}