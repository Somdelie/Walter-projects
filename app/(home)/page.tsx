import { Suspense } from "react"
import { getAllProducts, getFeaturedProducts } from "@/actions/product"
// import FeaturedProducts from "@/components/home/FeaturedProducts"
// import CategoriesShowcase from "@/components/home/CategoriesShowcase"
// import WhyChooseUs from "@/components/home/WhyChooseUs"
// import StatsSection from "@/components/home/StatsSection"
// import TestimonialsSection from "@/components/home/TestimonialsSection"
// import CTASection from "@/components/home/CTASection"
import type { Metadata } from "next"
import { getCategories } from "@/actions/categories"
import HeroSection from "@/components/frontend/home/HeroSection"
import FeaturedProducts from "@/components/frontend/home/FeaturedProducts"
import CategoriesShowcase from "@/components/frontend/home/CategoriesShowcase"
import WhyChooseUs from "@/components/frontend/home/WhyChooseUs"
import StatsSection from "@/components/frontend/home/StatsSection"
import TestimonialsSection from "@/components/frontend/home/TestimonialsSection"
import CTASection from "@/components/frontend/home/CTASection"

export const metadata: Metadata = {
  title: "AlumPro - Premium Aluminum Windows, Doors & Profiles | Professional Solutions",
  description:
    "Leading supplier of high-quality aluminum windows, doors, profiles, and accessories. Professional-grade products for residential and commercial projects with fast delivery and expert support.",
  keywords: "aluminum windows, aluminum doors, profiles, hardware, glass, commercial aluminum, residential aluminum",
  openGraph: {
    title: "AlumPro - Premium Aluminum Solutions",
    description: "Professional aluminum windows, doors, and profiles for your projects",
    type: "website",
  },
}

export default async function HomePage() {
  // Fetch data server-side
   const [featuredProductsResult, categoriesResult] = await Promise.all([
    getFeaturedProducts(), 
    getCategories()
  ])


  const products = featuredProductsResult.data || []
  const categories = categoriesResult.data || []

  // Filter featured products
  const featuredProducts = products.filter((product) => product.isFeatured && product.status === "ACTIVE").slice(0, 8)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <FeaturedProducts products={featuredProducts} />
      </Suspense>

      {/* Categories Showcase */}
      <CategoriesShowcase categories={categories} />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </main>
  )
}
