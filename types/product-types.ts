// We'll now store the string name of the icon, not the component itself.
interface ProductCategoryMapping {
  iconName: string; // Changed from icon: LucideIcon
  description: string;
  featured: boolean;
}

// This object maps product type names (from your database) to their corresponding
// Lucide icon *names* (as strings), hardcoded descriptions, and featured status.
export const productCategoryMappings: Record<string, ProductCategoryMapping> = {
  Windows: {
    iconName: "Home", // Store as string
    description:
      "Premium aluminum windows for residential and commercial use. Energy efficient and durable.",
    featured: true,
  },
  Doors: {
    iconName: "DoorOpen", // Store as string
    description:
      "High-quality aluminum doors including sliding, hinged, and folding options.",
    featured: true,
  },
  Profiles: {
    iconName: "Package", // Store as string
    description:
      "Structural aluminum profiles for construction and architectural applications.",
    featured: false,
  },
  Hardware: {
    iconName: "Wrench", // Store as string
    description:
      "Professional-grade hardware and accessories for aluminum installations.",
    featured: false,
  },
  Glass: {
    iconName: "Glasses", // Store as string
    description:
      "Specialized glass solutions including double glazing and safety glass.",
    featured: false,
  },
  Accessories: {
    iconName: "Building", // Store as string
    description:
      "Complete range of aluminum accessories and finishing components.",
    featured: false,
  },
  // Add more mappings here if you have other product types in your database
  // that need specific icons/descriptions.
};
