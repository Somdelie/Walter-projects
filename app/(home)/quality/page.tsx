import Image from "next/image"
import { Shield, CheckCircle, Award, Microscope, FileCheck, Users, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const qualityStandards = [
  {
    title: "ISO 9001:2015",
    description: "Quality Management Systems",
    status: "Certified",
    icon: Award,
  },
  {
    title: "SABS Standards",
    description: "South African Bureau of Standards",
    status: "Compliant",
    icon: Shield,
  },
  {
    title: "SANS 10400",
    description: "Building Regulations Compliance",
    status: "Certified",
    icon: FileCheck,
  },
  {
    title: "Green Building",
    description: "Sustainable Construction Standards",
    status: "Certified",
    icon: Target,
  },
]

const qualityProcesses = [
  {
    step: "01",
    title: "Material Inspection",
    description: "All raw materials undergo rigorous testing before entering our production process.",
    icon: Microscope,
  },
  {
    step: "02",
    title: "Production Monitoring",
    description: "Continuous quality checks throughout manufacturing with automated monitoring systems.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Final Testing",
    description: "Comprehensive testing of finished products including stress, weather, and performance tests.",
    icon: CheckCircle,
  },
  {
    step: "04",
    title: "Installation Quality",
    description: "On-site quality assurance during installation with certified technicians.",
    icon: Users,
  },
]

export default function QualityAssurancePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-900 to-green-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Quality Assurance</h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Discover our rigorous quality control processes that ensure every product meets the highest industry
              standards.
            </p>
            <div className="flex justify-center">
              <Badge className="bg-white/20 text-white text-lg px-6 py-2">ISO 9001:2015 Certified</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Certifications</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We maintain the highest industry standards through rigorous certification processes and continuous
              improvement.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {qualityStandards.map((standard, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <standard.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{standard.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{standard.description}</p>
                  <Badge className="bg-green-100 text-green-800">{standard.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Quality Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every product goes through our comprehensive 4-step quality assurance process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {qualityProcesses.map((process, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {process.step}
                      </div>
                    </div>
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
                      <process.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{process.title}</h3>
                    <p className="text-gray-600 text-sm">{process.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testing Facilities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">State-of-the-Art Testing Facilities</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our advanced testing laboratory is equipped with the latest technology to ensure every product meets or
                exceeds industry standards. We conduct comprehensive testing across multiple parameters to guarantee
                performance and durability.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Structural Testing</h4>
                    <p className="text-gray-600 text-sm">
                      Load bearing, wind resistance, and structural integrity tests
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Weather Resistance</h4>
                    <p className="text-gray-600 text-sm">
                      UV exposure, thermal cycling, and corrosion resistance testing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Performance Testing</h4>
                    <p className="text-gray-600 text-sm">
                      Air infiltration, water penetration, and thermal performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/laboratory.jpeg"
                alt="Quality testing laboratory"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">99.8%</div>
                <div className="text-sm">Quality Pass Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Metrics */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quality by Numbers</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Our commitment to quality is reflected in our performance metrics and customer satisfaction rates.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">99.8%</div>
              <div className="text-slate-300">Quality Pass Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-slate-300">Quality Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">15+</div>
              <div className="text-slate-300">Testing Parameters</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
              <div className="text-slate-300">Product Traceability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Quality You Can Trust</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the difference that rigorous quality assurance makes. Contact us to learn more about our quality
            standards.
          </p>
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Download Quality Certificate
          </Button>
        </div>
      </section>
    </div>
  )
}
