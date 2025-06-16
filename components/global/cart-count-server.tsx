
import { getCartCount } from "@/actions/cart-actions"
import { Badge } from "@/components/ui/badge"

export default async function CartCountServer() {
  const result = await getCartCount()
  const count = result.success ? result.data : 0

  if (count === 0) return null

  return (
    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600">
      {count}
    </Badge>
  )
}
