
import SiteFooter from "@/components/frontend/footer";
import SiteHeader from "@/components/frontend/site-header";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { getOptionalUser } from "@/services/getOptionalUser";
import React, { ReactNode } from "react";
export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  // const session = await getServerSession(authOptions);

 const user = await getOptionalUser();

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
