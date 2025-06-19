import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // if session is null or session but isAdmin is false, redirect to not found page
  if (!session || (session && !session.user?.isAdmin)) {
    // show unauthorized component
    redirect("/not-found");
  }
  return (
    <div className="min-h-screen w-full">
      <Sidebar session={session} />
      <div className="md:ml-[220px] lg:ml-[280px]">
        <Navbar session={session} />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
