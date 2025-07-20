import { Suspense } from "react"
import { getAllGalleryItems } from "@/actions/gallery-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GalleryForm } from "@/components/dashboard/gallery/gallery-form"
import { GalleryList } from "@/components/dashboard/gallery/gallery-list"

export default async function AdminGalleryPage() {
  const { data: galleryItems, success, message } = await getAllGalleryItems()

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 animate-fadeInDown">Admin Gallery</h1>
        <GalleryForm />
      </div>

      {!success && (
        <div className="text-red-500 text-center py-8">Error loading gallery items: {message || "Unknown error."}</div>
      )}

      <Suspense fallback={<GalleryListSkeleton />}>{galleryItems && <GalleryList items={galleryItems} />}</Suspense>
    </div>
  )
}

function GalleryListSkeleton() {
  return (
    <Card className="shadow-md animate-pulse">
      <CardHeader>
        <CardTitle className="h-6 bg-gray-200 rounded w-1/4"></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2">
              <div className="h-16 w-16 bg-gray-200 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
