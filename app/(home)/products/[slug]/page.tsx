import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductById, getAllProducts } from "@/actions/product"
import ProductDetail from "@/components/frontend/products/ProductDetail"
import ProductDetailLoading from "@/components/frontend/products/ProductDetailLoading"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductById(slug)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} | Premium Aluminum Products`,
    description:
      product.shortDesc ||
      product.description ||
      `High-quality ${product?.type?.toLowerCase()} from our premium aluminum collection.`,
    keywords: `${product.name}, ${product.type?.toLowerCase()}, aluminum, ${product.category?.title}`,
    openGraph: {
      title: product.name,
      description: product.shortDesc || product.description || "",
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductById(slug)

  if (!product) {
    notFound()
  }

  // Get related products from the same category
  const allProductsResult = await getAllProducts()
  const relatedProducts = (allProductsResult.data || [])
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.status === "ACTIVE")
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<ProductDetailLoading />}>
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </Suspense>
    </div>
  )
}
