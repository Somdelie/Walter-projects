import { Suspense } from "react"
import { getAllProducts, getFeaturedProducts } from "@/actions/product"
import type { Metadata } from "next"
import { getCategories } from "@/actions/categories"
import HeroSection from "@/components/frontend/home/HeroSection"
import FeaturedProducts from "@/components/frontend/home/FeaturedProducts"
import CategoriesShowcase from "@/components/frontend/home/CategoriesShowcase"
import WhyChooseUs from "@/components/frontend/home/WhyChooseUs"
import StatsSection from "@/components/frontend/home/StatsSection"
import TestimonialsSection from "@/components/frontend/home/TestimonialsSection"
import CTASection from "@/components/frontend/home/CTASection"


export default async function HomePage() {
  // Fetch data server-side
   const [featuredProductsResult, categoriesResult] = await Promise.all([
    getFeaturedProducts(), 
    getCategories()
  ])


  const products = featuredProductsResult.data || []
  const categories = (categoriesResult.data || []).map((category) => ({
    ...category,
    imageUrl: category.imageUrl ?? undefined,
  }))

  console.log(categories)

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
