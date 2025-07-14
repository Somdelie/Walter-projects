import type { ProductType, ProductStatus, Product } from "@prisma/client";

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isMain: boolean;
  sortOrder: number;
}

export interface ProductCreateData {
  name: string;
  description?: string | null;
  shortDesc?: string | null;
  type?: ProductType | string; // Use string to allow for dynamic types
  productTypeId?: string; // Optional, if you have a specific type ID
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockAlert: number;
  trackStock: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId: string;
  brandId?: string;
  thumbnail?: string;
  imageUrls?: string[]; // Add this line
  isFeatured: boolean;
  isOnSale: boolean;
  sku?: string; // Will be auto-generated if not provided
  slug?: string; // Will be auto-generated if not provided
  metaTitle?: string;
  metaDesc?: string;
}

// Keep your existing ProductUpdateData for cases where you need the ID
export interface ProductUpdateData extends Partial<ProductCreateData> {
  id: string;
  status?: ProductStatus;
}

// Add a new type for mutation data (without the required ID)
export interface ProductMutationData extends Partial<ProductCreateData> {
  status?: ProductStatus;
}

export const PRODUCT_TYPES = [
  { value: "WINDOW", label: "Windows" },
  { value: "DOOR", label: "Doors" },
  { value: "PROFILE", label: "Profiles" },
  { value: "ACCESSORY", label: "Accessories" },
  { value: "GLASS", label: "Glass" },
  { value: "HARDWARE", label: "Hardware" },
  { value: "BALUSTRADES", label: "Balustrades" },
  { value: "FACADE", label: "Facade" },
  { value: "SHUTTER", label: "Shutters" },
  { value: "BLINDS", label: "Blinds" },
  { value: "AWNINGS", label: "Awnings" },
  { value: "GATES", label: "Gates" },
  { value: "FENCING", label: "Fencing" },
  { value: "OTHER", label: "Other" },
] as const;

export const PRODUCT_STATUSES = [
  { value: "ACTIVE" as const, label: "Active" },
  { value: "INACTIVE" as const, label: "Inactive" },
  { value: "OUT_OF_STOCK" as const, label: "Out of Stock" },
  { value: "DISCONTINUED" as const, label: "Discontinued" },
] as const;

// Extended product type with relations
export interface ProductWithDetails extends Product {
  category: {
    id: string;
    title: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  variants?: any[];
  attributes?: any[];
  reviews?: any[];
}
