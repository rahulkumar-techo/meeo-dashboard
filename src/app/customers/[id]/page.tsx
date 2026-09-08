/**
 * @file page.tsx
 * @description Dynamic 360-Degree Customer Intelligence View for a specific customer ID.
 * Features full profile summary, non-cancelled spend tiers, order history, saved addresses, product reviews, and active device session revocation.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Crown,
  History,
  Star,
  Laptop,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  UserCog,
  Clock,
  Heart,
  ShoppingCart,
  Loader2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader, MetricGrid, StatusBadge, EmptyState } from "@/components/common"
import {
  useCustomer360Query,
  useRevokeCustomerSessionMutation,
} from "@/hooks/use-customer-query"
import {
  CustomerTierBadge,
  CustomerRiskBadge,
  CustomerStatusDialog,
  EditCustomerDialog,
} from "@/components/customers"
import type { AdminCustomer } from "@/types/customer"

export default function Customer360DetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = String(params?.id || "")

  const [activeTab, setActiveTab] = React.useState("orders")
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  // Query 360 Data
  const {
    data: data360,
    isLoading,
    refetch,
  } = useCustomer360Query(userId)

  const revokeSessionMutation = useRevokeCustomerSessionMutation()

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync({
        userId,
        sessionId,
      })
      refetch()
    } catch (err) {
      console.error("Failed to revoke session", err)
    }
  }

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(String(val)) || 0
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num)
  }

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return "N/A"
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          Loading Customer 360 Intelligence...
        </p>
      </div>
    )
  }

  if (!data360) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto space-y-4">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to Customer Directory
        </Link>
        <EmptyState
          title="Customer Not Found"
          description={`No customer record was found matching ID: ${userId}`}
          actionLabel="Back to Customers"
          onAction={() => router.push("/customers")}
        />
      </div>
    )
  }

  const { profile, summary, engagement, addresses, recentOrders, recentReviews, activeSessions } =
    data360

  const customerName =
    profile.firstName || profile.lastName
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : "Customer Profile"

  const initials = customerName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "C"

  // Adapter for dialogs
  const customerAdapter: AdminCustomer = {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    avatarUrl: profile.avatarUrl,
    status: profile.status,
    emailVerified: profile.emailVerified,
    phoneVerified: profile.phoneVerified,
    lastLoginAt: profile.lastLoginAt,
    createdAt: profile.createdAt,
    roles: profile.roles,
    totalOrders: summary.totalOrders,
    totalSpend: summary.totalSpend,
    tier: summary.tier,
    riskScore: summary.riskScore,
    riskLevel: summary.riskLevel,
    riskFlag: summary.riskFlag,
    actionNeeded: summary.actionNeeded,
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to Customer Directory
        </Link>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <UserCog className="size-3.5" /> Edit Profile
          </Button>
          <Button
            size="sm"
            onClick={() => setStatusDialogOpen(true)}
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-medium"
          >
            <ShieldAlert className="size-3.5" /> Moderate Account Status
          </Button>
        </div>
      </div>

      {/* 2. Top Customer Profile Card */}
      <Card className="border-border/70 bg-card shadow-2xs overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Avatar & Profile Details */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-border shadow-xs">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={customerName} />}
                <AvatarFallback className="text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {customerName}
                  </h2>
                  <CustomerTierBadge tier={summary.tier} />
                  <StatusBadge status={profile.status.toLowerCase()} showDot />
                  <CustomerRiskBadge
                    score={summary.riskScore}
                    level={summary.riskLevel}
                    actionNeeded={summary.actionNeeded}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5 text-primary" />
                    <span>{profile.email}</span>
                    {profile.emailVerified && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 text-emerald-600 border-emerald-300">
                        Verified
                      </Badge>
                    )}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="size-3.5 text-primary" />
                      <span>{profile.phone}</span>
                      {profile.phoneVerified && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1 text-emerald-600 border-emerald-300">
                          Verified
                        </Badge>
                      )}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="size-3.5" />
                    <span>Member since {formatTimestamp(profile.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Engagement Counters */}
            <div className="flex items-center gap-4 border-t border-border/60 pt-3 lg:border-t-0 lg:pt-0">
              <div className="rounded-lg bg-muted/40 p-3 text-center min-w-[100px] border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground uppercase font-semibold">
                  <ShoppingCart className="size-3 text-primary" />
                  <span>Cart Items</span>
                </div>
                <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                  {engagement.activeCartItemsCount}
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-center min-w-[100px] border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground uppercase font-semibold">
                  <Heart className="size-3 text-rose-500" />
                  <span>Wishlist</span>
                </div>
                <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                  {engagement.wishlistItemsCount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Financial & Risk Metrics Grid */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Lifetime Non-Cancelled Spend",
            value: formatCurrency(summary.totalSpend),
            colorTheme: "indigo",
            icon: DollarSign,
            footnote: `${summary.tier} VIP loyalty tier`,
          },
          {
            title: "Completed Orders",
            value: `${summary.completedOrders} / ${summary.totalOrders}`,
            colorTheme: "emerald",
            icon: ShoppingBag,
            footnote: `${summary.cancelledOrders} cancelled / refunded`,
          },
          {
            title: "Average Order Value (AOV)",
            value: formatCurrency(summary.averageOrderValue),
            colorTheme: "cyan",
            icon: CreditCard,
            footnote: "Calculated from completed checkouts",
          },
          {
            title: "Fraud & Cancellation Risk",
            value: `${summary.riskScore} / 100`,
            colorTheme: summary.riskScore >= 70 ? "rose" : summary.riskScore >= 35 ? "amber" : "emerald",
            icon: ShieldAlert,
            badge: {
              text: summary.riskLevel,
              variant: summary.riskScore >= 70 ? "destructive" : "warning",
            },
            footnote: summary.actionNeeded ? "Manual operator review required" : "Account in good standing",
          },
        ]}
      />

      {/* 4. Tabbed Subsystems */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="orders" className="text-xs gap-1.5 font-medium">
            <ShoppingBag className="size-3.5" />
            <span>Order History ({recentOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="text-xs gap-1.5 font-medium">
            <MapPin className="size-3.5" />
            <span>Shipping Addresses ({addresses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs gap-1.5 font-medium">
            <Star className="size-3.5 text-amber-500" />
            <span>Reviews ({recentReviews.length})</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs gap-1.5 font-medium">
            <Laptop className="size-3.5" />
            <span>Active Login Sessions ({activeSessions.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Order History */}
        <TabsContent value="orders">
          <Card className="border-border/70 bg-card shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold tracking-tight">
                Customer Purchase Ledger
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {recentOrders.length === 0 ? (
                <EmptyState
                  title="No Orders Found"
                  description="This customer has not placed any orders yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 text-xs">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-foreground">ORDER NUMBER</TableHead>
                        <TableHead className="font-semibold text-foreground">PLACED AT</TableHead>
                        <TableHead className="font-semibold text-foreground">ITEMS</TableHead>
                        <TableHead className="font-semibold text-foreground">STATUS</TableHead>
                        <TableHead className="font-semibold text-right text-foreground">GRAND TOTAL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {recentOrders.map((ord) => (
                        <TableRow key={ord.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-mono font-bold text-primary">
                            <Link href="/orders" className="hover:underline flex items-center gap-1">
                              <span>{ord.orderNumber}</span>
                              <ExternalLink className="size-3" />
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px]">
                            {formatTimestamp(ord.createdAt)}
                          </TableCell>
                          <TableCell>
                            {ord.items && ord.items.length > 0 ? (
                              <div className="space-y-0.5">
                                {ord.items.map((item, idx) => (
                                  <p key={idx} className="line-clamp-1 text-foreground font-medium">
                                    {item.quantity}x {item.productName}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <span>{ord.itemCount} items</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={ord.status.toLowerCase()} showDot />
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-foreground">
                            {formatCurrency(ord.grandTotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Saved Shipping Addresses */}
        <TabsContent value="addresses">
          {addresses.length === 0 ? (
            <EmptyState
              title="No Saved Addresses"
              description="This customer does not have any saved shipping destinations on file."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-xl border border-border/70 bg-card p-4 space-y-2 shadow-2xs text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-foreground border-b border-border/60 pb-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      <span>{addr.recipientName}</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {addr.country}
                    </Badge>
                  </div>
                  <div className="space-y-0.5 text-muted-foreground">
                    <p>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Reviews & Feedback */}
        <TabsContent value="reviews">
          {recentReviews.length === 0 ? (
            <EmptyState
              title="No Product Reviews"
              description="This customer has not submitted any product feedback yet."
            />
          ) : (
            <div className="space-y-3">
              {recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl border border-border/70 bg-card p-4 space-y-2 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {rev.product?.name || "Product"}
                      </p>
                      <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-bold ml-1 text-foreground">
                          {rev.rating}/5
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {rev.status}
                    </Badge>
                  </div>

                  {rev.title && (
                    <p className="font-semibold text-foreground">{rev.title}</p>
                  )}
                  {rev.comment && (
                    <p className="text-muted-foreground leading-relaxed">{rev.comment}</p>
                  )}
                  <p className="text-[10.5px] font-mono text-muted-foreground/60">
                    Posted on {formatTimestamp(rev.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Active Login Sessions */}
        <TabsContent value="sessions">
          <Card className="border-border/70 bg-card shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold tracking-tight">
                Active Authenticated Devices & Security Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {activeSessions.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No active login sessions on file.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 text-xs">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-foreground">IP ADDRESS</TableHead>
                        <TableHead className="font-semibold text-foreground">DEVICE / USER AGENT</TableHead>
                        <TableHead className="font-semibold text-foreground">LAST USED</TableHead>
                        <TableHead className="font-semibold text-foreground">EXPIRES</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {activeSessions.map((sess) => (
                        <TableRow key={sess.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-mono font-semibold text-foreground">
                            {sess.ipAddress}
                          </TableCell>
                          <TableCell className="max-w-md truncate text-muted-foreground font-mono text-[11px]">
                            {sess.userAgent}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                            {formatTimestamp(sess.lastUsedAt || sess.createdAt)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                            {formatTimestamp(sess.expiresAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeSession(sess.id)}
                              disabled={revokeSessionMutation.isPending}
                              className="h-7 px-2 text-[11px] text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1"
                              title="Forcibly terminate session"
                            >
                              <Trash2 className="size-3" />
                              <span>Revoke</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CustomerStatusDialog
        customer={customerAdapter}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={() => refetch()}
      />

      <EditCustomerDialog
        customer={customerAdapter}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
