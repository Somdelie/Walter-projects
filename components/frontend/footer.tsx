import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Home,
  DoorOpen,
  Package,
  Wrench,
  Glasses,
  Building,
} from "lucide-react"

const productCategories = [
  { name: "Windows", href: "/products?type=WINDOW", icon: Home },
  { name: "Doors", href: "/products?type=DOOR", icon: DoorOpen },
  { name: "Profiles", href: "/products?type=PROFILE", icon: Package },
  { name: "Hardware", href: "/products?type=HARDWARE", icon: Wrench },
  { name: "Glass", href: "/products?type=GLASS", icon: Glasses },
  { name: "Accessories", href: "/products?type=ACCESSORY", icon: Building },
]

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Our Story", href: "/story" },
  { name: "Careers", href: "/careers" },
  { name: "News & Updates", href: "/news" },
  { name: "Quality Assurance", href: "/quality" },
  { name: "Sustainability", href: "/sustainability" },
]

const supportLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "Technical Support", href: "/support" },
  { name: "Installation Guide", href: "/installation" },
  { name: "Warranty", href: "/warranty" },
  { name: "Returns", href: "/returns" },
  { name: "FAQ", href: "/faq" },
]

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/cookies" },
  { name: "Shipping Policy", href: "/shipping" },
]

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/" className="flex items-center space-x-2 text-2xl font-bold mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WP</span>
                </div>
                <span>WalterProjects</span>
              </Link>
              <p className="text-slate-300 leading-relaxed max-w-md">
                Leading supplier of premium aluminum windows, doors, and profiles. Serving professionals and homeowners
                with quality solutions for over 25 years.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>54 5th street marlboro Sandton</span>
              </div>
              <div className="flex items-center gap-3 text-orange-600">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
               <div className="flex-col md:flex-row gap-2">
                 <span>+27 11 262 0677</span>
                <span>+27 62 048 3184</span>
                <span>+27 82 256 0441</span>
               </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>info@walterprojects.co.za</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Link href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Products</h3>
            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-slate-300 mb-4">
              Get the latest product updates and industry news delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
              <Button className="bg-primary hover:bg-primary/95 flex-shrink-0">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">© 2024 WalterProjects. All rights reserved.</div>

            <div className="flex flex-wrap gap-6 text-sm">
              {legalLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-slate-400 hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
