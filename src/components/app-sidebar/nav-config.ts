import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Award,
  Boxes,
  Tag,
  Users,
  Star,
  CreditCard,
  RotateCcw,
  Receipt,
  Ticket,
  Megaphone,
  Bell,
  Cpu,
  Send,
  BarChart3,
  FileText,
  UserCheck,
  ShieldAlert,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavSubItem {
  title: string
  url: string
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "brand"
}

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "brand"
  items?: NavSubItem[]
  defaultOpen?: boolean
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export interface AdminUser {
  name: string
  email: string
  role: string
  avatar: string
  initials: string
}

export interface SystemStatus {
  status: "operational" | "degraded" | "outage"
  label: string
  href: string
  metrics?: string
}

export const CURRENT_SYSTEM_STATUS: SystemStatus = {
  status: "operational",
  label: "All Systems Operational",
  href: "/system-health",
  metrics: "99.98%",
}

export const CURRENT_ADMIN: AdminUser = {
  name: "Platform Administrator",
  email: "admin@platform.com",
  role: "Super Admin",
  avatar: "",
  initials: "PA",
}

export const SIDEBAR_NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "commerce",
    label: "COMMERCE",
    items: [
      {
        title: "Orders",
        url: "/orders",
        icon: ShoppingCart,
        badge: "12 new",
        badgeVariant: "brand",
      },
      {
        title: "Products",
        url: "/products",
        icon: Package,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: Layers,
      },
      {
        title: "Brands",
        url: "/brands",
        icon: Award,
      },
      {
        title: "Attributes",
        url: "/attributes",
        icon: Tag,
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: Boxes,
        badge: "3 low",
        badgeVariant: "warning",
      },
    ],
  },
  {
    id: "customers",
    label: "CUSTOMERS",
    items: [
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
        badge: "1.8k",
        badgeVariant: "brand",
      },
      {
        title: "Customer 360",
        url: "/customers/360",
        icon: UserCheck,
      },
      {
        title: "Reviews",
        url: "/reviews",
        icon: Star,
      },
    ],
  },
  {
    id: "finance",
    label: "FINANCE",
    items: [
      {
        title: "Payments",
        url: "/finance/payments",
        icon: CreditCard,
      },
      {
        title: "Refunds",
        url: "/finance/refunds",
        icon: RotateCcw,
      },
      {
        title: "Transactions",
        url: "/finance/transactions",
        icon: Receipt,
      },
    ],
  },
  {
    id: "marketing",
    label: "MARKETING",
    items: [
      {
        title: "Coupons",
        url: "/marketing/coupons",
        icon: Ticket,
      },
      {
        title: "Promotions",
        url: "/marketing/promotions",
        icon: Megaphone,
      },
    ],
  },
  {
    id: "operations",
    label: "OPERATIONS",
    items: [
      {
        title: "Notifications",
        url: "/operations/notifications",
        icon: Bell,
      },
      {
        title: "Background Jobs",
        url: "/operations/background-jobs",
        icon: Cpu,
      },
      {
        title: "Outbox Events",
        url: "/operations/outbox-events",
        icon: Send,
        badge: "1 failed",
        badgeVariant: "destructive",
      },
    ],
  },
  {
    id: "analytics",
    label: "ANALYTICS",
    items: [
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
      },
      {
        title: "Reports",
        url: "/analytics/reports",
        icon: FileText,
      },
    ],
  },
  {
    id: "administration",
    label: "ADMINISTRATION",
    items: [
      {
        title: "Users & Roles",
        url: "/admin/users-roles",
        icon: UserCheck,
      },
      {
        title: "Audit Logs",
        url: "/admin/audit-logs",
        icon: ShieldAlert,
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
    ],
  },
]
