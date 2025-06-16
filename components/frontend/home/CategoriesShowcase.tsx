import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Home, DoorOpen, Package, Wrench, Glasses, Building } from "lucide-react"

interface Category {
  id: string
  title: string
}

interface CategoriesShowcaseProps {
  categories: Category[]
}

const categoryIcons = {
  Windows: Home,
  Doors: DoorOpen,
  Profiles: Package,
  Hardware: Wrench,
  Glass: Glasses,
  Accessories: Building,
}

const categoryImages = {
  Windows: "/placeholder.svg?height=300&width=400",
  Doors: "/placeholder.svg?height=300&width=400",
  Profiles: "/placeholder.svg?height=300&width=400",
  Hardware: "/placeholder.svg?height=300&width=400",
  Glass: "/placeholder.svg?height=300&width=400",
  Accessories: "/placeholder.svg?height=300&width=400",
}

export default function CategoriesShowcase({ categories }: CategoriesShowcaseProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Product Categories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive range of aluminum solutions for every construction and architectural need
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.slice(0, 6).map((category, index) => {
            const IconComponent = categoryIcons[category.title as keyof typeof categoryIcons] || Package
            const imageUrl =
              categoryImages[category.title as keyof typeof categoryImages] || "/placeholder.svg?height=300&width=400"

            return (
              <Link key={category.id} href={`/products?category=${category.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={category.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Icon */}
                      <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-full">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </h3>
                      {/* <p className="text-gray-600 mb-4 line-clamp-2">
                        {category.description ||
                          `Professional ${category.title.toLowerCase()} solutions for your projects`}
                      </p> */}
                      <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                        <span>Explore {category.title}</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
