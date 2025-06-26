
import { getProjectBySlug } from "@/actions/project-actions"
import ProjectDetailClient from "@/components/frontend/projects/ProjectDetailClient"
import { notFound } from "next/navigation"



export default async function ProjectDetailPage({ params }: {
  params: Promise<{ slug: string }>
}) {

  const slug = (await params).slug

  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectDetailClient project={project} />
    </div>
  )
}
