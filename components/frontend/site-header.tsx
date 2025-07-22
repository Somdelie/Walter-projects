import type { AuthenticatedUser } from "@/config/useAuth";
import SiteHeaderContent from "./site-header-content";
import { getProductTypeRefs } from "@/actions/product-category-data";
import { productCategoryMappings } from "@/types/product-types";

const companyLinks = [
  {
    title: "About Us",
    description: "Learn about our commitment to quality aluminum solutions",
    href: "/about",
  },
  {
    title: "Our Projects",
    description: "Explore our portfolio of completed aluminum installations",
    href: "/projects",
  },
  {
    title: "Gallery",
    description: "View our extensive gallery showcasing our products in action",
    href: "/gallery",
  },
  {
    title: "Quality Assurance",
    description: "Discover our rigorous quality control processes",
    href: "/quality",
  },
  {
    title: "Sustainability",
    description: "Our commitment to environmentally responsible practices",
    href: "/sustainability",
  },
];

export default async function SiteHeader({
  user,
}: {
  user: AuthenticatedUser | null;
}) {
  // Fetch product types from the database on the server
  const { data: fetchedProductTypes } = await getProductTypeRefs();

  // Map fetched product types to the desired structure,
  // combining database data with hardcoded descriptions and icon *names*.
  const productCategories = (fetchedProductTypes || []).map((type) => {
    const mapping = productCategoryMappings[type.name];
    return {
      iconName: mapping?.iconName || "Package", // Pass icon name as string, default to "Package"
      title: type.name,
      description:
        mapping?.description || "Discover high-quality aluminum solutions.", // Use mapped description or a default
      href: `/products?type=${type.id}`,
      featured: mapping?.featured || false, // Use mapped featured status or default to false
    };
  });

  return (
    <SiteHeaderContent
      user={user}
      productCategories={productCategories}
      companyLinks={companyLinks}
    />
  );
}
