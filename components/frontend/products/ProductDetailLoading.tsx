
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/Skeleton"

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2 mb-8">
        <Skeleton className="h-4 w-16" />
        <span>/</span>
        <Skeleton className="h-4 w-20" />
        <span>/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-12" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-6 w-6 mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
