"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { DollarSign, Package, Ruler, Weight, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { DataTable, type Column, TableActions, EntityForm, ConfirmationDialog } from "@/components/ui/data-table"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateProduct, useProductDelete, useProductUpdate, useProductsSuspense } from "@/hooks/useProductQueries"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateSlug } from "@/lib/generateSlug"
import { generateSKU } from "@/lib/generateSKU"
import { ImageInput } from "@/components/reusable-ui/image-upload"
import { useRouter } from "next/navigation"
import { useFileDelete } from "@/hooks/useFileDelete"
import { formatPrice } from "@/lib/formatPrice"
import { startTransition } from "react"
import { getCategoriesForProductSelection } from "@/actions/categories"
import { getProductTypes } from "@/actions/productTypes"


interface ProductsListingProps {
  title: string
  categoryMap: Record<string, { id: string; title: string; parentId?: string; parent?: { title: string } }>
  brandMap: Record<string, { id: string; name: string }>
}

interface Product {
  id: string
  name: string
  description?: string | null
  shortDesc?: string | null
  productTypeId?: string | null
  categoryId: string
  price: number
  comparePrice?: number | null
  costPrice?: number | null
  stockQuantity: number
  lowStockAlert: number
  trackStock: boolean
  weight?: number
  length?: number
  width?: number
  height?: number
  thumbnail?: string | undefined | null
  sku: string
  slug: string
  isFeatured: boolean
  isOnSale: boolean
  createdAt: Date | string | null | undefined
  productType?: {
    id: string
    name: string
    slug: string
  } | null
}

interface HierarchicalCategory {
  id: string
  title: string
  slug: string
  parentId: string | null
  isSubcategory: boolean
  displayName: string
  level: number
}

interface ProductType {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  sortOrder: number
}

// Updated form schema to use productTypeId instead of type enum
const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  productTypeId: z.string().min(1, "Product type is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  comparePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().min(0, "Stock quantity cannot be negative").default(0),
  lowStockAlert: z.coerce.number().min(0, "Low stock alert cannot be negative").default(10),
  trackStock: z.boolean().default(true),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
})

type ProductCreateData = z.infer<typeof productFormSchema> & {
  thumbnail?: string
  sku?: string
  slug?: string
  brandId?: string
}

