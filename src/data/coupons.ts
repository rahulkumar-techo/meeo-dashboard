/**
 * @file coupons.ts
 * @description Mock data and fixture coupons for Marketing Coupons management.
 */

export interface CouponRecord {
  id: string
  code: string
  name: string
  type: string
  typeDetail: string
  discountValue: string
  redemptionsCount: number
  redemptionsCap: number | "unlimited"
  percentUsed: number
  eligibility: string
  validWindow: string
  channels: string[]
  status: "Active" | "Scheduled" | "Expired" | "Suspended"
  gmvGenerated: string
  discountCost: string
  roi: string
  lift: string
  minSpend: string
  maxDiscountCap: string
  velocityGuard: string
  recentRedemptions: {
    orderId: string
    customer: string
    discountAmount: string
    timestamp: string
  }[]
}

export const COUPONS_DATA: CouponRecord[] = [
  {
    id: "CPN-WELCOME15",
    code: "WELCOME15",
    name: "New Customer First Order Onboarding",
    type: "Percentage Off",
    typeDetail: "15% off entire cart",
    discountValue: "15%",
    redemptionsCount: 2450,
    redemptionsCap: 10000,
    percentUsed: 24.5,
    eligibility: "First-time purchasers only",
    validWindow: "2024-01-01 – 2024-12-31",
    channels: ["Web", "iOS", "Android"],
    status: "Active",
    gmvGenerated: "$367,500.00",
    discountCost: "$55,125.00",
    roi: "6.6x",
    lift: "+32.4%",
    minSpend: "$50.00",
    maxDiscountCap: "$75.00",
    velocityGuard: "1 redemption per IP/Card",
    recentRedemptions: [
      { orderId: "ORD-10248", customer: "David Miller", discountAmount: "-$37.35", timestamp: "4m ago" },
      { orderId: "ORD-10239", customer: "Sarah Connor", discountAmount: "-$13.35", timestamp: "1h ago" },
    ],
  },
  {
    id: "CPN-VIP25OFF",
    code: "VIP25OFF",
    name: "VIP Gold Tier Exclusive Loyalty Reward",
    type: "Fixed Cash",
    typeDetail: "$25 flat discount",
    discountValue: "$25.00",
    redemptionsCount: 840,
    redemptionsCap: 1000,
    percentUsed: 84.0,
    eligibility: "VIP Gold Tier Members (LTV > $1k)",
    validWindow: "2024-10-01 – 2024-11-30",
    channels: ["Web", "Mobile App"],
    status: "Active",
    gmvGenerated: "$126,000.00",
    discountCost: "$21,000.00",
    roi: "6.0x",
    lift: "+18.9%",
    minSpend: "$100.00",
    maxDiscountCap: "$25.00",
    velocityGuard: "Single use token per account",
    recentRedemptions: [
      { orderId: "ORD-10247", customer: "Elena Rostova", discountAmount: "-$25.00", timestamp: "18m ago" },
    ],
  },
  {
    id: "CPN-FLASH50",
    code: "FLASH50",
    name: "Midnight Flash Markdown: Audio Series",
    type: "Percentage Off",
    typeDetail: "50% off select audio gear",
    discountValue: "50%",
    redemptionsCount: 310,
    redemptionsCap: 500,
    percentUsed: 62.0,
    eligibility: "SKUs in category AUD-*",
    validWindow: "2024-10-31 only",
    channels: ["Web"],
    status: "Active",
    gmvGenerated: "$46,500.00",
    discountCost: "$23,250.00",
    roi: "2.0x",
    lift: "+142.0%",
    minSpend: "$0.00",
    maxDiscountCap: "$150.00",
    velocityGuard: "500 total global limit",
    recentRedemptions: [
      { orderId: "ORD-10240", customer: "Liam Vance", discountAmount: "-$75.00", timestamp: "2h ago" },
    ],
  },
]
