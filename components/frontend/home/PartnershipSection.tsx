import { Card, CardContent } from "@/components/ui/card"

const partnerships = [
  {
    name: "AAAMSA",
    fullName: "Architectural Aluminium Manufacturers Association of South Africa",
    logo: "/aaamsa-logo.png", // Replace with actual logo path
  },
  {
    name: "SAGGA",
    fullName: "South African Glass & Glazing Association",
    logo: "/saga-logo.png", // Replace with actual logo path
  },
  {
    name: "SANS",
    fullName: "South African National Standards",
    logo: "/sans-logo.png", // Replace with actual logo path
  },
  {
    name: "SABS",
    fullName: "South African Bureau of Standards",
    logo: "/sabs-logo.png", // Replace with actual logo path
  },
]

export default function PartnershipSection() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">MEMBER<span className="text-orange-500">OF</span></h2>
          <p className="text-sm text-gray-600 mx-auto">
            Proud members of leading industry associations ensuring quality and compliance
          </p>
        </div>

        {/* Partnership Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnerships.map((partner, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  {/* Logo placeholder - replace with actual logos */}
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-50 transition-colors duration-300">
                    {/* <span className="text-2xl font-bold text-gray-400 group-hover:text-orange-500 transition-colors duration-300">
                      {partner.name.substring(0, 2)}
                    </span> */}
                    {/* Uncomment when you have actual logos */}
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{partner.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{partner.fullName}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our memberships demonstrate our commitment to industry best practices, quality standards, 
            and continuous improvement in aluminum manufacturing and installation.
          </p>
        </div>
      </div>
    </section>
  )
}