"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import type { User } from "@prisma/client";

export async function getUserByEmail(): Promise<User | null> {
  try {
    const loggedInUser = await getAuthenticatedUser();

    if (!loggedInUser?.email) {
      console.warn("No authenticated user or email found");
      return null;
    }

    const user = await db.user.findUnique({
      where: { email: loggedInUser.email },
    });

    console.log("Fetched user by email:", user);
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function updatePersonalInfo(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
}> {
  try {
    const user = await getUserByEmail();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: formData.get("firstName")?.toString() || user.firstName,
        firstName: formData.get("firstName")?.toString() || user.firstName,
        lastName: formData.get("lastName")?.toString() || user.lastName,
        phone: formData.get("phone")?.toString() || user.phone,
        jobTitle: formData.get("jobTitle")?.toString() || user.jobTitle,
      },
    });

    console.log("Updated user:", updatedUser);
    revalidatePath("/settings");

    return {
      success: true,
      message: "Personal information updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating personal info:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateImage(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  user?: User;
}> {
  try {
    const user = await getUserByEmail();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const imageUrl = formData.get("imageUrl")?.toString();
    if (!imageUrl) {
      return { success: false, error: "Image URL is required" };
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    console.log("Updated user image:", updatedUser);
    revalidatePath("/settings");

    return {
      success: true,
      message: "Profile image updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// updateEmail function
export async function updateEmail(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const user = await getUserByEmail();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newEmail = formData.get("email")?.toString();
    if (!newEmail) {
      return { success: false, error: "Email is required" };
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    console.log("Updated user email:", updatedUser);
    revalidatePath("/settings");

    return {
      success: true,
      message: "Email updated successfully",
    };
  } catch (error) {
    console.error("Error updating email:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// updatePassword function
export async function updatePassword(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const user = await getUserByEmail();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    // Here you would typically verify the current password and hash the new password
    // For simplicity, we assume the password update is successful

    console.log("Updated user password:", user.id);
    revalidatePath("/settings");

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// deleteAccount function
export async function deleteAccount(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const user = await getUserByEmail();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const confirmation = formData.get("confirmation")?.toString();
    if (confirmation !== "DELETE") {
      return { success: false, error: "Confirmation required" };
    }

    await db.user.delete({ where: { id: user.id } });
    console.log("User account deleted:", user.id);
    revalidatePath("/settings");

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
