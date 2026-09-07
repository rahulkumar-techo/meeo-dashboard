/**
 * @file customer-360.ts
 * @description Mock data and fixture items for Customer 360 Unified Profile.
 */

export interface CustomerProfileData {
  id: string
  name: string
  email: string
  phone: string
  location: string
  avatar: string
  tier: string
  memberSince: string
  lifetimeValue: string
  totalOrders: number
  avgOrderValue: string
  returnRate: string
  fraudScore: string
  riskLevel: "Low" | "Medium" | "High"
  creditBalance: string
  loyaltyPoints: number
  shippingAddress: {
    line1: string
    cityStateZip: string
    country: string
  }
}

export const CUSTOMER_360_PROFILE: CustomerProfileData = {
  id: "USR-99201",
  name: "David Miller",
  email: "david.m@example.com",
  phone: "+1 (555) 234-8901",
  location: "Brooklyn, New York, US",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  tier: "VIP Gold Tier",
  memberSince: "Nov 2022 (2y active)",
  lifetimeValue: "$3,420.50",
  totalOrders: 14,
  avgOrderValue: "$244.32",
  returnRate: "0.0%",
  fraudScore: "0.02 (Optimal)",
  riskLevel: "Low",
  creditBalance: "$45.00",
  loyaltyPoints: 3420,
  shippingAddress: {
    line1: "458 Atlantic Ave, Apt 3B",
    cityStateZip: "Brooklyn, NY 11217",
    country: "United States",
  },
}

export interface CustomerOrderHistory {
  id: string
  date: string
  status: string
  itemsCount: number
  itemsSummary: string
  totalAmount: string
  paymentMethod: string
}

export const CUSTOMER_ORDER_HISTORY: CustomerOrderHistory[] = [
  {
    id: "ORD-10248",
    date: "Oct 31, 2024",
    status: "Confirmed",
    itemsCount: 3,
    itemsSummary: "Apex Pro Wireless Mouse, Coiled Aviator Cable, Desk Pad",
    totalAmount: "$249.00",
    paymentMethod: "Visa •••• 1092",
  },
  {
    id: "ORD-10190",
    date: "Oct 12, 2024",
    status: "Delivered",
    itemsCount: 1,
    itemsSummary: "Studio Display Monitor Stand (Dual)",
    totalAmount: "$1,199.00",
    paymentMethod: "Stripe Apple Pay",
  },
  {
    id: "ORD-10042",
    date: "Aug 24, 2024",
    status: "Delivered",
    itemsCount: 2,
    itemsSummary: "Titanium Studio ANC Headphones",
    totalAmount: "$450.00",
    paymentMethod: "Visa •••• 1092",
  },
]
