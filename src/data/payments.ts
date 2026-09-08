/**
 * @file payments.ts
 * @description Fixture items and mock fallback data for Payment Operations matching backend schema.
 */

import type { PaymentListItem } from "@/types/payment"

export const MOCK_ADMIN_PAYMENTS: PaymentListItem[] = [
  {
    id: "pay-11111111-2222-3333-4444-555555555555",
    orderId: "ord-22222222-3333-4444-5555-666666666666",
    status: "SUCCESS",
    amount: 126.64,
    refundedAmount: 0.0,
    currency: "USD",
    provider: "STRIPE",
    paymentMethod: "card_visa",
    attemptsCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    id: "pay-88888888-4444-2222-1111-999999999999",
    orderId: "ord-33333333-5555-7777-9999-111122223333",
    status: "PARTIALLY_REFUNDED",
    amount: 450.0,
    refundedAmount: 150.0,
    currency: "USD",
    provider: "STRIPE",
    paymentMethod: "card_mastercard",
    attemptsCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "pay-33333333-7777-1111-4444-222233334444",
    orderId: "ord-44444444-6666-8888-0000-555566667777",
    status: "PROCESSING",
    amount: 299.99,
    refundedAmount: 0.0,
    currency: "USD",
    provider: "RAZORPAY",
    paymentMethod: "upi",
    attemptsCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "pay-55555555-9999-4444-3333-888877776666",
    orderId: "ord-55555555-7777-9999-1111-222233334444",
    status: "FAILED",
    amount: 89.5,
    refundedAmount: 0.0,
    currency: "USD",
    provider: "STRIPE",
    paymentMethod: "card_amex",
    attemptsCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 415).toISOString(),
  },
  {
    id: "pay-77777777-3333-2222-6666-111144445555",
    orderId: "ord-66666666-8888-0000-2222-333344445555",
    status: "REFUNDED",
    amount: 78.25,
    refundedAmount: 78.25,
    currency: "USD",
    provider: "MOCK",
    paymentMethod: "mock_wallet",
    attemptsCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 840).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
]
