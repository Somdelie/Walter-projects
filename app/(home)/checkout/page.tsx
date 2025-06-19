"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, MapPin, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/formatPrice"
import Link from "next/link"
import { createOrder } from "@/actions/orders"
import { CheckoutForm } from "@/components/frontend/checkout/CheckoutForm"
import { OrderSummary } from "@/components/frontend/checkout/OrderSummary"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, itemCount, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  // Add delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "COLLECTION">("DELIVERY")

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  // Update handleOrderSubmit to use dynamic delivery fee
  const handleOrderSubmit = async (orderData: any) => {
    setIsSubmitting(true)

    const deliveryFee = orderData.deliveryMethod === "DELIVERY" ? 150 : 0

    try {
      const result = await createOrder({
        ...orderData,
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          unitPrice: item.variant?.price || item.product.price,
        })),
        subtotal: total,
        total: total + deliveryFee, // Use calculated delivery fee
      })

      if (result.success) {
        await clearCart()
        toast.success("Order placed successfully!")
        router.push(`/orders/${result?.data?.id}`)
      } else {
        toast.error(result.error || "Failed to place order")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  const steps = [
    { id: 1, name: "Shipping", icon: MapPin },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: ShoppingBag },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600">
                {itemCount} {itemCount === 1 ? "item" : "items"} • {formatPrice(total)}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id ? "bg-primary border-primary text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${currentStep >= step.id ? "text-primary" : "text-gray-400"}`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? "bg-primary" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              onSubmit={handleOrderSubmit}
              isSubmitting={isSubmitting}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onDeliveryMethodChange={setDeliveryMethod}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary items={items} deliveryMethod={deliveryMethod} />
          </div>
        </div>
      </div>
    </div>
  )
}
