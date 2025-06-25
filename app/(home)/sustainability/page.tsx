import Image from "next/image"
import { Leaf, Recycle, Zap, Droplets, Award, TrendingUp, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const sustainabilityGoals = [
  {
    title: "Carbon Neutral Operations",
    target: "2030",
    progress: 65,
    description: "Achieving net-zero carbon emissions across all operations",
    icon: Leaf,
  },
  {
    title: "100% Renewable Energy",
    target: "2028",
    progress: 45,
    description: "Transitioning to renewable energy sources for all facilities",
    icon: Zap,
  },
  {
    title: "Zero Waste to Landfill",
    target: "2027",
    progress: 80,
    description: "Eliminating waste sent to landfills through recycling and reuse",
    icon: Recycle,
  },
  {
    title: "Water Conservation",
    target: "2026",
    progress: 70,
    description: "Reducing water consumption by 50% through efficiency measures",
    icon: Droplets,
  },
]

const initiatives = [
  {
    title: "Aluminum Recycling Program",
    description: "We recycle 95% of aluminum waste, reducing environmental impact and conserving resources.",
    impact: "2,500 tons recycled annually",
    icon: Recycle,
  },
  {
    title: "Energy Efficiency",
    description: "LED lighting, smart systems, and energy-efficient equipment reduce our carbon footprint.",
    impact: "40% energy reduction since 2020",
    icon: Zap,
  },
  {
    title: "Sustainable Sourcing",
    description: "Partnering with suppliers who share our commitment to environmental responsibility.",
    impact: "85% sustainable suppliers",
    icon: Globe,
  },
  {
    title: "Green Transportation",
    description: "Optimized delivery routes and eco-friendly vehicles minimize transportation emissions.",
    impact: "30% reduction in transport emissions",
    icon: TrendingUp,
  },
]

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-900 to-emerald-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Sustainability</h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Our commitment to environmentally responsible practices that protect our planet while delivering
              exceptional aluminum solutions.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-green-200">Aluminum Recycled</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Goals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Sustainability Goals</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've set ambitious targets to minimize our environmental impact and contribute to a sustainable future.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {sustainabilityGoals.map((goal, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <goal.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{goal.title}</h3>
                        <span className="text-sm font-medium text-green-600">Target: {goal.target}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{goal.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aluminum is Sustainable */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Aluminum is Sustainable</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Aluminum is one of the most sustainable materials available, offering unique properties that make it
                ideal for environmentally conscious construction and manufacturing.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Recycle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">100% Recyclable</h4>
                    <p className="text-gray-600 text-sm">
                      Aluminum can be recycled indefinitely without losing its properties, making it a truly circular
                      material.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Energy Efficient</h4>
                    <p className="text-gray-600 text-sm">
                      Recycling aluminum uses 95% less energy than producing new aluminum from raw materials.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Long Lasting</h4>
                    <p className="text-gray-600 text-sm">
                      Aluminum products have exceptional durability, reducing the need for frequent replacements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/Aluminumrecyclingprocess.jpg"
                alt="Aluminum recycling process"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">∞</div>
                <div className="text-sm">Times Recyclable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Initiatives */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Green Initiatives</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Concrete actions we're taking to reduce our environmental footprint and promote sustainable practices.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {initiatives.map((initiative, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <initiative.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{initiative.title}</h3>
                      <p className="text-gray-600 mb-4">{initiative.description}</p>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-800">Impact:</div>
                        <div className="text-green-700">{initiative.impact}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Environmental Impact</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Measuring our progress towards a more sustainable future through key environmental metrics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="text-4xl font-bold text-green-600 mb-2">2,500</div>
                <div className="text-gray-600">Tons of Aluminum Recycled</div>
                <div className="text-sm text-gray-500 mt-1">Annually</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
                <div className="text-gray-600">Energy Reduction</div>
                <div className="text-sm text-gray-500 mt-1">Since 2020</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">30%</div>
                <div className="text-gray-600">Transport Emissions Cut</div>
                <div className="text-sm text-gray-500 mt-1">Through optimization</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="text-4xl font-bold text-orange-600 mb-2">85%</div>
                <div className="text-gray-600">Sustainable Suppliers</div>
                <div className="text-sm text-gray-500 mt-1">In our network</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
