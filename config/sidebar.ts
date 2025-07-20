import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  FolderOpen,
  Tag,
  Star,
  FileText,
  UserCog,
  Warehouse,
  ShoppingBag,
  Heart,
  MessageSquare,
} from "lucide-react";

export interface ISidebarLink {
  title: string;
  href?: string;
  icon: any;
  permission: string;
  dropdown?: boolean;
  dropdownMenu?: {
    title: string;
    href: string;
    permission: string;
  }[];
}

export const sidebarLinks: ISidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.read",
  },

  // Product Management
  {
    title: "Products",
    icon: Package,
    permission: "products.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "All Products",
        href: "/dashboard/products",
        permission: "products.read",
      },
      {
        title: "Categories",
        href: "/dashboard/products/categories",
        permission: "categories.read",
      },
      {
        title: "Product Types",
        href: "/dashboard/products/types",
        permission: "products.read",
      },
      {
        title: "Brands",
        href: "/dashboard/products/brands",
        permission: "brands.read",
      },
    ],
  },

  // Gallery Management
  {
    title: "Gallery",
    icon: FolderOpen,
     permission: "products.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "All Gallery Items",
        href: "/dashboard/gallery",
         permission: "products.read",
      },
      // {
      //   title: "Add New Item",
      //   href: "/dashboard/gallery/create",
      //    permission: "products.read",
      // },
    ],
  },

  // Inventory Management
  {
    title: "Inventory",
    icon: Warehouse,
    permission: "inventory.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "Stock Levels",
        href: "/dashboard/inventory",
        permission: "inventory.read",
      },
      {
        title: "Low Stock Alerts",
        href: "/dashboard/inventory/low-stock",
        permission: "inventory.read",
      },
      {
        title: "Stock Movements",
        href: "/dashboard/inventory/movements",
        permission: "inventory.read",
      },
    ],
  },

  // Order Management
  {
    title: "Orders",
    icon: ShoppingCart,
    permission: "orders.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "All Orders",
        href: "/dashboard/orders",
        permission: "orders.read",
      },
      {
        title: "Pending Orders",
        href: "/dashboard/orders/pending",
        permission: "orders.read",
      },
      {
        title: "Processing",
        href: "/dashboard/orders/processing",
        permission: "orders.update",
      },
      {
        title: "Shipped",
        href: "/dashboard/orders/shipped",
        permission: "orders.read",
      },
      {
        title: "Delivered",
        href: "/dashboard/orders/delivered",
        permission: "orders.read",
      },
    ],
  },

  // Payments & Finance
  {
    title: "Payments",
    icon: CreditCard,
    permission: "payments.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "All Payments",
        href: "/dashboard/payments",
        permission: "payments.read",
      },
      {
        title: "Pending Payments",
        href: "/dashboard/payments/pending",
        permission: "payments.read",
      },
      {
        title: "Failed Payments",
        href: "/dashboard/payments/failed",
        permission: "payments.read",
      },
      {
        title: "Refunds",
        href: "/dashboard/payments/refunds",
        permission: "payments.refund",
      },
    ],
  },

  // Delivery Management
  {
    title: "Delivery",
    icon: Truck,
    permission: "orders.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "Delivery Schedule",
        href: "/dashboard/delivery/schedule",
        permission: "orders.update",
      },
      {
        title: "Collections",
        href: "/dashboard/delivery/collections",
        permission: "orders.read",
      },
      {
        title: "Tracking",
        href: "/dashboard/delivery/tracking",
        permission: "orders.read",
      },
    ],
  },

  // Reviews & Ratings
  {
    title: "Reviews",
    icon: Star,
    permission: "reviews.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "All Reviews",
        href: "/dashboard/reviews",
        permission: "reviews.read",
      },
      {
        title: "Pending Approval",
        href: "/dashboard/reviews/pending",
        permission: "reviews.moderate",
      },
      {
        title: "Reported Reviews",
        href: "/dashboard/reviews/reported",
        permission: "reviews.moderate",
      },
    ],
  },

  // Reports & Analytics
  // {
  //   title: "Reports",
  //   icon: BarChart3,
  //   permission: "reports.read",
  //   dropdown: true,
  //   dropdownMenu: [
  //     {
  //       title: "Messages",
  //       href: "/dashboard/reports/messages",
  //       permission: "reports.read",
  //     },
  //     {
  //       title: "Customer Report",
  //       href: "/dashboard/reports/customers",
  //       permission: "reports.read",
  //     },
  //     {
  //       title: "Product Performance",
  //       href: "/dashboard/reports/products",
  //       permission: "reports.read",
  //     },
  //   ],
  // },

  // projects Management
  {
    title: "Projects",
    icon: FileText,
    permission: "blogs.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "Our Projects",
        href: "/dashboard/blogs",
        permission: "blogs.read",
      },
      {
        title: "Add New Project",
        href: "/dashboard/projects/create",
        permission: "blogs.create",
      },
    ],
  },

  // Gallery Management
  {
    title: "Gallery",
    icon: FolderOpen,
     permission: "products.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "All Gallery Items",
        href: "/dashboard/gallery",
         permission: "products.read",
      },
      {
        title: "Add New Item",
        href: "/dashboard/gallery/create",
        permission: "gallery.create",
      },
    ],
  },

  // User Management (Admin only)
  {
    title: "User Management",
    icon: UserCog,
    permission: "users.read",
    dropdown: true,
    dropdownMenu: [
      {
        title: "All Users",
        href: "/dashboard/users",
        permission: "users.read",
      },
      {
        title: "Roles & Permissions",
        href: "/dashboard/users/roles",
        permission: "roles.read",
      },
    ],
  },
];

// Customer-specific sidebar links (for customer dashboard)
export const customerSidebarLinks: ISidebarLink[] = [
  {
    title: "Dashboard",
    href: "/account",
    icon: LayoutDashboard,
    permission: "dashboard.read",
  },
  {
    title: "My Orders",
    href: "/account/orders",
    icon: ShoppingBag,
    permission: "orders.read",
  },
  {
    title: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
    permission: "products.read",
  },
  {
    title: "Addresses",
    href: "/account/addresses",
    icon: Truck,
    permission: "dashboard.read",
  },
  {
    title: "Reviews",
    href: "/account/reviews",
    icon: MessageSquare,
    permission: "reviews.create",
  },
  {
    title: "Profile Settings",
    href: "/account/settings",
    icon: Settings,
    permission: "dashboard.read",
  },
];
