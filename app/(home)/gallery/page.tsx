import { Suspense } from "react"
import { GalleryCard } from "@/components/frontend/gallery/gallery-card"
import { GallerySkeleton } from "@/components/frontend/gallery/gallery-skeleton"
import EmptyState from "@/components/global/EmptyState"
import { getAllGalleryItems } from "@/actions/gallery-actions"

export default async function GalleryPage() {
   const { data: galleryItems, success, message } = await getAllGalleryItems()

  return (
    <main className=" mx-auto px-6 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-900 animate-fadeInUp">Our Gallery</h1>
      <Suspense fallback={<GallerySkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
          {galleryItems?.length === 0 && (
            <EmptyState 
              message="No gallery items found"
              description="All gallery items will appear here once added."
              icon="inbox"
              className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4"
            />
          )}
          {galleryItems?.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      </Suspense>
    </main>
  )
}
