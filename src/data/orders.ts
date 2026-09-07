/**
 * @file orders.ts
 * @description Mock data and fixture orders for Orders Management Console.
 */

import { OrderDetails } from "@/components/modules/orders"

export const ORDERS_DATA: OrderDetails[] = [
  {
    id: "ORD-10248",
    date: "Oct 31, 2024",
    time: "14:23:08",
    customer: {
      name: "David Miller",
      email: "david.m@example.com",
      location: "New York, US",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 1 Buyer",
      lifetimeValue: "$1,420.00",
      priorOrders: 4,
      fraudRisk: "0.02 (Low)",
      shippingAddress: {
        line1: "458 Atlantic Ave, Apt 3B",
        cityStateZip: "Brooklyn, NY 11217",
        country: "United States",
        uspsValidated: true,
      },
    },
    itemsCount: 3,
    items: [
      {
        name: "Apex Pro Wireless Mouse",
        sku: "APX-MSE-BLK",
        qty: 1,
        price: "$149.00",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Coiled Aviator Cable (Charcoal)",
        sku: "CBL-AVT-CHR",
        qty: 1,
        price: "$45.00",
        image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Precision Felt Desk Pad (XL)",
        sku: "MAT-FLT-890",
        qty: 1,
        price: "$55.00",
        image: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: Stripe",
      subtotal: "$249.00",
      shipping: "FREE",
      tax: "$0.00",
      discount: "$0.00",
      total: "$249.00",
    },
    fulfillment: {
      status: "Confirmed",
    },
    progress: {
      stepsCompleted: 3,
      totalSteps: 5,
      steps: [
        {
          title: "Order created by David Miller",
          time: "14:23:08 EST",
          detail: "Channel: Web Storefront",
          completed: true,
        },
        {
          title: "Payment $249.00 captured",
          time: "14:23:12 EST",
          detail: "Stripe ch_3M4k9bL291k",
          completed: true,
        },
        {
          title: "Inventory reserved",
          time: "14:24:01 EST",
          detail: "Warehouse East-1 (Aisle 4B)",
          completed: true,
        },
      ],
      nextStep: {
        title: "Ready for Pick & Pack",
        estimate: "Estimated dispatch in 45 mins",
      },
    },
  },
  {
    id: "ORD-10247",
    date: "Oct 31, 2024",
    time: "14:05:19",
    customer: {
      name: "Elena Rostova",
      email: "elena.r@techcorp.io",
      location: "London, UK",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      tier: "Enterprise VIP",
      lifetimeValue: "$4,890.00",
      priorOrders: 11,
      fraudRisk: "0.01 (Low)",
      shippingAddress: {
        line1: "12 Regent Street, Suite 400",
        cityStateZip: "London, W1B 5AH",
        country: "United Kingdom",
        uspsValidated: true,
      },
    },
    itemsCount: 1,
    items: [
      {
        name: "Studio Display Monitor Stand (Dual)",
        sku: "MNT-DK-DUAL",
        qty: 1,
        price: "$1,199.00",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: PayPal",
      subtotal: "$1,199.00",
      shipping: "FREE",
      tax: "$0.00",
      discount: "$0.00",
      total: "$1,199.00",
    },
    fulfillment: {
      status: "Processing",
    },
    progress: {
      stepsCompleted: 2,
      totalSteps: 5,
      steps: [
        {
          title: "Order created by Elena Rostova",
          time: "14:05:19 EST",
          detail: "Channel: Enterprise Portal",
          completed: true,
        },
        {
          title: "Payment $1,199.00 captured",
          time: "14:05:22 EST",
          detail: "PayPal TXN-940219",
          completed: true,
        },
      ],
      nextStep: {
        title: "Inventory Allocation in Progress",
        estimate: "Warehouse Central (Bay 2)",
      },
    },
  },
  {
    id: "ORD-10246",
    date: "Oct 31, 2024",
    time: "13:41:00",
    customer: {
      name: "Marcus Chen",
      email: "mchen@acme.org",
      location: "SF, US",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 2 Buyer",
      lifetimeValue: "$620.00",
      priorOrders: 2,
      fraudRisk: "0.84 (High)",
      shippingAddress: {
        line1: "880 Market St, Floor 5",
        cityStateZip: "San Francisco, CA 94102",
        country: "United States",
        uspsValidated: false,
      },
    },
    itemsCount: 5,
    items: [
      {
        name: "Ergonomic Mechanical Keyboard (RGB)",
        sku: "KB-MECH-RGB",
        qty: 1,
        price: "$342.50",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Failed",
      subtotal: "$342.50",
      shipping: "$15.00",
      tax: "$0.00",
      discount: "$0.00",
      total: "$342.50",
    },
    fulfillment: {
      status: "Cancelled",
    },
  },
  {
    id: "ORD-10245",
    date: "Oct 31, 2024",
    time: "12:18:44",
    customer: {
      name: "Sarah Connor",
      email: "s.connor@sky.net",
      location: "Austin, US",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 1 Buyer",
      lifetimeValue: "$980.00",
      priorOrders: 5,
      fraudRisk: "0.03 (Low)",
      shippingAddress: {
        line1: "100 Congress Ave",
        cityStateZip: "Austin, TX 78701",
        country: "United States",
        uspsValidated: true,
      },
    },
    itemsCount: 2,
    items: [
      {
        name: "USB-C Braided Hub 7-in-1",
        sku: "HUB-USBC-71",
        qty: 2,
        price: "$89.00",
        image: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: Stripe",
      subtotal: "$89.00",
      shipping: "FREE",
      tax: "$0.00",
      discount: "$0.00",
      total: "$89.00",
    },
    fulfillment: {
      status: "Shipped",
    },
  },
  {
    id: "ORD-10244",
    date: "Oct 31, 2024",
    time: "10:55:02",
    customer: {
      name: "Liam Vance",
      email: "lvance@design.co",
      location: "Seattle, US",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      tier: "Pro Creator",
      lifetimeValue: "$2,100.00",
      priorOrders: 7,
      fraudRisk: "0.01 (Low)",
      shippingAddress: {
        line1: "400 Pine Street",
        cityStateZip: "Seattle, WA 98101",
        country: "United States",
        uspsValidated: true,
      },
    },
    itemsCount: 4,
    items: [
      {
        name: "Artisan Walnut Monitor Riser",
        sku: "RISER-WLNT-01",
        qty: 1,
        price: "$450.00",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: Apple Pay",
      subtotal: "$450.00",
      shipping: "FREE",
      tax: "$0.00",
      discount: "$0.00",
      total: "$450.00",
    },
    fulfillment: {
      status: "Delivered",
    },
  },
]
