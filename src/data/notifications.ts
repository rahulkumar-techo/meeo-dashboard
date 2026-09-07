/**
 * @file notifications.ts
 * @description Mock data and fixture items for Notifications & Dispatcher Log.
 */

export interface DispatchLog {
  id: string
  channel: "email" | "sms" | "push" | "webhook"
  status: "delivered" | "sent" | "failed" | "opened" | "bounced" | "retrying" | string
  statusDetail: string
  eventName: string
  referenceId: string
  recipient: string
  provider: string
  latencyMs: number
  deliveryDuration: string
  timestamp: string
}

export const NOTIFICATIONS_LOGS: DispatchLog[] = [
  {
    id: "dsp_948201",
    channel: "email",
    status: "delivered",
    statusDetail: "250 OK Delivered",
    eventName: "Order Confirmation",
    referenceId: "ORD-10248",
    recipient: "david.m@example.com",
    provider: "AWS SES (us-east-1)",
    latencyMs: 142,
    deliveryDuration: "1.2s",
    timestamp: "14:28:11",
  },
  {
    id: "dsp_948202",
    channel: "sms",
    status: "delivered",
    statusDetail: "Delivered to Carrier",
    eventName: "Out for Delivery Alert",
    referenceId: "ORD-10245",
    recipient: "+1 (555) 234-8921",
    provider: "Twilio SMS Gateway",
    latencyMs: 210,
    deliveryDuration: "2.4s",
    timestamp: "14:26:04",
  },
  {
    id: "dsp_948203",
    channel: "webhook",
    status: "failed",
    statusDetail: "HTTP 504 Gateway Timeout",
    eventName: "payment.succeeded webhook",
    referenceId: "PAY-99214",
    recipient: "https://partner-erp.acme.com",
    provider: "Webhook Fanout Queue",
    latencyMs: 8000,
    deliveryDuration: "8.0s",
    timestamp: "14:24:12",
  },
]
