import { db } from "@/prisma/db"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    const admins = await db.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        status: true,
      },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
