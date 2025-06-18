"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Package, MapPin, Calendar, CreditCard, Truck, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/types/orders"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { Separator } from "@/components/ui/separator"

interface OrderCardProps {
  order: Order
  index: number
}

export function OrderCard({ order, index }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "Cash on Delivery"
      case "CASH_ON_COLLECTION":
        return "Cash on Collection"
      case "CARD_ONLINE":
        return "Card Payment"
      case "EFT":
        return "EFT"
      case "BANK_TRANSFER":
        return "Bank Transfer"
      default:
        return method
    }
  }

  const getDeliveryMethodLabel = (method: string) => {
    return method === "DELIVERY" ? "Delivery" : "Collection"
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "animate-in fade-in slide-in-from-bottom-4",
        "border-l-4 border-l-blue-500",
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "both",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">Ordered on {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{formatCurrency(order.total)}</p>
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items Preview */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex-shrink-0 flex items-center gap-2 bg-muted/50 rounded-lg p-2 min-w-0">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted">
                {item.product.thumbnail ? (
                  <Image
                    src={item.product.thumbnail || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <Badge variant="secondary" className="flex-shrink-0">
              +{order.items.length - 3} more
            </Badge>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{getPaymentMethodLabel(order.paymentMethod)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{getDeliveryMethodLabel(order.deliveryMethod)}</span>
          </div>
          {order.trackingNumber && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-mono text-xs">{order.trackingNumber}</span>
            </div>
          )}
          {order.estimatedDelivery && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDate(order.estimatedDelivery)}</span>
            </div>
          )}
        </div>

        {/* Expandable Details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <span className="text-sm font-medium">{isOpen ? "Hide" : "Show"} Details</span>
                <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform duration-200", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/orders/${order.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Order
              </Link>
            </Button>
          </div>

          <CollapsibleContent className="space-y-4 pt-4">
            <Separator />

            {/* All Items */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Order Items</h4>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                    {item.product.thumbnail ? (
                      <Image
                        src={item.product.thumbnail || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product.name}</p>
                    {item.variant && <p className="text-sm text-muted-foreground">Variant: {item.variant.name}</p>}
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h4>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p>{order.shippingAddress.streetLine1}</p>
                  {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
