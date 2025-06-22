"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import type { CategoryWithRelations } from "@/types/category"
import SortableColumn from "@/components/DataTableColumns/SortableColumn"
import DateColumn from "@/components/DataTableColumns/DateColumn"
import { ActionColumn } from "@/components/DataTableColumns/ActionColumn"

export const columns: ColumnDef<CategoryWithRelations>[] = [
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
    accessorKey: "title",
    header: ({ column }) => <SortableColumn column={column} title="Title" />,
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      return <ActionColumn row={row} model="category" id={row.original.id} />

    },
  },
]
