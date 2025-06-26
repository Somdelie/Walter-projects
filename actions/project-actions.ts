"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";

export interface ProjectFormData {
  name: string;
  description: string;
  thumbnail?: string;
  imageUrls?: string[];
}

// Create a new project
export async function createProject(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const thumbnail = formData.get("thumbnail") as string;
    const imageUrls = formData.getAll("imageUrls") as string[];

    if (!name || !description) {
      return { error: "Name and description are required" };
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingProject = await db.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      return { error: "A project with this name already exists" };
    }

    const project = await db.project.create({
      data: {
        name,
        slug,
        description,
        thumbnail: thumbnail || null,
        imageUrls: imageUrls.filter((url) => url.trim() !== ""),
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");

    return { success: true, project };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: "Failed to create project" };
  }
}

// Update an existing project
export async function updateProject(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const thumbnail = formData.get("thumbnail") as string;
    const imageUrls = formData.getAll("imageUrls") as string[];

    if (!name || !description) {
      return { error: "Name and description are required" };
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists (excluding current project)
    const existingProject = await db.project.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existingProject) {
      return { error: "A project with this name already exists" };
    }

    const project = await db.project.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        thumbnail: thumbnail || null,
        imageUrls: imageUrls.filter((url) => url.trim() !== ""),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);

    return { success: true, project };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: "Failed to update project" };
  }
}

// Delete a project
export async function deleteProject(id: string) {
  try {
    await db.project.delete({
      where: { id },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "Failed to delete project" };
  }
}

// Get all projects
export async function getProjects() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// Get a single project by slug
export async function getProjectBySlug(slug: string) {
  try {
    const project = await db.project.findUnique({
      where: { slug },
    });

    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

// Get a single project by ID
export async function getProjectById(id: string) {
  try {
    const project = await db.project.findUnique({
      where: { id },
    });

    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}
