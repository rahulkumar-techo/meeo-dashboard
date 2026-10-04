/**
 * @file customer-360-view.tsx
 * @description Comprehensive 360-degree Customer Intelligence Dashboard showcasing profile demographics, commerce, engagements, behavioural telemetry, conversion insights, and live activity timeline.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  ShieldAlert,
  UserCog,
  RefreshCw,
  Search,
  Users,
  ShoppingBag,
  IndianRupee,
  Activity,
  Sparkles,
  Heart,
  TrendingUp,
  CreditCard,
  UserCheck,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MetricGrid, StatusBadge, EmptyState } from "@/components/common"
import { CustomerTierBadge } from "./customer-tier-badge"
import { CustomerRiskBadge } from "./customer-risk-badge"
import { CustomerStatusDialog } from "./customer-status-dialog"
import { EditCustomerDialog } from "./edit-customer-dialog"
import { Customer360ProfileTab } from "./customer-360-profile-tab"
import { Customer360CommerceTab } from "./customer-360-commerce-tab"
import { Customer360EngagementTab } from "./customer-360-engagement-tab"
import { Customer360BehaviourTab } from "./customer-360-behaviour-tab"
import { Customer360InsightsTab } from "./customer-360-insights-tab"
import { Customer360ActivityTab } from "./customer-360-activity-tab"
import { Customer360OverviewChart } from "./customer-360-overview-chart"
import { useUser360Query } from "@/hooks/use-tracking"
import {
  useCustomer360Query,
  useCustomersQuery,
  useRevokeCustomerSessionMutation,
} from "@/hooks/use-customer-query"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { AdminCustomer } from "@/types/customer"
import type { User360Profile } from "@/types/tracking"

interface Customer360ViewProps {
  userId: string
  onSelectCustomer?: (newUserId: string) => void
  showBackToDirectory?: boolean
}

export function Customer360View({
  userId,
  onSelectCustomer,
  showBackToDirectory = true,
}: Customer360ViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("profile")
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  // 1. Fetch from new Tracking User 360 endpoint
  const {
    data: tracking360,
    isLoading: isTrackingLoading,
    refetch: refetchTracking,
  } = useUser360Query(userId)

  // 2. Fetch cross-module Customer 360 intelligence (addresses, sessions, engagement)
  const {
    data: customer360,
    isLoading: isCustomerLoading,
    refetch: refetchCustomer,
  } = useCustomer360Query(userId)

  // 3. Quick customer switcher list
  const { data: customerList } = useCustomersQuery({ limit: 40 })

  const revokeSessionMutation = useRevokeCustomerSessionMutation()

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync({ userId, sessionId })
      refetchCustomer()
      refetchTracking()
    } catch (err) {
      console.error("Failed to revoke session", err)
    }
  }

  const handleRefreshAll = () => {
    refetchTracking()
    refetchCustomer()
  }

  const handleSelectNewCustomer = (newId: string) => {
    if (onSelectCustomer) {
      onSelectCustomer(newId)
    } else {
      router.push(`/customers/${newId}`)
    }
  }

  const isLoading = (isTrackingLoading || isCustomerLoading) && !tracking360 && !customer360

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-foreground">Loading 360° Customer Intelligence...</p>
          <p className="text-xs text-muted-foreground">
            Aggregating commerce orders, browsing telemetry, and conversion insights
          </p>
        </div>
      </div>
    )
  }

  // Gracefully merge tracking & customer data
  const profile: User360Profile | undefined =
    tracking360?.profile ||
    (customer360?.profile
      ? {
          id: customer360.profile.id,
          firstName: customer360.profile.firstName,
          lastName: customer360.profile.lastName,
          email: customer360.profile.email,
          phone: customer360.profile.phone,
          status: customer360.profile.status,
          createdAt: customer360.profile.createdAt,
          lastLoginAt: customer360.profile.lastLoginAt,
        }
      : undefined)
  const commerce = tracking360?.commerce || {
    totalSpend: customer360?.summary?.totalSpend ?? 0,
    totalOrders: customer360?.summary?.totalOrders ?? 0,
    completedOrders: customer360?.summary?.completedOrders ?? 0,
    cancelledOrders: customer360?.summary?.cancelledOrders ?? 0,
    averageOrderValue: customer360?.summary?.averageOrderValue ?? 0,
    firstOrderAt: null,
    lastOrderAt: null,
  }
  const behavior = tracking360?.behavior
  const insights = tracking360?.insights
  const recentOrders = tracking360?.recentOrders || customer360?.recentOrders || []
  const recentActivity = tracking360?.recentActivity || []
  const engagement = customer360?.engagement || {
    totalReviews: customer360?.recentReviews?.length ?? 0,
    averageRatingGiven: 0,
    activeCartItemsCount: behavior?.cartAdds ? Math.max(0, behavior.cartAdds - (behavior?.cartRemoves ?? 0)) : 0,
    wishlistItemsCount: 0,
  }
  const addresses = customer360?.addresses || []
  const activeSessions = customer360?.activeSessions || []
  const recentReviews = customer360?.recentReviews || []
  const summary = customer360?.summary || {
    tier: "BRONZE" as const,
    totalSpend: commerce.totalSpend,
    totalOrders: commerce.totalOrders,
    completedOrders: commerce.completedOrders,
    cancelledOrders: commerce.cancelledOrders,
    averageOrderValue: commerce.averageOrderValue,
    riskScore: 10,
    riskLevel: "LOW" as const,
    riskFlag: false,
    actionNeeded: false,
  }

  if (!profile) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto space-y-4">
        {showBackToDirectory && (
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to Customer Directory
          </Link>
        )}
        <EmptyState
          title="Customer Profile Not Found"
          description={`No customer telemetry or profile was found matching ID: ${userId}`}
          actionLabel="Return to Customer Directory"
          onAction={() => router.push("/customers")}
        />
      </div>
    )
  }

  const customerName =
    profile.firstName || profile.lastName
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : "Verified Customer"

  const initials =
    customerName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU"

  // AdminCustomer adapter for dialogs
  const customerAdapter: AdminCustomer = {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    avatarUrl: null,
    status: (profile.status as any) || "ACTIVE",
    emailVerified: false,
    phoneVerified: false,
    lastLoginAt: profile.lastLoginAt,
    createdAt: profile.createdAt,
    roles: ["CUSTOMER"],
    totalOrders: commerce.totalOrders,
    totalSpend: commerce.totalSpend,
    tier: summary.tier,
    riskScore: summary.riskScore,
    riskLevel: summary.riskLevel,
    riskFlag: summary.riskFlag,
    actionNeeded: summary.actionNeeded,
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showBackToDirectory && (
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border/60 rounded-md px-2.5 py-1.5 bg-card hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Directory
            </Link>
          )}

          {/* Quick Customer Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors shadow-2xs">
              <Users className="size-3.5 text-primary" />
              <span className="truncate max-w-[180px]">Switch Customer</span>
              <ChevronDown className="size-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 max-h-80 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-muted-foreground border-b border-border/50">
                Recent Platform Customers
              </div>
              {customerList?.items?.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => handleSelectNewCustomer(c.id)}
                  className="flex items-center justify-between py-2 text-xs cursor-pointer"
                >
                  <div className="truncate">
                    <p className="font-semibold text-foreground truncate">
                      {c.firstName || c.lastName
                        ? `${c.firstName || ""} ${c.lastName || ""}`.trim()
                        : c.email}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">{c.email}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                    {c.tier}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefreshAll}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className="size-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <UserCog className="size-3.5" /> Edit Profile
          </Button>

          <Button
            size="sm"
            onClick={() => setStatusDialogOpen(true)}
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-xs"
          >
            <ShieldAlert className="size-3.5" /> Moderate Status
          </Button>
        </div>
      </div>

      {/* 2. Hero Customer Card */}
      <Card className="border-border/70 bg-card shadow-2xs overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Avatar & Demographics */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-border shadow-xs">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">{customerName}</h1>
                  <CustomerTierBadge tier={summary.tier} />
                  <StatusBadge status={profile.status.toLowerCase()} showDot />
                  <CustomerRiskBadge
                    score={summary.riskScore}
                    level={summary.riskLevel}
                    actionNeeded={summary.actionNeeded}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="size-3.5 text-primary" />
                    <span>{profile.email}</span>
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="size-3.5 text-primary" />
                      <span>{profile.phone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="size-3.5" />
                    <span>Member since {formatDate(profile.createdAt, "short")}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Counters */}
            <div className="flex items-center gap-3 border-t border-border/60 pt-3 lg:border-t-0 lg:pt-0">
              <div className="rounded-lg bg-muted/40 p-2.5 px-4 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground uppercase font-semibold">
                  <IndianRupee className="size-3 text-emerald-500" />
                  <span>Lifetime Spend</span>
                </div>
                <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                  {formatCurrency(commerce.totalSpend, { compact: true })}
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-2.5 px-4 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground uppercase font-semibold">
                  <ShoppingBag className="size-3 text-primary" />
                  <span>Orders</span>
                </div>
                <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                  {commerce.completedOrders} / {commerce.totalOrders}
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-2.5 px-4 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground uppercase font-semibold">
                  <Sparkles className="size-3 text-indigo-500" />
                  <span>Funnel Ctr</span>
                </div>
                <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                  {insights?.funnel?.checkoutToPurchasePercent ?? 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. All-in-One Customer 360 Overview Line Chart */}
      <Customer360OverviewChart
        commerce={commerce}
        behavior={behavior}
        insights={insights}
        recentOrders={recentOrders}
        recentActivity={recentActivity}
        createdAt={profile.createdAt}
      />

      {/* 4. Deep Dive Subsystem Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border/60 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="text-xs gap-1.5 font-medium">
            <UserCheck className="size-3.5" />
            <span>Profile & Demographics</span>
          </TabsTrigger>

          <TabsTrigger value="commerce" className="text-xs gap-1.5 font-medium">
            <CreditCard className="size-3.5" />
            <span>Commerce ({commerce.totalOrders} Orders)</span>
          </TabsTrigger>

          <TabsTrigger value="engagements" className="text-xs gap-1.5 font-medium">
            <Heart className="size-3.5 text-rose-500" />
            <span>Engagements</span>
          </TabsTrigger>

          <TabsTrigger value="behaviour" className="text-xs gap-1.5 font-medium">
            <Activity className="size-3.5 text-indigo-500" />
            <span>Behaviour Telemetry</span>
          </TabsTrigger>

          <TabsTrigger value="insights" className="text-xs gap-1.5 font-medium">
            <TrendingUp className="size-3.5 text-emerald-500" />
            <span>Insights & Funnel</span>
          </TabsTrigger>

          <TabsTrigger value="activity" className="text-xs gap-1.5 font-medium">
            <Clock className="size-3.5 text-amber-500" />
            <span>Activity Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile">
          <Customer360ProfileTab
            profile={profile}
            addresses={addresses}
            activeSessions={activeSessions}
            onRevokeSession={handleRevokeSession}
            isRevokingSession={revokeSessionMutation.isPending}
          />
        </TabsContent>

        {/* Tab 2: Commerce */}
        <TabsContent value="commerce">
          <Customer360CommerceTab commerce={commerce} recentOrders={recentOrders} />
        </TabsContent>

        {/* Tab 3: Engagements */}
        <TabsContent value="engagements">
          <Customer360EngagementTab engagement={engagement} recentReviews={recentReviews} />
        </TabsContent>

        {/* Tab 4: Behaviour */}
        <TabsContent value="behaviour">
          <Customer360BehaviourTab behavior={behavior} />
        </TabsContent>

        {/* Tab 5: Insights */}
        <TabsContent value="insights">
          <Customer360InsightsTab insights={insights} />
        </TabsContent>

        {/* Tab 6: Activity */}
        <TabsContent value="activity">
          <Customer360ActivityTab userId={userId} initialRecentActivity={recentActivity} />
        </TabsContent>
      </Tabs>

      {/* Moderation & Edit Dialogs */}
      <CustomerStatusDialog
        customer={customerAdapter}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={handleRefreshAll}
      />

      <EditCustomerDialog
        customer={customerAdapter}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefreshAll}
      />
    </div>
  )
}
