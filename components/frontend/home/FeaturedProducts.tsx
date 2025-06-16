import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Product } from "@prisma/client"
import ProductCard from "../products/ProductCard"

interface ProductWithDetails extends Product {
  category: {
    id: string
    title: string
  } | null  // Allow null for products without categories
  brand?: {
    id: string
    name: string
  }
}
interface FeaturedProductsProps {
  products: ProductWithDetails[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-900 mb-4">Featured Products</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most popular aluminum solutions, trusted by professionals and homeowners alike
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard key={product.id} product={product} viewMode="grid" index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
