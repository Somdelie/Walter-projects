import React, { Suspense } from "react";
import { columns } from "./columns";
import DataTable from "@/components/DataTableComponents/DataTable";
import { getAuthenticatedUser } from "@/config/useAuth";
import EmptyState from "@/components/global/EmptyState";
import CustomBinIcon from "@/components/global/CustomBinIcon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCategories } from "@/actions/categories";
import { CategoryWithRelations } from "@/types/category";
import { ModalTableHeader } from "@/components/global/ModalTableHeader";
import { CategoryForm } from "@/components/Forms/CategoryForm";
import TableLoading from "@/components/ui/TableLoading";

export default async function page() {
  const user = await getAuthenticatedUser();

  // Create an empty array as fallback to ensure data is never null
 const { data: categories, error } = await getCategories();

  return (
    <Suspense fallback={<TableLoading/>}>
    <Card>
      <CardHeader>
        {" "}
        <ModalTableHeader
          title="Categories r"
          data={categories}
          model="category"
          modalForm={<CategoryForm />}
        />
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <EmptyState
            message="No categories found"
            icon="custom"
            customIcon={<CustomBinIcon />}
            description="Create your first brand to get started with inventory management."
            // actionButton={<UnitForm organizationId={organizationId} />}
          />
        ) : (
          <DataTable columns={columns} data={categories} />
        )}
      </CardContent>
    </Card>
    </Suspense>
  );
}
