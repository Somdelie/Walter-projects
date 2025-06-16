import { getDashboardOverview } from "@/actions/analytics";
import { getAllOrders } from "@/actions/orders";
import { getAllUsers } from "@/actions/users";
import DashboardMain from "@/components/dashboard/DashboardMain";
import { getAuthenticatedUser } from "@/config/useAuth";
import { Order } from "@/types/orders";

export default async function Dashboard() {
  const analytics = (await getDashboardOverview()) || [];
  const user = await getAuthenticatedUser();
  const users = await getAllUsers();
  const orders = await getAllOrders();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      </div>
    );
  }

  if(!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-600">No users found</h1>
      </div>
    );
  }
  if(!orders) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-600">No orders found</h1>
      </div>
    );
  }

  console.log(orders, 'orders in dashboard page');

  return (
    <main>
      <DashboardMain users={users} orders={orders as any}/>
    </main>
  );
}