export default function ProductsListing({ title, categoryMap, brandMap }: ProductsListingProps) {
  const [productsData, setProductsData] = useState<Product[]>([])
  const [hierarchicalCategories, setHierarchicalCategories] = useState<HierarchicalCategory[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingProductTypes, setLoadingProductTypes] = useState(false)
  const { products, refetch } = useProductsSuspense()
  const { deleteFile } = useFileDelete()

  useEffect(() => {
    if (products) {
      startTransition(() => {
        setProductsData(
          products.map((p) => ({
            ...p,
            productTypeId: p.productTypeId || null,
          })),
        )
      })
    }
  }, [products])

  // Fetch hierarchical categories when form opens
  const fetchHierarchicalCategories = async () => {
    setLoadingCategories(true)
    try {
      const result = await getCategoriesForProductSelection()
      if (result.data) {
        setHierarchicalCategories(result.data)
      }
    } catch (error) {
      console.error("Error fetching hierarchical categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setLoadingCategories(false)
    }
  }

  // Fetch product types when form opens
  const fetchProductTypes = async () => {
    setLoadingProductTypes(true)
    try {
      const result = await getProductTypes()
      if (result.data) {
        // Filter only active product types and sort by sortOrder
        const activeTypes = result.data.filter((type) => type.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
        setProductTypes(activeTypes)
      }
    } catch (error) {
      console.error("Error fetching product types:", error)
      toast.error("Failed to load product types")
    } finally {
      setLoadingProductTypes(false)
    }
  }

  const [imageUrl, setImageUrl] = useState("")
  const [previousImageUrl, setPreviousImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Mutations
  const createProductMutation = useCreateProduct({
    onSuccess: () => {
      resetFormAndCloseModal()
      refetch()
    },
  })

  const router = useRouter()
  const handleProductClick = (product: Product) => {
    router.push(`/dashboard/products/${product.slug}`)
  }

  const deleteProductMutation = useProductDelete()
  const updateProductMutation = useProductUpdate(currentProduct?.id || "")

  // Form setup
  const form = useForm<ProductCreateData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDesc: "",
      productTypeId: "",
      categoryId: "",
      price: 0,
      comparePrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      lowStockAlert: 10,
      trackStock: true,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      isFeatured: false,
      isOnSale: false,
    },
  })

  // Form reset effect
  useEffect(() => {
    if (currentProduct) {
      form.reset({
        name: currentProduct.name,
        description: currentProduct.description || "",
        shortDesc: currentProduct.shortDesc || "",
        productTypeId: currentProduct.productTypeId || "",
        categoryId: currentProduct.categoryId || "",
        price: Number(currentProduct.price),
        comparePrice: currentProduct.comparePrice ? Number(currentProduct.comparePrice) : undefined,
        costPrice: currentProduct.costPrice ? Number(currentProduct.costPrice) : undefined,
        stockQuantity: currentProduct.stockQuantity,
        lowStockAlert: currentProduct.lowStockAlert,
        trackStock: currentProduct.trackStock,
        weight: currentProduct.weight ? Number(currentProduct.weight) : undefined,
        length: currentProduct.length ? Number(currentProduct.length) : undefined,
        width: currentProduct.width ? Number(currentProduct.width) : undefined,
        height: currentProduct.height ? Number(currentProduct.height) : undefined,
        isFeatured: currentProduct.isFeatured,
        isOnSale: currentProduct.isOnSale,
      })
      if (currentProduct.thumbnail) {
        setImageUrl(currentProduct.thumbnail)
        setPreviousImageUrl(currentProduct.thumbnail)
      }
    } else {
      form.reset()
      setImageUrl("")
      setPreviousImageUrl("")
    }
  }, [currentProduct, form])

  const resetFormAndCloseModal = useCallback(() => {
    setCurrentProduct(null)
    setFormDialogOpen(false)
    setImageUrl("")
    setPreviousImageUrl("")
    form.reset()
  }, [form])

  // Custom handler for image URL changes
  const handleImageChange = async (url: string) => {
    if (imageUrl && imageUrl !== url && imageUrl !== previousImageUrl) {
      try {
        await deleteFile(imageUrl)
      } catch (error) {
        console.error("Failed to clean up temporary image:", error)
      }
    }
    setImageUrl(url)
  }

  const { data: session } = useSession()

  // Utility functions
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "N/A"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid date"
      return format(dateObj, "MMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return "Out of Stock"
    if (product.stockQuantity <= product.lowStockAlert) return "Low Stock"
    return "In Stock"
  }

  const getStockStatusColor = (product: Product) => {
    if (product.stockQuantity === 0) return "text-red-600"
    if (product.stockQuantity <= product.lowStockAlert) return "text-orange-600"
    return "text-green-600"
  }

  // Get category display name with hierarchy
  const getCategoryDisplayName = (categoryId: string) => {
    const category = categoryMap[categoryId]
    if (!category) return "Unknown"
    if (category.parentId && category.parent) {
      return `${category.parent.title} → ${category.title}`
    }
    return category.title
  }

  // Get product type display name
  const getProductTypeDisplayName = (product: Product) => {
    if (product.productType) {
      return product.productType.name
    }
    return "Unknown Type"
  }

  // Export to Excel
  const handleExport = async (filteredProducts: Product[]) => {
    setIsExporting(true)
    try {
      const exportData = filteredProducts.map((product) => ({
        Name: product.name,
        SKU: product.sku,
        Type: getProductTypeDisplayName(product),
        Category: getCategoryDisplayName(product.categoryId),
        Price: product.price,
        "Stock Quantity": product.stockQuantity,
        Status: getStockStatus(product),
        "Date Added": formatDate(product.createdAt),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products")
      const fileName = `Products_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)
      toast.success("Export successful", {
        description: `Products exported to ${fileName}`,
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Event handlers
  const handleAddClick = () => {
    setCurrentProduct(null)
    setFormDialogOpen(true)
    fetchHierarchicalCategories()
    fetchProductTypes()
  }

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product)
    setFormDialogOpen(true)
    fetchHierarchicalCategories()
    fetchProductTypes()
  }

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product)
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete?.id) {
      try {
        if (productToDelete.thumbnail) {
          try {
            await deleteFile(productToDelete.thumbnail)
          } catch (error) {
            console.error("Error deleting product thumbnail:", error)
          }
        }
        await deleteProductMutation.mutateAsync(productToDelete.id)
        setDeleteDialogOpen(false)
        refetch()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const onSubmit = async (data: ProductCreateData) => {
    setIsSubmitting(true)
    try {
      if (!currentProduct) {
        // Create new product
        const brandName = data.brandId ? brandMap[data.brandId]?.name : null
        const categoryName = data.categoryId ? categoryMap[data.categoryId]?.title : null
        const newProductData: ProductCreateData & { type: string } = {
          ...data,
          thumbnail: imageUrl,
          sku: generateSKU(data.name, brandName, categoryName),
          slug: generateSlug(data.name),
          type: data.productTypeId, // Ensure 'type' is present as required by backend
        }
        await createProductMutation.mutateAsync(newProductData)
        resetFormAndCloseModal()
      } else {
        // Update existing product
        const updatePayload = {
          ...currentProduct,
          name: data.name,
          description: data.description,
          shortDesc: data.shortDesc,
          productTypeId: data.productTypeId,
          price: data.price,
          comparePrice: data.comparePrice,
          costPrice: data.costPrice,
          stockQuantity: data.stockQuantity,
          lowStockAlert: data.lowStockAlert,
          trackStock: data.trackStock,
          weight: data.weight,
          length: data.length,
          width: data.width,
          height: data.height,
          categoryId: data.categoryId,
          brandId: data.brandId,
          thumbnail: imageUrl,
          isFeatured: data.isFeatured,
          isOnSale: data.isOnSale,
          updatedAt: new Date(),
        }

        const oldThumbnail = previousImageUrl
        const thumbnailChanged = imageUrl !== oldThumbnail

        await updateProductMutation.mutateAsync(updatePayload)

        // Cleanup old thumbnail if needed
        if (thumbnailChanged && oldThumbnail && oldThumbnail !== "/placeholder.jpg") {
          try {
            await deleteFile(oldThumbnail)
          } catch (err) {
            console.error("Failed to delete old thumbnail:", err)
          }
        }
      }
      resetFormAndCloseModal()
      refetch()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      toast.error("Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total products value
  const getTotalValue = (products: Product[]) => {
    return products.reduce((total, product) => {
      const price = Number(product.price) || 0
      const quantity = product.stockQuantity || 0
      return total + price * quantity
    }, 0)
  }

  const truncatedText = (text: string, length: number) => {
    if (text.length > length) {
      return text.slice(0, length) + "..."
    }
    return text
  }

  // Define columns for the data table
  const columns: Column<Product>[] = [
    {
      header: "Image",
      accessorKey: "thumbnail",
      cell: (row) => {
        const hasValidThumbnail = Boolean(row.thumbnail && row.thumbnail !== "")
        const imgSrc = hasValidThumbnail ? (row.thumbnail as string) : "/placeholder.jpg"
        return (
          <img
            src={imgSrc || "/placeholder.svg"}
            alt={row.name || "Product image"}
            className="w-10 h-10 object-cover rounded-md"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg"
            }}
          />
        )
      },
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium line-clamp-1">{truncatedText(row.name, 20)}</span>
          <span className="text-xs text-muted-foreground">{row.sku}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "productType",
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getProductTypeDisplayName(row)}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "categoryId",
      cell: (row) => (
        <span className="font-medium line-clamp-1">{truncatedText(getCategoryDisplayName(row.categoryId), 25)}</span>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-primary font-medium">{formatPrice(Number(row.price))}</span>
        </div>
      ),
    },
    {
      header: "Stock",
      accessorKey: "stockQuantity",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.stockQuantity}</span>
          <span className={`text-xs ${getStockStatusColor(row)}`}>{getStockStatus(row)}</span>
        </div>
      ),
    },
    {
      header: "Date Added",
      accessorKey: "createdAt",
      cell: (row) => formatDate(row.createdAt),
    },
  ]

  // Generate subtitle with total value
  const getSubtitle = (productCount: number, totalValue: number) => {
    return `${productCount} ${productCount === 1 ? "product" : "products"} | Total Value: ${formatCurrency(totalValue)}`
  }

  return (
    <div>
      <DataTable<Product>
        title={title}
        buttonTitle="Product"
        emptyStateModalTitle="Your Products List is Empty"
        emptyStateModalDescription="Create your first product to get started with your catalog."
        subtitle={productsData?.length > 0 ? getSubtitle(productsData.length, getTotalValue(productsData)) : undefined}
        data={productsData}
        columns={columns}
        keyField="id"
        isLoading={false}
        onRefresh={refetch}
        onRowClick={handleProductClick}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "sku"],
          enableDateFilter: true,
          getItemDate: (item) => new Date(item.createdAt ?? 0),
        }}
        renderRowActions={(product) => (
          <div onClick={(e) => e.stopPropagation()}>
            <TableActions.RowActions
              onEdit={() => handleEditClick(product)}
              onDelete={() => handleDeleteClick(product)}
            />
          </div>
        )}
      />

      {/* Product Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentProduct ? "Edit Product" : "Add New Product"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={createProductMutation.isPending || updateProductMutation.isPending}
        submitLabel={currentProduct ? "Save Changes" : "Add Product"}
        size="lg"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="shortDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Input placeholder="Brief description for listings" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Updated Product Type Selection */}
        <FormField
          control={form.control}
          name="productTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingProductTypes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProductTypes ? "Loading types..." : "Select Product Type"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{type.name}</span>
                          {type.description && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {type.description.length > 30
                                ? `${type.description.substring(0, 30)}...`
                                : type.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>Select the type/category for this product</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Updated Category Selection with Hierarchy */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingCategories}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select Category"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {hierarchicalCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          {category.isSubcategory && (
                            <div className="flex items-center mr-2 text-muted-foreground">
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                          <span className={category.isSubcategory ? "text-sm" : "font-medium"}>
                            {category.isSubcategory ? category.title : category.displayName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>Select a main category or subcategory for this product</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rest of your form fields remain the same */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="0.00" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormDescription>Enter the selling price in ZAR</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comparePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compare Price (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="0.00" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormDescription>Was/RRP price for comparison</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="costPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Price (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="0.00" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormDescription>Your cost price for profit calculations</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stockQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <div className="relative">
                  <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="0" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lowStockAlert"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low Stock Alert</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} />
              </FormControl>
              <FormDescription>Alert when stock falls below this number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Weight className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="length"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Length (mm)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Ruler className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="0" className="pl-8" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width (mm)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Ruler className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="0" className="pl-8" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (mm)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Ruler className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="0" className="pl-8" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detailed product description" rows={3} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center space-x-6">
            <FormField
              control={form.control}
              name="trackStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Track Stock</FormLabel>
                    <FormDescription>Monitor inventory levels for this product</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>Show in featured products section</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isOnSale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>On Sale</FormLabel>
                    <FormDescription>Mark this product as on sale</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormLabel className="text-base font-medium mb-2 block">Product Image</FormLabel>
          <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-rose-300 rounded p-4">
            {imageUrl && (
              <div className="relative group w-full flex justify-center items-center">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Product image"
                  className="w-24 h-24 object-cover rounded-md border shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
              </div>
            )}
            <ImageInput title="" imageUrl={imageUrl} setImageUrl={handleImageChange} endpoint="productImage" />
            <p className="text-xs text-muted-foreground">
              Upload a high quality image for your product. JPG, PNG, and WebP formats supported (max 1MB).
            </p>
          </div>
        </div>
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={
          productToDelete ? (
            <>
              Are you sure you want to delete <strong className="text-primary">{productToDelete.name}</strong> from your
              catalog?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this product?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={deleteProductMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
