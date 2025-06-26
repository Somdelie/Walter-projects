import ProjectForm from "@/components/dashboard/projects/ProjectForm"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"


export default async function NewProjectPage() {
  try {
    const user = await getAuthenticatedUser()

    if (!user.isAdmin) {
      redirect("/projects")
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-2">Add a new project to showcase your work</p>
          </div>
          <ProjectForm />
        </div>
      </div>
    )
  } catch (error) {
    console.error("New project page error:", error)
    redirect("/")
  }
}
