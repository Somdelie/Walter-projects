import { type NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob"; // Import the put function from Vercel Blob
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 }
    );
  }

  // Ensure the request body is a Blob or File
  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is empty" },
      { status: 400 }
    );
  }

  try {
    // Generate a unique filename to prevent overwrites and ensure immutability [^2]
    const fileExtension = filename.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Upload the file directly to Vercel Blob
    // The 'put' function handles the actual upload to your Vercel Blob store
    const blob = await put(uniqueFilename, request.body, {
      access: "public", // Make the uploaded blob publicly accessible
      // You can add more options here, e.g., contentType, addRandomSuffix
      // contentType: request.headers.get('content-type') || undefined, // Infer content type from request
    });

    // The 'blob' object contains the URL of the uploaded file
    return NextResponse.json(
      { url: blob.url, filename: blob.pathname },
      { status: 200 }
    );
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred during upload",
      },
      { status: 500 }
    );
  }
}
