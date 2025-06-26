import { getProjects } from "@/actions/project-actions"
import AdminProjectsClient from "@/components/dashboard/projects/AdminProjectsClient"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"


export default async function AdminProjectsPage() {
  try {
    const user = await getAuthenticatedUser()

    if (!user.isAdmin) {
      redirect("/projects")
    }

    const projects = await getProjects()

    return (
      <div className="min-h-screen bg-gray-50">
        <AdminProjectsClient projects={projects} />
      </div>
    )
  } catch (error) {
    console.error("Admin projects page error:", error)
    redirect("/")
  }
}
