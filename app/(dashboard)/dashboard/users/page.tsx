import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { getAllUsers } from "@/actions/users";
import { columns } from "./user-columns";
import { getRoles } from "@/actions/roles";

export default async function page() {
  const users = (await getAllUsers()) || [];
  const roles = await getRoles();

  return (
    <div className="p-8">
      <TableHeader
        title="Users"
        linkTitle="Add User"
        href="/dashboard/users/new"
        data={users}
        model="user"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={users} />
    </div>
  );
}
