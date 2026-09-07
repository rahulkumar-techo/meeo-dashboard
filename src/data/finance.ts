/**
 * @file finance.ts
 * @description Mock data and fixtures for Transactions, Payments, and Refunds.
 */

import { TransactionRecord } from "@/components/modules/finance"

export interface ExtendedTransaction extends TransactionRecord {
  timeUtc: string
  type: string
  railDetail: string
  settlementAmount: string
  isPositive: boolean
  payoutId?: string
}

export const FINANCE_TRANSACTIONS: ExtendedTransaction[] = [
  {
    id: "txn_3m4k9bL291k",
    timeUtc: "18:42:19",
    createdAt: "2024-10-31 18:42:19",
    type: "Charge",
    customer: { name: "Liam Vance", email: "lvance@design.co" },
    orderId: "ORD-10248",
    gateway: "stripe",
    paymentMethod: "Visa",
    cardLast4: "1092",
    railDetail: "Visa •••• 1092",
    amount: 249.0,
    fee: 6.23,
    netAmount: 242.77,
    settlementAmount: "+$242.77",
    isPositive: true,
    status: "succeeded",
    payoutId: "po_1O9VzQL291a09",
  },
  {
    id: "txn_892a014902c",
    timeUtc: "17:15:02",
    createdAt: "2024-10-31 17:15:02",
    type: "Charge",
    customer: { name: "Elena Rostova", email: "elena.r@techcorp.io" },
    orderId: "ORD-10247",
    gateway: "paypal",
    paymentMethod: "PayPal Express",
    railDetail: "PayPal Express",
    amount: 1199.0,
    fee: 34.77,
    netAmount: 1164.23,
    settlementAmount: "+$1,164.23",
    isPositive: true,
    status: "succeeded",
    payoutId: "po_1O9VzQL291a09",
  },
  {
    id: "txn_558190281ba",
    timeUtc: "16:08:44",
    createdAt: "2024-10-31 16:08:44",
    type: "Refund",
    customer: { name: "Marcus Chen", email: "mchen@acme.org" },
    orderId: "ORD-10246",
    gateway: "stripe",
    paymentMethod: "Mastercard",
    cardLast4: "8841",
    railDetail: "Mastercard •••• 8841",
    amount: -342.5,
    fee: 0.0,
    netAmount: -342.5,
    settlementAmount: "-$342.50",
    isPositive: false,
    status: "refunded",
    payoutId: "po_1O9VzQL291a09",
  },
  {
    id: "txn_1092849102a",
    timeUtc: "14:22:10",
    createdAt: "2024-10-31 14:22:10",
    type: "Charge",
    customer: { name: "Sarah Connor", email: "s.connor@sky.net" },
    orderId: "ORD-10245",
    gateway: "stripe",
    paymentMethod: "Apple Pay",
    cardLast4: "4912",
    railDetail: "Apple Pay (Visa •••• 4912)",
    amount: 89.0,
    fee: 2.88,
    netAmount: 86.12,
    settlementAmount: "+$86.12",
    isPositive: true,
    status: "succeeded",
    payoutId: "po_1O9VzQL291a09",
  },
]

export interface RefundRecord {
  id: string
  orderId: string
  customer: { name: string; email: string }
  amount: number
  reason: string
  status: "completed" | "pending" | "declined" | string
  gateway: string
  date: string
  itemsCount: number
}

export const FINANCE_REFUNDS: RefundRecord[] = [
  {
    id: "ref_90124a",
    orderId: "ORD-10246",
    customer: { name: "Marcus Chen", email: "mchen@acme.org" },
    amount: 342.5,
    reason: "Order cancellation before shipment",
    status: "completed",
    gateway: "Stripe Gateway",
    date: "Oct 31, 2024 16:08",
    itemsCount: 5,
  },
  {
    id: "ref_88201b",
    orderId: "ORD-10190",
    customer: { name: "Jessica Alba", email: "j.alba@hollywood.com" },
    amount: 89.0,
    reason: "Defective USB-C cable (RMA verified)",
    status: "completed",
    gateway: "PayPal",
    date: "Oct 30, 2024 11:24",
    itemsCount: 1,
  },
  {
    id: "ref_74819c",
    orderId: "ORD-10112",
    customer: { name: "Robert Downey", email: "rdj@stark.io" },
    amount: 149.0,
    reason: "Customer changed mind - returned to warehouse",
    status: "pending",
    gateway: "Apple Pay",
    date: "Oct 29, 2024 09:12",
    itemsCount: 1,
  },
]
