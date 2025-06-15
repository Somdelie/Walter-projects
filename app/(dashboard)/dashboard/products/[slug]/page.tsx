import { getCategories } from "@/actions/categories"
import { getProductById } from "@/actions/product"
import { ProductUpdateForm } from "@/components/dashboard/products/ProductUpdateForm"
import EmptyState from "@/components/global/EmptyState"
import type { Product } from "@prisma/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProductWithDetails extends Product {
  category: {
    id: string
    title: string
  }
  // brand?: {
  //   id: string
  //   name: string
  // }
  variants: {
    id: string
    name: string
    price: number
    stockQuantity: number
  }[]
  attributes: {
    attribute: {
      id: string
      name: string
    }
    value: {
      id: string
      value: string
    }
  }[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    user: {
      name: string
      image: string | null
    }
  }[]
}

interface Category {
  id: string
    title: string
}

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const productSlug = await params
  const product: ProductWithDetails | null = await getProductById(productSlug.slug)
  const categories = await getCategories()
    const categoryOptions = categories?.data?.map((category: Category) => ({
        value: category.id,
        label: category.title,
    })) || []

  if (!product) {
    return <EmptyState message="Product not found" />
  }

  return (
    <div className="space-y-2">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Items / Edit</span>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-primary">{product.name}</h1>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">SKU:</span>
            <span>{product.sku || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Last Updated:</span>
            <span>
              {product.updatedAt
                ? new Date(product.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

       <ProductUpdateForm product={product} categoryOptions={categoryOptions}/>
    </div>
  )
}

export default SingleProductPage
