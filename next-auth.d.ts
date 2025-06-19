import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      isAdmin: boolean;
      isVerfied: boolean;
      phone: string;
      roles: Role[];
      permissions: string[];
      jobTitle?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: Role[];
    permissions: string[];
    isVerfied: boolean;
    isAdmin: boolean;
    jobTitle?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultUser {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: Role[];
    permissions: string[];
    isVerfied: boolean;
    isAdmin: boolean;
    jobTitle?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: Role[];
    permissions: string[];
    isVerfied: boolean;
    isAdmin: boolean;
    jobTitle?: string | null;
  }
}

// This is needed to make the file a module
export {};
