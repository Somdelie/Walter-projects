import { authOptions } from "@/config/auth";
import { AuthenticatedUser } from "@/config/useAuth";
import { getServerSession } from "next-auth";

export async function getOptionalUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
