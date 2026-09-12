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

import { SYSTEM_PERMISSIONS } from "@/lib/permissions"

export interface NavSubItem {
  title: string
  url: string
  permission?: string
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "brand"
}

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  permission?: string
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
        permission: SYSTEM_PERMISSIONS.DASHBOARD_READ,
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
        permission: SYSTEM_PERMISSIONS.ORDER_READ,
      },
      {
        title: "Products",
        url: "/products",
        icon: Package,
        permission: SYSTEM_PERMISSIONS.PRODUCT_READ,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: Layers,
        permission: SYSTEM_PERMISSIONS.CATEGORY_READ,
      },
      {
        title: "Brands",
        url: "/brands",
        icon: Award,
        permission: SYSTEM_PERMISSIONS.BRAND_READ,
      },
      {
        title: "Attributes",
        url: "/attributes",
        icon: Tag,
        permission: SYSTEM_PERMISSIONS.ATTRIBUTE_READ,
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: Boxes,
        permission: SYSTEM_PERMISSIONS.INVENTORY_READ,
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
        permission: SYSTEM_PERMISSIONS.USER_READ,
      },
      {
        title: "Customer 360",
        url: "/customers/360",
        icon: UserCheck,
        permission: SYSTEM_PERMISSIONS.USER_READ,
      },
      {
        title: "Reviews",
        url: "/reviews",
        icon: Star,
        permission: SYSTEM_PERMISSIONS.REVIEW_READ,
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
        permission: SYSTEM_PERMISSIONS.PAYMENT_READ,
      },
      {
        title: "Refunds",
        url: "/finance/refunds",
        icon: RotateCcw,
        permission: SYSTEM_PERMISSIONS.PAYMENT_REFUND,
      },
      {
        title: "Transactions",
        url: "/finance/transactions",
        icon: Receipt,
        permission: SYSTEM_PERMISSIONS.PAYMENT_READ,
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
        permission: SYSTEM_PERMISSIONS.COUPON_READ,
      },
      {
        title: "Promotions",
        url: "/marketing/promotions",
        icon: Megaphone,
        permission: SYSTEM_PERMISSIONS.COUPON_READ,
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
        permission: SYSTEM_PERMISSIONS.AUDIT_READ,
      },
      {
        title: "Background Jobs",
        url: "/operations/background-jobs",
        icon: Cpu,
        permission: SYSTEM_PERMISSIONS.SYSTEM_MANAGE,
      },
      {
        title: "Outbox Events",
        url: "/operations/outbox-events",
        icon: Send,
        permission: SYSTEM_PERMISSIONS.SYSTEM_MANAGE,
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
        permission: SYSTEM_PERMISSIONS.DASHBOARD_READ,
      },
      {
        title: "Reports",
        url: "/analytics/reports",
        icon: FileText,
        permission: SYSTEM_PERMISSIONS.DASHBOARD_READ,
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
        permission: SYSTEM_PERMISSIONS.ROLE_READ,
      },
      {
        title: "Audit Logs",
        url: "/admin/audit-logs",
        icon: ShieldAlert,
        permission: SYSTEM_PERMISSIONS.AUDIT_READ,
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
        permission: SYSTEM_PERMISSIONS.SYSTEM_MANAGE,
      },
    ],
  },
]
