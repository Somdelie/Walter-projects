// auth-types.d.ts (place this in your project root)
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// Define the role type
interface Role {
  id: string;
  displayName: string;
  roleName: string;
  description: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      jobTitle?: string | null;
      isVerfied: boolean;
      isAdmin: boolean;
      roles: Role[];
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    firstName: string;
    lastName: string;
    phone: string;
    jobTitle?: string | null;
    isVerfied: boolean;
    roles: Role[];
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    jobTitle?: string | null;
    isVerfied: boolean;
    isAdmin: boolean;
    roles: Role[];
    permissions: string[];
  }
}
