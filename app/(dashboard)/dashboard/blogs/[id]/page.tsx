import { getProjectById } from "@/actions/project-actions"
import ProjectForm from "@/components/dashboard/projects/ProjectForm"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"


interface EditProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  try {
    const user = await getAuthenticatedUser()

    if (!user.isAdmin) {
      redirect("/projects")
    }

    const { id } = await params
    const project = await getProjectById(id)

    if (!project) {
      redirect("/dashboard/blogs")
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600 mt-2">Update "{project.name}" project information and images</p>
          </div>
          <ProjectForm project={project} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Edit project page error:", error)
    redirect("/dashboard/blogs")
  }
}
