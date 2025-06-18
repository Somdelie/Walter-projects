import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import { CartProvider } from "@/contexts/cart-context";
import { getAuthenticatedUser } from "@/config/useAuth";
import { WishlistProvider } from "@/contexts/wishlist-context";
// import FooterBanner from "@/components/Footer";
const inter = Rethink_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // this is a aluminum supplier company
  title: "WalterProjects - Aluminum Supplier Company",  
  description: "An aluminum supplier company is a business that specializes in the distribution and sale of aluminum products, including raw materials, extrusions, sheets, and fabricated components.",
  openGraph: {
    title: "WalterProjects - Aluminum Supplier Company",
    description: "An aluminum supplier company is a business that specializes in the distribution and sale of aluminum products, including raw materials, extrusions, sheets, and fabricated components.",
    url: "https://WalterProjects - Aluminum Supplier Company", 
    siteName: "WalterProjects - Aluminum Supplier Company", 
    // images: [
    //   {
    //     url: "https://WalterProjects - Aluminum Supplier Company", .com/og-image.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "WalterProjects - Aluminum Supplier Company",  Logo",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
       <Providers>
         
              {children}
          
        </Providers>
      </body>
    </html>
  );
}
