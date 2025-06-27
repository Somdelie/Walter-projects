"use client"

import DataTable from "@/components/DataTableComponents/DataTable"
import { createColumns } from "./user-columns"
import type { User } from "@/types/user"
import type { Role } from "@prisma/client"

interface UsersDataTableProps {
  users: User[]
  roles: Role[]
}

export function UsersDataTable({ users, roles }: UsersDataTableProps) {
  const columns = createColumns(roles)

  return <DataTable columns={columns} data={users} />
}
