import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  Package,
  Download,
  ShoppingBag,
  Users,
  DollarSign,
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { User } from "@prisma/client";
import { Order } from "@/types/orders";
import { formatDistanceToNow } from "date-fns";
import { getRecentOrders, getTopProducts, getLowStockProducts } from "@/actions/analytics";

export default async function DashboardMain({ 
  users, 
  orders, 
  analytics 
}: { 
  users: User[], 
  orders: Order[] | Order | null | undefined, 
  analytics?: any 
}) {
  const ordersArray = Array.isArray(orders) ? orders : [];

  const [recentOrders, topProducts, lowStockProducts] = await Promise.all([
    getRecentOrders(),
    getTopProducts(),
    getLowStockProducts(),
  ]);

  const totalRevenue = analytics?.totalRevenue || ordersArray.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalOrders = ordersArray.length;
  const totalCustomers = users.length;

  const previousRevenue = analytics?.previousRevenue || 0;
  const previousOrders = analytics?.previousOrders || 0;
  const previousCustomers = analytics?.previousCustomers || 0;

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "CONFIRMED": return "bg-yellow-100 text-yellow-800";
      case "SHIPPED": return "bg-purple-100 text-purple-800";
      case "PENDING": return "bg-gray-100 text-gray-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case "WINDOW": return "🪡";
      case "DOOR": return "🚪";
      case "PROFILE": return "📐";
      case "HARDWARE": return "🔩";
      case "GLASS": return "🔍";
      case "ACCESSORY": return "🔧";
      default: return "📦";
    }
  };

  const bigCards = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      change: calculatePercentageChange(totalRevenue, previousRevenue),
      trend: totalRevenue >= previousRevenue ? "up" : "down",
      icon: DollarSign,
      description: "vs last month",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString('en-ZA'),
      change: calculatePercentageChange(totalOrders, previousOrders),
      trend: totalOrders >= previousOrders ? "up" : "down",
      icon: ShoppingBag,
      description: "vs last month",
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString('en-ZA'),
      change: calculatePercentageChange(totalCustomers, previousCustomers),
      trend: totalCustomers >= previousCustomers ? "up" : "down",
      icon: Users,
      description: "registered users",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
        {bigCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className={`flex items-center text-sm mt-1 ${card.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {card.trend === "up" ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                {card.change}
                <span className="ml-2 text-muted-foreground">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{order.deliveryMethod}</TableCell>
                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Most sold products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded mr-3">
                    {getProductTypeIcon(product?.type || "OTHER")}
                  </div>
                  <div>
                    <div className="font-medium text-sm truncate">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.sales ?? 0} sales • {product.stockQuantity} in stock</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{formatPrice(product.revenue ?? 0)}</div>
                  <div className="text-xs text-muted-foreground">{product.type}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle><Package className="inline-block mr-2 h-4 w-4 text-amber-500" /> Low Stock Alert</CardTitle>
            <CardDescription>These products need restocking</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-600">{product.stockQuantity} left</p>
                  <p className="text-xs text-muted-foreground">Alert at {product.lowStockAlert}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// React Hook for low stock alerts in your components
// export function useLowStockAlerts() {
//   const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchLowStockProducts = async () => {
//       try {
//         // You'd need to create an API endpoint for this
//         const response = await fetch('/api/products/low-stock');
//         const data = await response.json();
//         setLowStockProducts(data);
//       } catch (error) {
//         console.error('Error fetching low stock products:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchLowStockProducts();
    
//     // Optionally set up polling for real-time updates
//     const interval = setInterval(fetchLowStockProducts, 300000); // 5 minutes
    
//     return () => clearInterval(interval);
//   }, []);

//   return { lowStockProducts, isLoading };
// }
