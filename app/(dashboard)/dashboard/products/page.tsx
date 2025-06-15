import { Suspense } from "react";
import TableLoading from "@/components/ui/TableLoading";
import { getAllProducts } from "@/actions/product";
import { getCategories } from "@/actions/categories";
import ProductsListing from "@/components/dashboard/products/ProductListing";
import { getAllBrands } from "@/actions/brands";

const ProductsPage = async () => {
  // Fetch all required data
  const [
    { data: products, error: productsError },
    { data: categories, error: categoriesError },
    { data: brands, error: brandsError }
  ] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getAllBrands()
  ]);

  // Handle errors if needed
  if (productsError || categoriesError || brandsError) {
    console.error("Error fetching data:", {
      productsError,
      categoriesError,
      brandsError
    });
  }

  // Create category map for ProductsListing
  const categoryMap = (categories || []).reduce((acc, category) => {
    acc[category.id] = {
      id: category.id,
      title: category.title || category.title // Adjust based on your category model
    };
    return acc;
  }, {} as Record<string, { id: string; title: string }>);

  // Create brand map for ProductsListing
  const brandMap = (brands || []).reduce((acc, brand) => {
    acc[brand.id] = {
      id: brand.id,
      name: brand.name
    };
    return acc;
  }, {} as Record<string, { id: string; name: string }>);

  return (
    <Suspense fallback={<TableLoading />}>
      <ProductsListing
        title="Products"
        categoryMap={categoryMap}
        brandMap={brandMap}
      />
    </Suspense>
  );
};

export default ProductsPage;