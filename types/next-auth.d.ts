// types/next-auth.d.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName: string;
      lastName: string;
      phone: string;
      jobTitle?: string | null;
      isVerfied: boolean; // Note: keeping the typo as it exists in your schema
      roles: Array<{
        id: string;
        displayName: string;
        roleName: string;
        description: string | null;
        permissions: string[];
        createdAt: Date;
        updatedAt: Date;
      }>;
      permissions: string[];
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName: string;
    lastName: string;
    phone: string;
    jobTitle?: string | null;
    isVerfied: boolean;
    roles: Array<{
      id: string;
      displayName: string;
      roleName: string;
      description: string | null;
      permissions: string[];
      createdAt: Date;
      updatedAt: Date;
    }>;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    jobTitle?: string | null;
    isVerfied: boolean;
    roles: Array<{
      id: string;
      displayName: string;
      roleName: string;
      description: string | null;
      permissions: string[];
      createdAt: Date;
      updatedAt: Date;
    }>;
    permissions: string[];
  }
}
