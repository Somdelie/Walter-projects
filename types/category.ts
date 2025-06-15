// types/category.ts
export interface CategoryProps {
  title: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}

export interface CategoryWithRelations {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    Product: number;
  };
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CategoryFormData {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface CategorySelectOption {
  label: string;
  value: string;
}
