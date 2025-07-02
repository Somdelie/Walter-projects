import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, Mail } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Get professional consultation and custom quotes for your aluminum needs. Our experts are ready to help you
            find the perfect solution.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/contact">
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-slate-300">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span>+27 11 262 0677</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span>info@walterprojects.co.za</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
