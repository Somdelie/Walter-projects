
import { getProjects } from "@/actions/project-actions"
import ProjectsClient from "@/components/frontend/projects/ProjectsClient"


export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-gray-50">
         <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Our Projects</h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Explore our portfolio of completed aluminum installations across residential, commercial, and industrial
              sectors.
            </p>
          </div>
        </div>
      </section>
      <ProjectsClient projects={projects} />
    </div>
  )
}
