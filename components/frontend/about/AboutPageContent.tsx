import Image from "next/image"
import { CheckCircle, Award, Users, Truck, Shield, Leaf, Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function AboutPageContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About WalterProjects</h1>
            <p className="text-xl text-slate-200 mb-8 leading-relaxed">
              Leading aluminum solutions provider specializing in premium windows, doors, and architectural systems for
              residential and commercial projects across South Africa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm text-slate-300">Years Experience</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">5000+</div>
                <div className="text-sm text-slate-300">Projects Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-slate-300">Quality Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Founded with a vision to revolutionize the aluminum industry in South Africa, WalterProjects has grown
                from a small family business to a leading supplier of premium aluminum solutions. Our commitment to
                quality, innovation, and customer satisfaction has made us the trusted choice for architects,
                contractors, and homeowners alike.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We specialize in the distribution and sale of aluminum products, including raw materials, extrusions,
                sheets, and fabricated components. Our extensive product range covers everything from residential
                windows and doors to complex commercial architectural systems.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Premium Quality Materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Expert Installation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Custom Solutions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Nationwide Delivery</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/aluminum.jpg"
                alt="WalterProjects aluminum manufacturing facility"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">ISO 9001</div>
                <div className="text-sm">Certified Quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These fundamental principles guide everything we do and shape our relationships with customers, partners,
              and communities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality Excellence</h3>
                <p className="text-gray-600">
                  We maintain the highest standards in every product and service we deliver.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Customer Focus</h3>
                <p className="text-gray-600">
                  Our customers' success is our success. We listen, understand, and deliver.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Reliability</h3>
                <p className="text-gray-600">Dependable products, consistent service, and promises we always keep.</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                <p className="text-gray-600">
                  Committed to environmentally responsible practices and sustainable solutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What We Offer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive aluminum solutions from raw materials to finished installations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-slate-900">Windows & Doors</h3>
              <p className="text-gray-600 mb-4">
                Premium aluminum windows and doors for residential and commercial applications, including sliding,
                casement, and bi-fold options.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Residential window systems</li>
                <li>• Commercial glazing solutions</li>
                <li>• Security doors and windows</li>
                <li>• Custom architectural designs</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-slate-900">Raw Materials</h3>
              <p className="text-gray-600 mb-4">
                High-quality aluminum extrusions, sheets, and profiles for manufacturers and fabricators across various
                industries.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Aluminum extrusions</li>
                <li>• Sheet and plate materials</li>
                <li>• Structural profiles</li>
                <li>• Custom extrusion services</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-slate-900">Hardware & Accessories</h3>
              <p className="text-gray-600 mb-4">
                Complete range of aluminum hardware, accessories, and components to complement our product offerings.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Window and door hardware</li>
                <li>• Glazing accessories</li>
                <li>• Sealing systems</li>
                <li>• Installation tools</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/about.jpg"
                alt="Quality control testing facility"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Quality Assurance</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our rigorous quality control processes ensure that every product meets the highest industry standards.
                From material sourcing to final inspection, we maintain strict quality protocols throughout our
                operations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Material Testing</h4>
                    <p className="text-gray-600 text-sm">
                      Comprehensive testing of all raw materials before processing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Process Control</h4>
                    <p className="text-gray-600 text-sm">Continuous monitoring throughout manufacturing processes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Final Inspection</h4>
                    <p className="text-gray-600 text-sm">Thorough quality checks before product delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Commitment to Sustainability</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We believe in responsible business practices that protect our environment while delivering exceptional
              value to our customers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Eco-Friendly Materials</h3>
              <p className="text-gray-600">
                Aluminum is 100% recyclable, and we prioritize sustainable sourcing and manufacturing processes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Efficient Logistics</h3>
              <p className="text-gray-600">
                Optimized delivery routes and packaging to minimize our carbon footprint and environmental impact.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Industry Leadership</h3>
              <p className="text-gray-600">
                Setting standards for sustainable practices in the aluminum industry through innovation and
                responsibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-sky-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Get in touch with our expert team to discuss your aluminum solution needs. We're here to help bring your
            vision to life.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span>+27 (0) 11 262 0677</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span>info@walterprojects.co.za</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Johannesburg, South Africa</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get a Quote
            </Button>
            <Link href='/products' className="border-white text-sky-600 bg-white flex items-center justify-center gap-2 px-6 rounded-lg transition-colors shadow-lg hover:bg-slate-200">
              View Our Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
