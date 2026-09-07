/**
 * @file customers.ts
 * @description Mock data and fixture items for Customer Directory & Cohort Intelligence.
 */

export interface CustomerRecord {
  id: string
  name: string
  email: string
  country: string
  avatar: string
  status: "Active" | "Attention" | "Dispute / Return" | "Suspended" | string
  tier: string
  ordersCount: number
  ordersCadence: string
  totalSpend: string
  avgOrderValue: string
  lastOrder: {
    id: string
    date: string
    isFailed?: boolean
    isChargeback?: boolean
  }
  riskScore: string
  riskLabel: string
  phone: string
  address: string
  returnRate: string
  avgReview: string
}

export const CUSTOMERS_LIST_DATA: CustomerRecord[] = [
  {
    id: "CUST-94821",
    name: "David Miller",
    email: "david.m@example.com",
    country: "US",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    status: "Active",
    tier: "VIP Tier 1",
    ordersCount: 14,
    ordersCadence: "Avg 1 order / 22 days",
    totalSpend: "$4,280.00",
    avgOrderValue: "$305.71",
    lastOrder: { id: "ORD-10248", date: "Today, 2h ago" },
    riskScore: "0.02",
    riskLabel: "Very Low",
    phone: "+1 (555) 234-8921",
    address: "458 Atlantic Ave, Brooklyn, NY 11217",
    returnRate: "0.0%",
    avgReview: "5.0",
  },
  {
    id: "CUST-94822",
    name: "Elena Rostova",
    email: "elena.r@techcorp.io",
    country: "UK",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    status: "Active",
    tier: "Enterprise VIP",
    ordersCount: 11,
    ordersCadence: "Avg 1 order / 14 days",
    totalSpend: "$4,890.00",
    avgOrderValue: "$444.54",
    lastOrder: { id: "ORD-10247", date: "Today, 4h ago" },
    riskScore: "0.01",
    riskLabel: "Very Low",
    phone: "+44 20 7946 0991",
    address: "12 Regent Street, London W1B 5AH",
    returnRate: "0.0%",
    avgReview: "4.8",
  },
  {
    id: "CUST-94823",
    name: "Marcus Chen",
    email: "mchen@acme.org",
    country: "US",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    status: "Attention",
    tier: "Tier 2 Buyer",
    ordersCount: 2,
    ordersCadence: "Infrequent",
    totalSpend: "$620.00",
    avgOrderValue: "$310.00",
    lastOrder: { id: "ORD-10246", date: "Today, 5h ago", isFailed: true },
    riskScore: "0.84",
    riskLabel: "High Risk",
    phone: "+1 (555) 890-1234",
    address: "880 Market St, San Francisco, CA 94102",
    returnRate: "50.0%",
    avgReview: "2.0",
  },
]
