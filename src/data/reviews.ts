/**
 * @file reviews.ts
 * @description Mock data and fixture items for Reviews & Rating Moderation.
 */

export interface ReviewItem {
  id: string
  orderId: string
  customer: {
    name: string
    email: string
    avatar: string
    isVerified: boolean
    cohort: string
  }
  product: {
    id: string
    title: string
    sku: string
    image: string
  }
  rating: number
  headline: string
  body: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
  aspects: { name: string; score: number; sentiment: "pos" | "neu" | "neg" }[]
  status: "published" | "pending" | "flagged" | "quarantined"
  isFeatured: boolean
  helpfulCount: number
  merchantReply?: {
    author: string
    date: string
    text: string
  }
  createdAt: string
}

export const REVIEWS_DATA: ReviewItem[] = [
  {
    id: "REV-90821",
    orderId: "ORD-94821",
    customer: {
      name: "Marcus Vance",
      email: "marcus.v@enterprise.co",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
      cohort: "Enterprise Tier 1",
    },
    product: {
      id: "PROD-1029",
      title: "Apex Carbon Pro Wireless Mechanical Keyboard",
      sku: "KB-APX-PRO-01",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80",
    },
    rating: 5,
    headline: "Unmatched actuation speed and tactile precision for dev workflows",
    body: "Switched our entire engineering team's workstations to this keyboard. The gasket mount dampening combined with the ultra-low latency 2.4GHz transceiver delivers an unbelievable typing experience.",
    sentiment: "positive",
    sentimentScore: 0.98,
    aspects: [
      { name: "Build Quality", score: 0.99, sentiment: "pos" },
      { name: "Latency & Wireless", score: 0.97, sentiment: "pos" },
      { name: "Tactile Feedback", score: 0.98, sentiment: "pos" },
    ],
    status: "published",
    isFeatured: true,
    helpfulCount: 42,
    merchantReply: {
      author: "Sarah Jenkins (Apex Support)",
      date: "2026-09-02",
      text: "Thank you Marcus! Delighted to hear the engineering squad is enjoying the custom dampening switches.",
    },
    createdAt: "2026-09-01T14:23:00Z",
  },
  {
    id: "REV-90822",
    orderId: "ORD-94819",
    customer: {
      name: "Elena Rostova",
      email: "elena.rostova@techvanguard.io",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
      cohort: "VIP Tier",
    },
    product: {
      id: "PROD-2041",
      title: "Apex Horizon Ultrawide 38\" OLED Master Display",
      sku: "DSP-38-OLED-4K",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&auto=format&fit=crop&q=80",
    },
    rating: 4,
    headline: "Stunning color fidelity, but firmware update took multiple tries",
    body: "The panel color gamut (99% DCI-P3) and deep blacks are benchmark-grade for color grading and video rendering.",
    sentiment: "positive",
    sentimentScore: 0.82,
    aspects: [
      { name: "Display Panel & HDR", score: 0.96, sentiment: "pos" },
      { name: "Firmware Tooling", score: 0.45, sentiment: "neu" },
    ],
    status: "published",
    isFeatured: false,
    helpfulCount: 19,
    createdAt: "2026-09-03T09:12:00Z",
  },
  {
    id: "REV-90823",
    orderId: "ORD-94770",
    customer: {
      name: "David K.",
      email: "david.k@cloudsys.net",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
      cohort: "Returning Customer",
    },
    product: {
      id: "PROD-3088",
      title: "Titanium Studio Headphones with ANC",
      sku: "AUD-ANC-PRO-BLK",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80",
    },
    rating: 2,
    headline: "Left ear cup creaks under head movement after 2 weeks",
    body: "Audio resolution and passive isolation are great, but the left pivot hinge developed an audible click.",
    sentiment: "negative",
    sentimentScore: 0.28,
    aspects: [
      { name: "Acoustics", score: 0.88, sentiment: "pos" },
      { name: "Hinge Durability", score: 0.18, sentiment: "neg" },
    ],
    status: "flagged",
    isFeatured: false,
    helpfulCount: 8,
    createdAt: "2026-09-04T18:40:00Z",
  },
  {
    id: "REV-90824",
    orderId: "ORD-94690",
    customer: {
      name: "Liam O'Connor",
      email: "liam.oc@matrixlab.org",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      isVerified: false,
      cohort: "Guest",
    },
    product: {
      id: "PROD-1029",
      title: "Apex Carbon Pro Wireless Mechanical Keyboard",
      sku: "KB-APX-PRO-01",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80",
    },
    rating: 1,
    headline: "Suspicious spam link in review body detected by NLP classifier",
    body: "DO NOT BUY HERE visit cheapkeyboards-discount-store.xyz for discount code",
    sentiment: "negative",
    sentimentScore: 0.05,
    aspects: [
      { name: "Spam Detection", score: 0.01, sentiment: "neg" },
    ],
    status: "quarantined",
    isFeatured: false,
    helpfulCount: 0,
    createdAt: "2026-09-05T03:15:00Z",
  },
]
