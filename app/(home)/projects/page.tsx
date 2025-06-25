import Image from "next/image"
import { Calendar, MapPin, Users, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const featuredProjects = [
  {
    id: 1,
    title: "Sandton City Office Complex",
    category: "Commercial",
    location: "Sandton, Johannesburg",
    year: "2024",
    image: "/commercial.jpeg",
    description: "Complete aluminum facade system with energy-efficient glazing for a 15-story office building.",
    features: ["Curtain Wall System", "Energy Efficient Glazing", "Custom Extrusions"],
    client: "Property Development Group",
  },
  {
    id: 2,
    title: "Luxury Residential Estate",
    category: "Residential",
    location: "Cape Town",
    year: "2023",
    image: "/luxury.jpeg",
    description: "Premium aluminum windows and doors for 50 luxury homes with ocean views.",
    features: ["Sliding Patio Doors", "Casement Windows", "Security Features"],
    client: "Coastal Developments",
  },
  {
    id: 3,
    title: "Industrial Warehouse Complex",
    category: "Industrial",
    location: "Durban",
    year: "2023",
    image: "/Industrial.jpeg",
    description: "Large-scale aluminum roofing and cladding system for logistics facility.",
    features: ["Industrial Roofing", "Wall Cladding", "Ventilation Systems"],
    client: "Logistics Solutions SA",
  },
]

const projectStats = [
  { label: "Projects Completed", value: "5,000+", icon: Award },
  { label: "Years of Experience", value: "15+", icon: Calendar },
  { label: "Happy Clients", value: "2,500+", icon: Users },
  { label: "Cities Served", value: "25+", icon: MapPin },
]

export default function OurProjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {projectStats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Projects</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Showcasing our expertise across diverse sectors with innovative aluminum solutions.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-blue-600">{project.category}</Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {project.year}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Client:</strong> {project.client}
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Project Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We serve diverse sectors with specialized aluminum solutions tailored to each industry's unique
              requirements.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Residential</h3>
                <p className="text-gray-600 mb-4">
                  Premium windows, doors, and architectural features for homes and residential developments.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Sliding patio doors</li>
                  <li>• Casement windows</li>
                  <li>• Security installations</li>
                  <li>• Custom home features</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Commercial</h3>
                <p className="text-gray-600 mb-4">
                  Large-scale aluminum systems for office buildings, retail spaces, and commercial developments.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Curtain wall systems</li>
                  <li>• Storefront glazing</li>
                  <li>• Office partitions</li>
                  <li>• Architectural facades</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Industrial</h3>
                <p className="text-gray-600 mb-4">
                  Heavy-duty aluminum solutions for warehouses, factories, and industrial facilities.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Industrial roofing</li>
                  <li>• Wall cladding systems</li>
                  <li>• Ventilation solutions</li>
                  <li>• Structural components</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  )
}
