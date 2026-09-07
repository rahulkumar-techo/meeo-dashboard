/**
 * @file refunds.ts
 * @description Mock data and fixture items for Finance Refunds & Dispute Arbitration.
 */

export interface RefundItem {
  id: string
  orderId: string
  customer: string
  email: string
  tier?: string
  amount: string
  rawAmount: number
  type: string
  reason: string
  reasonDetail: string
  slaTimer: string
  slaUrgent?: boolean
  status: "Pending" | "Under Dispute" | "Settled" | "Dispute Won" | "Declined" | string
  date: string
  gateway: string
  trackingNumber: string
  warehouseStation: string
}

export const REFUND_QUEUE_DATA: RefundItem[] = [
  {
    id: "ref_89201A",
    orderId: "ORD-10244",
    customer: "Liam Vance",
    email: "lvance@design.co",
    tier: "VIP",
    amount: "$189.00",
    rawAmount: 189.0,
    type: "Full",
    reason: "Defective Switch",
    reasonDetail: "The mechanical switch housing on the Spacebar emits scraping noise.",
    slaTimer: "6h left",
    slaUrgent: true,
    status: "Pending",
    date: "Today, 14:10",
    gateway: "Stripe",
    trackingNumber: "RMA-748921-US",
    warehouseStation: "Warehouse East-1 (Bay 4)",
  },
  {
    id: "ref_89202B",
    orderId: "ORD-10246",
    customer: "Marcus Chen",
    email: "mchen@acme.org",
    tier: "Standard",
    amount: "$342.50",
    rawAmount: 342.5,
    type: "Chargeback",
    reason: "Fraudulent Transaction",
    reasonDetail: "Cardholder claims unrecognized card charge on online store.",
    slaTimer: "18h left",
    slaUrgent: false,
    status: "Under Dispute",
    date: "Yesterday, 18:22",
    gateway: "Stripe",
    trackingNumber: "DISP-99210-VISA",
    warehouseStation: "Security / Risk Hub",
  },
  {
    id: "ref_89203C",
    orderId: "ORD-10240",
    customer: "Sarah Connor",
    email: "s.connor@sky.net",
    tier: "VIP",
    amount: "$45.00",
    rawAmount: 45.0,
    type: "Partial (-15%)",
    reason: "Late Delivery Credit",
    reasonDetail: "Carrier delayed shipment past SLA guarantee.",
    slaTimer: "Resolved",
    slaUrgent: false,
    status: "Settled",
    date: "Oct 29, 2024",
    gateway: "Apple Pay",
    trackingNumber: "CRD-10294-APX",
    warehouseStation: "Auto Settlement",
  },
]
