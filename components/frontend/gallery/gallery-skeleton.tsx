import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden rounded-lg shadow-lg">
          <div className="relative w-full h-60 bg-gray-200"></div>
          <CardHeader className="p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
