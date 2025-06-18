import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { authOptions } from "./auth";

// Type for authenticated user with permissions
export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle?: string | null;
  isVerfied?: boolean; // Note: keeping the typo as it exists in your schema
  roles: Role[];
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Extended user type for settings page with guaranteed database fields
export interface FullAuthenticatedUser extends AuthenticatedUser {
  isVerfied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Function to check authorization and return NotAuthorized component if needed
export async function checkPermission(requiredPermission: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    // Redirect to login page if not authenticated
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    // Redirect to unauthorized page or return unauthorized component
    redirect("/unauthorized");
  }

  return true;
}

// Function to get authenticated user or redirect
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return session.user as AuthenticatedUser;
}

// Function to check multiple permissions (any)
export async function checkAnyPermission(permissions: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];

  const hasAnyPermission = permissions.some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAnyPermission) {
    redirect("/unauthorized");
  }

  return true;
}

// Function to check multiple permissions (all)
export async function checkAllPermissions(permissions: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];

  const hasAllPermissions = permissions.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAllPermissions) {
    redirect("/unauthorized");
  }

  return true;
}

// Function to get full user data for settings page
export async function getUserForSettings(): Promise<FullAuthenticatedUser | null> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  // Always fetch fresh data from the database for settings page
  const { db } = await import("@/prisma/db");

  const fullUser = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      image: true,
      jobTitle: true,
      isVerfied: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        select: {
          id: true,
          displayName: true,
          roleName: true,
          description: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!fullUser) {
    return null;
  }

  // Combine permissions from all roles
  const permissions = fullUser.roles.flatMap((role) => role.permissions);

  return {
    ...fullUser,
    roles: fullUser.roles,
    permissions,
  } as FullAuthenticatedUser;
}
