
import { getAllOrders } from "@/actions/orders";
import { getNonAdminUsers } from "@/actions/users";
import DashboardMain from "@/components/dashboard/DashboardMain";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function Dashboard() {
  const user = await getAuthenticatedUser();
  const users = await getNonAdminUsers();
  const orders = await getAllOrders();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      </div>
    );
  }

  return (
    <main>
      <DashboardMain users={users} orders={orders as any}/>
    </main>
  );
}
