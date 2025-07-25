"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  ShoppingCart,
  Heart,
  User,
  Search,
  Settings,
  ShoppingBag,
  LogOut,
  BarChart3,
  Home,
  DoorOpen,
  Package,
  Wrench,
  Glasses,
  Building,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/generateInitials";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { AuthenticatedUser } from "@/config/useAuth";

// Define a mapping from icon names (strings) to their actual Lucide React components
const iconMap: Record<string, LucideIcon> = {
  Home: Home,
  DoorOpen: DoorOpen,
  Package: Package,
  Wrench: Wrench,
  Glasses: Glasses,
  Building: Building,
  // Add any other icons you might use dynamically here
};

// Define the type for product categories passed as props
interface ProductCategory {
  iconName: string; // Changed to string
  title: string;
  description: string;
  href: string;
  featured: boolean;
}

interface CompanyLink {
  title: string;
  description: string;
  href: string;
}

interface SiteHeaderContentProps {
  user: AuthenticatedUser | null;
  productCategories: ProductCategory[];
  companyLinks: CompanyLink[];
}

export default function SiteHeaderContent({
  user,
  productCategories,
  companyLinks,
}: SiteHeaderContentProps) {
  const [open, setOpen] = React.useState(false);
  const [showProducts, setShowProducts] = React.useState(false);
  const [showCompany, setShowCompany] = React.useState(false);
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const router = useRouter();

  const userMenuItems = [
    {
      label: "Help Center",
      href: "/chats",
      icon: User,
      adminOnly: false,
    },
    {
      label: "My Orders",
      href: "/orders",
      icon: ShoppingBag,
      adminOnly: false,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      adminOnly: false,
    },
    {
      label: "My Cart",
      href: "/cart",
      icon: ShoppingCart,
      adminOnly: false,
    },
    {
      label: "Account Settings",
      href: "/settings",
      icon: Settings,
      adminOnly: false,
    },
  ];
  const adminMenuItems = [
    {
      label: "Admin Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      adminOnly: true,
    },
  ];
  async function handleLogout() {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-2xl font-bold text-slate-800 hover:text-sky-600 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-sky-600 to-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WP</span>
            </div>
            <span className="text-primary text-sm">Walter Projects</span>
          </Link>
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10">
                  Products
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[900px] p-6">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-800">
                          Our Products
                        </h4>
                        <p className="text-sm text-slate-600">
                          Premium aluminum solutions for every need
                        </p>
                      </div>
                      <Link
                        href="/products"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        View all products →
                      </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {productCategories.map((category, index) => {
                        const IconComponent =
                          iconMap[category.iconName] || Package; // Get component from map, default to Package
                        return (
                          <Link
                            key={index}
                            href={category.href}
                            className="block group relative"
                          >
                            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <IconComponent className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                                    {category.title}
                                  </h5>
                                  {category.featured && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-yellow-100 text-yellow-800"
                                    >
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-6 pt-4 border-t bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">
                            Need Custom Solutions?
                          </h4>
                          <p className="text-sm text-slate-600">
                            Get expert consultation for your specific aluminum
                            requirements
                          </p>
                        </div>
                        <Button
                          asChild
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Link href="/contact">Get Quote</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10">
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[500px] p-6">
                    <div className="mb-4 pb-3 border-b">
                      <h4 className="text-lg font-semibold text-slate-800">
                        About Walter Projects
                      </h4>
                      <p className="text-sm text-slate-600">
                        Leading aluminum solutions provider
                      </p>
                    </div>
                    <div className="grid gap-3">
                      {companyLinks.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          className="block group"
                        >
                          <div className="p-3 rounded-lg hover:bg-blue-50 transition-colors">
                            <h5 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors mb-1">
                              {link.title}
                            </h5>
                            <p className="text-sm text-slate-600">
                              {link.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Search - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            asChild
          >
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          {user ? (
            <>
              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600">
                      {itemCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage
                      src={user?.image ?? ""}
                      alt={user?.name ?? ""}
                    />
                    <AvatarFallback className="bg-primary text-white font-semibold shadow-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Regular User Menu Items */}
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {/* Admin Menu Items - Only show if user is admin */}
                  {user?.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        Admin Dashboard
                      </DropdownMenuLabel>
                      {adminMenuItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full p-0 flex flex-col">
              <SheetHeader className="border-b p-4 bg-slate-50 flex-shrink-0">
                <SheetTitle className="text-left flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-slate-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">WP</span>
                  </div>
                  <span>Walter Projects</span>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1 py-4">
                <div className="flex flex-col space-y-1">
                  <Link
                    href="/"
                    className="px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  {/* Products Dropdown */}
                  <div className="space-y-1">
                    <button
                      className="flex items-center justify-between w-full px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 text-left transition-colors"
                      onClick={() => setShowProducts(!showProducts)}
                    >
                      Products
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          showProducts && "rotate-180"
                        )}
                      />
                    </button>
                    {showProducts && (
                      <div className="px-4 py-2 space-y-2 bg-slate-50">
                        {productCategories.map((category, index) => {
                          const IconComponent =
                            iconMap[category.iconName] || Package; // Get component from map, default to Package
                          return (
                            <Link
                              key={index}
                              href={category.href}
                              className="flex items-start gap-3 py-2 px-2 rounded hover:bg-white transition-colors"
                              onClick={() => setOpen(false)}
                            >
                              <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                                <IconComponent className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-medium text-sm">
                                  {category.title}
                                </h5>
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  {category.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* Company Dropdown */}
                  <div className="space-y-1">
                    <button
                      className="flex items-center justify-between w-full px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 text-left transition-colors"
                      onClick={() => setShowCompany(!showCompany)}
                    >
                      Company
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          showCompany && "rotate-180"
                        )}
                      />
                    </button>
                    {showCompany && (
                      <div className="px-4 py-2 space-y-1 bg-slate-50">
                        {companyLinks.map((link, index) => (
                          <Link
                            key={index}
                            href={link.href}
                            className="block py-2 px-2 text-sm hover:bg-white rounded transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            {link.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href="/contact"
                    className="px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Contact
                  </Link>
                  {user && (
                    <>
                      <Link
                        href="/wishlist"
                        className="px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                        onClick={() => setOpen(false)}
                      >
                        Wishlist
                        {wishlistCount > 0 && (
                          <Badge className="bg-red-600 text-white text-xs">
                            {wishlistCount}
                          </Badge>
                        )}
                      </Link>
                      <Link
                        href="/cart"
                        className="px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                        onClick={() => setOpen(false)}
                      >
                        Cart
                        {itemCount > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            {itemCount}
                          </Badge>
                        )}
                      </Link>
                      {/* Mobile User Menu Items */}
                      <div className="border-t mt-2 pt-2">
                        <div className="px-4 py-2 text-sm font-medium text-slate-600">
                          Account
                        </div>
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ))}
                        {/* Mobile Admin Menu Items */}
                        {user?.isAdmin && (
                          <>
                            <div className="px-4 py-2 text-sm font-medium text-blue-600 border-t mt-2 pt-2">
                              Admin Panel
                            </div>
                            {adminMenuItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-4 py-3 text-base font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                onClick={() => setOpen(false)}
                              >
                                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </>
                  )}
                  {/* Add some bottom padding to ensure content doesn't get cut off */}
                  <div className="h-32" />
                </div>
              </ScrollArea>
              {/* Mobile Auth Buttons */}
              <div className="flex-shrink-0 p-4 border-t bg-slate-50">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={user?.image ?? ""}
                          alt={user?.name ?? ""}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setOpen(false)}
                      asChild
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setOpen(false)}
                      asChild
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
