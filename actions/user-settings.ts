"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getAuthenticatedUser } from "@/config/useAuth";

export async function updatePersonalInfo(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const jobTitle = formData.get("jobTitle") as string;

    // Basic validation
    if (!firstName || !lastName) {
      return {
        success: false,
        error: "First name and last name are required",
      };
    }

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await db.user.findFirst({
        where: {
          phone: phone,
          id: {
            not: user.id,
          },
        },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Phone number is already in use",
        };
      }
    }

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || undefined,
        jobTitle: jobTitle || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating personal info:", error);
    return {
      success: false,
      error: "Failed to update personal information",
    };
  }
}

export async function updateEmail(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const email = formData.get("email") as string;

    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    // Check if email is already taken
    const existingUser = await db.user.findFirst({
      where: {
        email: email,
        id: {
          not: user.id,
        },
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email is already in use",
      };
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        email,
        isVerfied: false, // Reset verification when email changes
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      message:
        "Email updated successfully. Please verify your new email address.",
    };
  } catch (error) {
    console.error("Error updating email:", error);
    return {
      success: false,
      error: "Failed to update email",
    };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        error: "All password fields are required",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "New passwords do not match",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    // Get current user with password
    const userWithPassword = await db.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        password: true,
      },
    });

    if (!userWithPassword?.password) {
      return {
        success: false,
        error: "Current password not found",
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: "Failed to update password",
    };
  }
}

export async function updateProfileImage(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const imageUrl = formData.get("imageUrl") as string;

    if (!imageUrl) {
      return {
        success: false,
        error: "Image URL is required",
      };
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        image: imageUrl,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      message: "Profile image updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return {
      success: false,
      error: "Failed to update profile image",
    };
  }
}

export async function deleteAccount(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const confirmation = formData.get("confirmation") as string;

    if (confirmation !== "DELETE") {
      return {
        success: false,
        error: "Please type DELETE to confirm account deletion",
      };
    }

    // Instead of deleting, we'll deactivate the account
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: false,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Account has been deactivated successfully",
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error: "Failed to delete account",
    };
  }
}
