"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Shield } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user"
import ImageColumn from "@/components/DataTableColumns/ImageColumn"
import SortableColumn from "@/components/DataTableColumns/SortableColumn"
import { ActionColumn } from "@/components/DataTableColumns/ActionColumn"

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "Profile",
    cell: ({ row }) => <ImageColumn row={row} accessorKey="image" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
    cell: ({ row }) => {
      const user = row.original
      return (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.jobTitle}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableColumn column={column} title="Email" />,
    cell: ({ row }) => {
      const user = row.original
      return (
        <div>
          <div>{user.email}</div>
          <div className="flex items-center gap-1 text-sm">
            {user.emailVerified ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Verified</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 text-red-500" />
                <span className="text-red-600">Not verified</span>
              </>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <SortableColumn column={column} title="Phone" />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={user.status ? "default" : "secondary"}>{user.status ? "Active" : "Inactive"}</Badge>
          {user.isAdmin && (
            <Badge variant="destructive" className="w-fit">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionColumn row={row} model="user" id={row.original.id} />


    },
  },
]
