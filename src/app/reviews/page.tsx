"use client"

import React, { useState } from "react"
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Reply,
  Flag,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Send,
  Eye,
  Check,
  X,
  Package,
} from "lucide-react"

interface ReviewItem {
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

const INITIAL_REVIEWS: ReviewItem[] = [
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
    body: "Switched our entire engineering team's workstations to this keyboard. The gasket mount dampening combined with the ultra-low latency 2.4GHz transceiver delivers an unbelievable typing experience. Zero key chatter across 4 months of heavy daily usage.",
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
    body: "The panel color gamut (99% DCI-P3) and deep blacks are benchmark-grade for color grading and video rendering. However, the initial USB-C firmware flashing tool crashed on macOS Sequoia before the third attempt resolved it.",
    sentiment: "positive",
    sentimentScore: 0.82,
    aspects: [
      { name: "Display Panel & HDR", score: 0.96, sentiment: "pos" },
      { name: "Firmware Tooling", score: 0.45, sentiment: "neu" },
      { name: "Color Accuracy", score: 0.98, sentiment: "pos" },
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
    body: "Audio resolution and passive isolation are great, but the left pivot hinge developed an annoying audible click whenever I turn my head. For a premium $450 studio headset, this mechanical tolerance issue is disappointing.",
    sentiment: "negative",
    sentimentScore: 0.28,
    aspects: [
      { name: "Acoustics", score: 0.88, sentiment: "pos" },
      { name: "Hinge Durability", score: 0.18, sentiment: "neg" },
      { name: "Value for Price", score: 0.32, sentiment: "neg" },
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
    body: "DO NOT BUY HERE visit cheapkeyboards-discount-store.xyz for 90% off genuine Apex boards with fast shipping! Best code FREE50",
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
  {
    id: "REV-90825",
    orderId: "ORD-94830",
    customer: {
      name: "Chloe Chen",
      email: "chloe.chen@designcraft.studio",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
      cohort: "VIP Tier",
    },
    product: {
      id: "PROD-4012",
      title: "Ergonomic Sculpted Aluminum Desk Mat (XL)",
      sku: "ACC-MAT-XL-GRY",
      image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=150&auto=format&fit=crop&q=80",
    },
    rating: 5,
    headline: "Flawless finish, matches our minimal aesthetic perfectly",
    body: "Cold-anodized chamfered edge feels premium. Glides effortlessly with our optical mice. Packaging was recycled and arrived in less than 36 hours.",
    sentiment: "positive",
    sentimentScore: 0.95,
    aspects: [
      { name: "Material & Finish", score: 0.99, sentiment: "pos" },
      { name: "Fulfillment Speed", score: 0.96, sentiment: "pos" },
    ],
    status: "published",
    isFeatured: true,
    helpfulCount: 15,
    createdAt: "2026-09-05T16:04:00Z",
  },
]

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS)
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(INITIAL_REVIEWS[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")
  const [replyText, setReplyText] = useState("")

  const filteredReviews = reviews.filter((rev) => {
    if (ratingFilter !== "all" && rev.rating !== parseInt(ratingFilter, 10)) return false
    if (statusFilter !== "all" && rev.status !== statusFilter) return false
    if (sentimentFilter !== "all" && rev.sentiment !== sentimentFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchCustomer = rev.customer.name.toLowerCase().includes(q)
      const matchProduct = rev.product.title.toLowerCase().includes(q) || rev.product.sku.toLowerCase().includes(q)
      const matchText = rev.headline.toLowerCase().includes(q) || rev.body.toLowerCase().includes(q)
      if (!matchCustomer && !matchProduct && !matchText) return false
    }
    return true
  })

  const updateReviewStatus = (id: string, newStatus: ReviewItem["status"]) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const toggleFeatured = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFeatured: !r.isFeatured } : r))
    )
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, isFeatured: !prev.isFeatured } : null))
    }
  }

  const handleSendReply = () => {
    if (!selectedReview || !replyText.trim()) return
    const updated: ReviewItem = {
      ...selectedReview,
      merchantReply: {
        author: "Sarah Jenkins (Super Admin)",
        date: new Date().toISOString().split("T")[0],
        text: replyText.trim(),
      },
    }
    setReviews((prev) => prev.map((r) => (r.id === selectedReview.id ? updated : r)))
    setSelectedReview(updated)
    setReplyText("")
  }

  const applyAITemplate = (template: string) => {
    setReplyText(template)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Star className="h-5 w-5 fill-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Customer Reviews & Sentiment Intelligence</h1>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                NLP Pipeline Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Aspect-based sentiment scoring, real-time spam triage, and storefront publication controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReviews(INITIAL_REVIEWS)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            Sync Feeds
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#3525cd] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Batch Moderate
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Average Sentiment Rating</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-400" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">4.72</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
              <span className="text-xs font-semibold text-emerald-600">+0.14 MoM</span>
            </div>
            <div className="mt-3 flex items-center gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div className="h-full bg-emerald-500" style={{ width: "82%" }} />
              <div className="h-full bg-blue-500" style={{ width: "10%" }} />
              <div className="h-full bg-amber-400" style={{ width: "5%" }} />
              <div className="h-full bg-rose-500" style={{ width: "3%" }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-mono">
              <span>5★ 82%</span>
              <span>4★ 10%</span>
              <span>3★ 5%</span>
              <span>1-2★ 3%</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Verified Reviews</span>
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">24,812</span>
              <span className="text-xs font-semibold text-emerald-600">94.2% verified</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              +482 new verified buyer submissions in last 7 days
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">AI Positive Sentiment</span>
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">89.4%</span>
              <span className="text-xs font-medium text-slate-500">Confidence &gt; 92%</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                Pos: 22.1k
              </span>
              <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
                Neu: 1.8k
              </span>
              <span className="inline-flex items-center rounded bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700">
                Neg: 912
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Flagged for Moderation</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-amber-600 font-mono">14</span>
              <span className="text-xs text-slate-500">requires review</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              1 quarantined bot spam, 13 negative dispute reviews
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews, SKU, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Ratings (★)</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="quarantined">Quarantined (Spam)</option>
            </select>

            {/* Sentiment Filter */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive Sentiment</option>
              <option value="neutral">Neutral Sentiment</option>
              <option value="negative">Negative Sentiment</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Showing <strong className="font-mono text-slate-800">{filteredReviews.length}</strong> reviews</span>
          </div>
        </div>

        {/* 2-Column Main Workspace: Review Table on Left, Inspector & Response Drawer on Right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Star className="h-8 w-8 text-slate-300" />
                <h3 className="mt-2 text-sm font-semibold text-slate-800">No reviews found</h3>
                <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const isSelected = selectedReview?.id === rev.id
                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedReview(rev)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/20 shadow-xs ring-1 ring-indigo-500/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.customer.avatar}
                          alt={rev.customer.name}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900">{rev.customer.name}</span>
                            {rev.customer.isVerified && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-medium text-emerald-700">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{rev.customer.cohort} • Order #{rev.orderId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        {rev.status === "published" && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            Published
                          </span>
                        )}
                        {rev.status === "flagged" && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                            Flagged
                          </span>
                        )}
                        {rev.status === "quarantined" && (
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                            Quarantined (Spam)
                          </span>
                        )}
                        {rev.isFeatured && (
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product & Stars */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.product.image}
                          alt={rev.product.title}
                          className="h-6 w-6 rounded object-cover border border-slate-200"
                        />
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[240px]">
                          {rev.product.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Headline & Excerpt */}
                    <div className="mt-2">
                      <h4 className="text-xs font-semibold text-slate-900">{rev.headline}</h4>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {rev.body}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {rev.helpfulCount} helpful
                        </span>
                        {rev.merchantReply && (
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                            <Reply className="h-3 w-3" /> Merchant Replied
                          </span>
                        )}
                      </div>
                      <span>{new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right Inspector & Response Drawer */}
          <div className="lg:col-span-5">
            {selectedReview ? (
              <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                {/* Header & Quick Action Buttons */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{selectedReview.id}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-600">Order #{selectedReview.orderId}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-slate-900">Review Moderation Inspector</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFeatured(selectedReview.id)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedReview.isFeatured
                          ? "border-purple-200 bg-purple-50 text-purple-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      title="Feature on Product Landing Page"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {selectedReview.isFeatured ? "Featured" : "Feature"}
                    </button>
                    {selectedReview.status !== "published" ? (
                      <button
                        onClick={() => updateReviewStatus(selectedReview.id, "published")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" /> Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => updateReviewStatus(selectedReview.id, "flagged")}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                      >
                        <Flag className="h-3.5 w-3.5" /> Quarantine
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer & Product Context */}
                <div className="rounded-lg bg-slate-50 p-3 space-y-2 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedReview.customer.avatar}
                        alt={selectedReview.customer.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-800">{selectedReview.customer.name}</span>
                      <span className="text-slate-400">({selectedReview.customer.email})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700 truncate max-w-[220px]">{selectedReview.product.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">{selectedReview.product.sku}</span>
                  </div>
                </div>

                {/* Full Review Content */}
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedReview.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">{selectedReview.rating}.0 out of 5</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-slate-900">{selectedReview.headline}</h4>
                  <p className="mt-1.5 text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    "{selectedReview.body}"
                  </p>
                </div>

                {/* AI Aspect-Based Sentiment Analysis */}
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-indigo-900">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      AI NLP Aspect Breakdown
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-indigo-700">
                      Overall {(selectedReview.sentimentScore * 100).toFixed(0)}% Pos
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedReview.aspects.map((aspect, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{aspect.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full ${
                                aspect.sentiment === "pos"
                                  ? "bg-emerald-500"
                                  : aspect.sentiment === "neu"
                                  ? "bg-amber-400"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${Math.round(aspect.score * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 w-8 text-right">
                            {(aspect.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Existing Reply if Present */}
                {selectedReview.merchantReply && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1 text-indigo-600">
                        <Reply className="h-3.5 w-3.5" /> Published Merchant Response
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">{selectedReview.merchantReply.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      "{selectedReview.merchantReply.text}"
                    </p>
                  </div>
                )}

                {/* Reply Composer with AI Quick Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Post Public Merchant Response</label>
                    <span className="text-[11px] text-slate-400">AI Prompt Assist</span>
                  </div>

                  {/* AI Quick Response Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() =>
                        applyAITemplate(
                          `Hi ${selectedReview.customer.name.split(" ")[0]}, thank you for the wonderful feedback! Our engineering team works relentlessly to deliver this standard of quality.`
                        )
                      }
                      className="rounded-full border border-indigo-100 bg-indigo-50/60 px-2 py-0.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      + Thank Customer
                    </button>
                    <button
                      onClick={() =>
                        applyAITemplate(
                          `Hi ${selectedReview.customer.name.split(" ")[0]}, we sincerely apologize for the inconvenience. We have opened a priority ticket with our support squad to replace this unit immediately.`
                        )
                      }
                      className="rounded-full border border-amber-100 bg-amber-50/60 px-2 py-0.5 text-[10px] font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      + Resolution & Replacement
                    </button>
                    <button
                      onClick={() =>
                        applyAITemplate(
                          `Hi ${selectedReview.customer.name.split(" ")[0]}, could you reach out to support@apexcommerce.io with order #${selectedReview.orderId} so we can assist you with calibration?`
                        )
                      }
                      className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      + Follow-up Contact
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write an official merchant reply to this customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3525cd] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Publish Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-400">
                Select a review from the stream to inspect sentiment breakdown and moderate.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
