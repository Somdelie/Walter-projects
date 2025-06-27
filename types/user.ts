import type { Role as PrismaRole } from "@prisma/client";

// Extended User type that includes the role property
export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  jobTitle: string | null;
  roles: PrismaRole[];
  password: string | null;
  status: boolean;
  isAdmin: boolean;
  isVerfied: boolean; // Keeping your typo as in the model
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null; // Add this property for the current role ID
}

// For the edit form - only the fields admin can edit
export interface UserEditData {
  phone: string;
  status: boolean;
  emailVerified: Date | null;
  isAdmin: boolean;
  image: string | null;
  role: string | null; // Role ID
}
