
import SiteFooter from "@/components/frontend/footer";
import Footer from "@/components/frontend/site-footer";
import SiteHeader from "@/components/frontend/site-header";
import { authOptions } from "@/config/auth";
import { getAuthenticatedUser } from "@/config/useAuth";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { getServerSession } from "next-auth";
import React, { ReactNode } from "react";
export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  // const session = await getServerSession(authOptions);

  const user = await getAuthenticatedUser();
  console.log("User in HomeLayout:", user);
  return (
    <div className="bg-white">
       <CartProvider user={user}>
         <WishlistProvider user={user}>
      <SiteHeader user={user} />
      {children}
      </WishlistProvider>
      </CartProvider>
      <SiteFooter />
    </div>
  );
}
