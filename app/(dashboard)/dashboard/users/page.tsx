import { getAllUsers } from "@/actions/users"
import { getRoles } from "@/actions/roles"
import { UsersDataTable } from "./users-data-table"
import TableHeader from "@/components/dashboard/Tables/TableHeader"

export default async function page() {
  const usersRaw = (await getAllUsers()) || []

  // Map users to include the role ID (not role name)
  const users = usersRaw.map((user) => ({
    ...user,
    role: user.roles?.[0]?.id || null, // Use role ID instead of role name
  }))

  const rolesResult = await getRoles()
  console.log("Roles:", rolesResult)

  // Extract the roles data and handle potential errors
  const roles = rolesResult.success && rolesResult.data ? rolesResult.data : []

  return (
    <div className="p-8">
      <TableHeader title="Users" linkTitle="Add User" href="/dashboard/users/new" data={users} model="user" />
      <UsersDataTable users={users} roles={roles} />
    </div>
  )
}
