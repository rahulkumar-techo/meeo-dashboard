/**
 * @file customer-360-profile-tab.tsx
 * @description Profile overview tab displaying customer demographics, contact verification, saved addresses, and active login sessions.
 */

"use client"

import * as React from "react"
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge, EmptyState } from "@/components/common"
import { formatDate } from "@/lib/formatters"
import type { CustomerAddress, CustomerActiveSession } from "@/types/customer"
import type { User360Profile } from "@/types/tracking"

interface Customer360ProfileTabProps {
  profile: User360Profile
  addresses?: CustomerAddress[]
  activeSessions?: CustomerActiveSession[]
  onRevokeSession?: (sessionId: string) => void
  isRevokingSession?: boolean
}

export function Customer360ProfileTab({
  profile,
  addresses = [],
  activeSessions = [],
  onRevokeSession,
  isRevokingSession = false,
}: Customer360ProfileTabProps) {
  const [copiedId, setCopiedId] = React.useState(false)

  const copyUserId = () => {
    if (!profile.id) return
    navigator.clipboard.writeText(profile.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* 1. Account Demographics & Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Account Credentials</span>
              <StatusBadge status={profile.status.toLowerCase()} showDot />
            </CardTitle>
            <CardDescription className="text-xs">
              Primary identification and authentication credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">User ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-foreground font-medium">
                  {profile.id}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyUserId}
                  className="size-6 text-muted-foreground hover:text-foreground"
                  title="Copy User ID"
                >
                  {copiedId ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-medium text-foreground">
                {profile.firstName || profile.lastName
                  ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
                  : "Not provided"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Email Address</span>
              <div className="flex items-center gap-1.5">
                <Mail className="size-3 text-muted-foreground" />
                <span className="font-medium text-foreground">{profile.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">Phone Number</span>
              <div className="flex items-center gap-1.5">
                <Phone className="size-3 text-muted-foreground" />
                <span className="font-medium text-foreground font-mono">
                  {profile.phone || "Not linked"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Registration & Security Timeline</CardTitle>
            <CardDescription className="text-xs">
              Account lifecycle timestamps and security verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Registered On</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Calendar className="size-3 text-muted-foreground" />
                <span>{formatDate(profile.createdAt, "datetime")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Last Session Login</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Clock className="size-3 text-muted-foreground" />
                <span>
                  {profile.lastLoginAt ? formatDate(profile.lastLoginAt, "datetime") : "Never logged in"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Account Status</span>
              <Badge
                variant={profile.status === "ACTIVE" ? "default" : "destructive"}
                className="text-[10px] uppercase font-semibold"
              >
                {profile.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">Security State</span>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="size-3.5" />
                <span>Passkey / Password Secured</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Shipping Addresses */}
      <Card className="border-border/70 bg-card shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <span>Saved Shipping Addresses ({addresses.length})</span>
            </div>
          </CardTitle>
          <CardDescription className="text-xs">
            Delivery destinations verified on past customer purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <EmptyState
              title="No Saved Addresses"
              description="This customer does not have any saved delivery addresses yet."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1.5 text-xs transition-colors hover:border-border"
                >
                  <p className="font-semibold text-foreground">{addr.recipientName}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p className="text-[11px] font-medium text-foreground/80">{addr.country}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Active Login Sessions */}
      <Card className="border-border/70 bg-card shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="size-4 text-primary" />
              <span>Active Device Sessions ({activeSessions.length})</span>
            </div>
          </CardTitle>
          <CardDescription className="text-xs">
            Hardware device tokens and IP sessions currently authenticated for this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <EmptyState
              title="No Active Sessions"
              description="No active device sessions are currently authenticated for this user."
            />
          ) : (
            <div className="divide-y divide-border/50 rounded-lg border border-border/60 bg-muted/10 overflow-hidden">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2.5 text-xs hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {session.userAgent || "Unknown Device Client"}
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px] py-0">
                        {session.ipAddress}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      <span>Last active: {formatDate(session.lastUsedAt, "datetime")}</span>
                      <span>Expires: {formatDate(session.expiresAt, "short")}</span>
                    </div>
                  </div>

                  {onRevokeSession && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevokeSession(session.id)}
                      disabled={isRevokingSession}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs h-7 self-start sm:self-auto gap-1"
                    >
                      <Trash2 className="size-3" />
                      <span>Revoke Session</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
