import { Shield, Award, Truck, Users, Clock, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "25-Year Warranty",
    description: "Comprehensive warranty coverage on all our aluminum products with full support",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Award,
    title: "ISO Certified Quality",
    description: "All products meet international quality standards with rigorous testing",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick turnaround times with reliable delivery across the country",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Professional consultation and technical support from our experienced team",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    icon: Clock,
    title: "25+ Years Experience",
    description: "Decades of expertise in aluminum solutions and customer satisfaction",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    icon: Wrench,
    title: "Custom Solutions",
    description: "Tailored aluminum solutions designed to meet your specific requirements",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose <span className="text-orange-500"> WalterProjects?</span></h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to delivering exceptional aluminum solutions with unmatched quality and service
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${feature.bgColor} flex-shrink-0`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
