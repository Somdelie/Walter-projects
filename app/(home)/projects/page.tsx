
import { getProjects } from "@/actions/project-actions"
import ProjectsClient from "@/components/frontend/projects/ProjectsClient"


export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectsClient projects={projects} />
    </div>
  )
}
