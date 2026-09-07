/**
 * @file payments.ts
 * @description Mock data and fixture items for Payment Intent Processing & Gateway Health.
 */

export interface PaymentIntentRecord {
  id: string
  orderId: string
  customer: string
  method: string
  cardLast4: string
  gateway: string
  grossAmount: string
  fee: string
  netAmount: string
  status: "succeeded" | "failed" | "pending" | string
  statusLabel: string
  timestamp: string
}

export const PAYMENTS_LIST_DATA: PaymentIntentRecord[] = [
  {
    id: "pi_3M4k9bL291k",
    orderId: "ORD-10246",
    customer: "Marcus Chen",
    method: "Visa",
    cardLast4: "4242",
    gateway: "Stripe",
    grossAmount: "$342.50",
    fee: "$10.22",
    netAmount: "$332.28",
    status: "failed",
    statusLabel: "Card Declined (Funds)",
    timestamp: "42m ago",
  },
  {
    id: "pi_88201a092b",
    orderId: "ORD-10248",
    customer: "David Miller",
    method: "Mastercard",
    cardLast4: "1092",
    gateway: "Stripe",
    grossAmount: "$249.00",
    fee: "$7.52",
    netAmount: "$241.48",
    status: "succeeded",
    statusLabel: "Captured",
    timestamp: "4m ago",
  },
  {
    id: "pi_11029481a",
    orderId: "ORD-10247",
    customer: "Elena Rostova",
    method: "PayPal Express",
    cardLast4: "N/A",
    gateway: "PayPal",
    grossAmount: "$1,199.00",
    fee: "$34.77",
    netAmount: "$1,164.23",
    status: "succeeded",
    statusLabel: "Settled",
    timestamp: "18m ago",
  },
]
