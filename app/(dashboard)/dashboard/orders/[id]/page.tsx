import { getOrderById, getUsersMap } from '@/actions/orders';
import NotFound from '@/app/not-found';
import SingleOrderClient from '@/components/dashboard/orders/SingleOrderClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React, { Suspense } from 'react'

const SingleOrderPage = async ({params}: {
    params: Promise<{
        id: string
    }>
}) => {

     const id = (await params).id;

     
  // Fetch data on the server
  const [order, userMap] = await Promise.all([getOrderById(id), getUsersMap()])

  if (!order) {
    NotFound()
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Suspense fallback={<OrderPageSkeleton />}>
        {order && <SingleOrderClient order={order} userMap={userMap} />}
      </Suspense>
    </div>
  )
}

export default SingleOrderPage


function OrderPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-9 bg-gray-200 rounded w-20"></div>
          <div className="h-9 bg-gray-200 rounded w-24"></div>
          <div className="h-9 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
  const order = await getOrderById(id)
  
  if (!order) {
    return {
      title: "Order Not Found",
    }
  }

  return {
    title: `Order ${order.orderNumber} - Admin Dashboard`,
    description: `Order details for ${order.orderNumber}`,
  }
}