/**
 * @file account-security-dialog.tsx
 * @description Account Security & IAM Management Dialog.
 * Allows operators to manage connected auth providers (Password, Google),
 * set/change passwords, link/unlink accounts, and review/revoke active sessions.
 */

"use client"

import * as React from "react"
import {
  Shield,
  Key,
  Lock,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  LogOut,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GoogleIcon } from "@/utils/icons/GoogleIcon"
import { useGoogleLogin } from "@react-oauth/google"
import {
  useAuthAccountsQuery,
  useSetPasswordMutation,
  useChangePasswordMutation,
  useLinkGoogleMutation,
  useUnlinkProviderMutation,
  useCurrentUserSessionsQuery,
  useRevokeCurrentUserSessionMutation,
  useRevokeAllCurrentUserSessionsMutation,
} from "@/hooks/use-auth-query"
import { useUserStore } from "@/store/user.store"
import { getApiErrorMessage } from "@/lib/utils"
import { toast } from "sonner"
import type { AuthProviderType } from "@/types/auth"

export interface AccountSecurityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: "providers" | "password" | "sessions"
}

export function AccountSecurityDialog({
  open,
  onOpenChange,
  initialTab = "providers",
}: AccountSecurityDialogProps) {
  const [activeTab, setActiveTab] = React.useState<string>(initialTab)
  const { user } = useUserStore()

  // Queries
  const {
    data: accounts = [],
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
  } = useAuthAccountsQuery(open)

  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useCurrentUserSessionsQuery(open)

  // Mutations
  const setPasswordMutation = useSetPasswordMutation()
  const changePasswordMutation = useChangePasswordMutation()
  const linkGoogleMutation = useLinkGoogleMutation()
  const unlinkProviderMutation = useUnlinkProviderMutation()
  const revokeSessionMutation = useRevokeCurrentUserSessionMutation()
  const revokeAllSessionsMutation = useRevokeAllCurrentUserSessionsMutation()

  // Form states: Set Password
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showNewPassword, setShowNewPassword] = React.useState(false)

  // Form states: Change Password
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [changeNewPassword, setChangeNewPassword] = React.useState("")
  const [changeConfirmPassword, setChangeConfirmPassword] = React.useState("")
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showChangeNewPassword, setShowChangeNewPassword] = React.useState(false)

  // Provider states
  const hasPassword = accounts.some((a) => a.provider === "PASSWORD")
  const hasGoogle = accounts.some((a) => a.provider === "GOOGLE")
  const totalMethods = accounts.length

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
      refetchAccounts()
      refetchSessions()
    }
  }, [open, initialTab, refetchAccounts, refetchSessions])

  // Google Link Flow
  const triggerGoogleLink = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // In @react-oauth/google, useGoogleLogin without flow: 'auth-code' provides access_token or tokenResponse
      // For ID token, we can pass to linkGoogle mutation
      if (tokenResponse.access_token) {
        // If server accepts access token or id_token
        linkGoogleMutation.mutate(
          { idToken: tokenResponse.access_token },
          {
            onSuccess: (res: any) => {
              if (res?.success !== false) {
                toast.success("Google account linked successfully!")
                refetchAccounts()
              } else {
                toast.error(res?.message || "Failed to link Google account")
              }
            },
            onError: (err) => {
              toast.error(getApiErrorMessage(err, "Failed to link Google account"))
            },
          }
        )
      }
    },
    onError: () => {
      toast.error("Google linking was cancelled or failed")
    },
  })

  // Handle Set Password
  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setPasswordMutation.mutate(
      { password: newPassword },
      {
        onSuccess: (res: any) => {
          if (res?.success !== false) {
            toast.success("Password set successfully! You can now log in with email and password.")
            setNewPassword("")
            setConfirmPassword("")
            setActiveTab("providers")
            refetchAccounts()
          } else {
            toast.error(res?.message || "Failed to set password")
          }
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, "Failed to set password"))
        },
      }
    )
  }

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    if (changeNewPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }
    if (changeNewPassword !== changeConfirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword: changeNewPassword,
      },
      {
        onSuccess: (res: any) => {
          if (res?.success !== false) {
            toast.success("Password updated successfully! Other concurrent sessions have been revoked.")
            setCurrentPassword("")
            setChangeNewPassword("")
            setChangeConfirmPassword("")
            setActiveTab("providers")
            refetchAccounts()
            refetchSessions()
          } else {
            toast.error(res?.message || "Failed to change password")
          }
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, "Failed to change password"))
        },
      }
    )
  }

  // Handle Unlink Provider
  const handleUnlink = (provider: AuthProviderType) => {
    if (totalMethods <= 1) {
      toast.error("Security Rule: You cannot remove your only authentication method.")
      return
    }

    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) {
      return
    }

    unlinkProviderMutation.mutate(provider, {
      onSuccess: (res: any) => {
        if (res?.success !== false) {
          toast.success(`${provider} authentication method removed successfully`)
          refetchAccounts()
        } else {
          toast.error(res?.message || `Failed to unlink ${provider}`)
        }
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, `Failed to unlink ${provider}`))
      },
    })
  }

  // Handle Revoke Session
  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        toast.success("Session revoked successfully")
        refetchSessions()
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "Failed to revoke session"))
      },
    })
  }

  // Handle Revoke All Sessions
  const handleRevokeAll = () => {
    if (!confirm("This will log you out from all other connected devices. Continue?")) {
      return
    }
    revokeAllSessionsMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("All other sessions revoked successfully")
        refetchSessions()
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "Failed to revoke sessions"))
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background text-foreground border-border/80 shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Shield className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Account Security & Sign-In Methods
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage your credentials, connected identity providers, and active device sessions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full h-9 bg-muted/60 p-1">
              <TabsTrigger value="providers" className="text-xs gap-1.5">
                <Key className="size-3.5" />
                <span>Connected Accounts</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="text-xs gap-1.5">
                <Lock className="size-3.5" />
                <span>{hasPassword ? "Change Password" : "Set Password"}</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="text-xs gap-1.5">
                <Smartphone className="size-3.5" />
                <span>Active Sessions</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Connected Providers */}
            <TabsContent value="providers" className="space-y-3 focus:outline-hidden">
              <div className="rounded-lg border border-border/70 bg-card p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Sign-In Providers</span>
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {totalMethods} {totalMethods === 1 ? "Method" : "Methods"} Active
                  </Badge>
                </div>

                {isLoadingAccounts ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Password Provider Card */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Lock className="size-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">Password</span>
                            {hasPassword ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] py-0">
                                Not Configured
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {hasPassword
                              ? "Secured with Argon2id cryptographic hashing"
                              : "No password configured yet (Google SSO only)"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasPassword ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setActiveTab("password")}
                            >
                              Change
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={totalMethods <= 1 || unlinkProviderMutation.isPending}
                              title={
                                totalMethods <= 1
                                  ? "Cannot unlink your only authentication method"
                                  : "Unlink password"
                              }
                              onClick={() => handleUnlink("PASSWORD")}
                              className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
                            >
                              Unlink
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                            onClick={() => setActiveTab("password")}
                          >
                            <Plus className="size-3.5" />
                            <span>Add Password</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Google Provider Card */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <GoogleIcon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">Google OAuth</span>
                            {hasGoogle ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0">
                                Connected
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px] py-0">
                                Not Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {hasGoogle
                              ? `Linked to ${user?.email || "Google Account"}`
                              : "Sign in instantly with your Google Workspace or Gmail account"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasGoogle ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={totalMethods <= 1 || unlinkProviderMutation.isPending}
                            title={
                              totalMethods <= 1
                                ? "Cannot unlink your only authentication method"
                                : "Unlink Google"
                            }
                            onClick={() => handleUnlink("GOOGLE")}
                            className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
                          >
                            Unlink
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => triggerGoogleLink()}
                            disabled={linkGoogleMutation.isPending}
                            className="text-xs h-8 gap-1.5"
                          >
                            {linkGoogleMutation.isPending ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <GoogleIcon size={14} />
                            )}
                            <span>Connect Google</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {totalMethods === 1 && (
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px]">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    <span>
                      Security Safety Rule: You must have at least one active sign-in method. You
                      cannot unlink a provider when only 1 method remains.
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Set / Change Password */}
            <TabsContent value="password" className="focus:outline-hidden">
              <div className="rounded-lg border border-border/70 bg-card p-4 space-y-4">
                {hasPassword ? (
                  /* Change Password Form */
                  <form onSubmit={handleChangePassword} className="space-y-3.5">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Change Account Password</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Updating your password will automatically terminate other active sessions.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-9 w-full rounded-md border border-border/80 bg-background px-3 pr-9 text-xs focus:border-indigo-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">New Password</label>
                      <div className="relative">
                        <input
                          type={showChangeNewPassword ? "text" : "password"}
                          required
                          value={changeNewPassword}
                          onChange={(e) => setChangeNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="h-9 w-full rounded-md border border-border/80 bg-background px-3 pr-9 text-xs focus:border-indigo-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowChangeNewPassword(!showChangeNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showChangeNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={changeConfirmPassword}
                        onChange={(e) => setChangeConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="h-9 w-full rounded-md border border-border/80 bg-background px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("providers")}
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={changePasswordMutation.isPending}
                        className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                      >
                        {changePasswordMutation.isPending && (
                          <Loader2 className="size-3.5 animate-spin" />
                        )}
                        <span>Update Password</span>
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Set Password Form (for Google OAuth users) */
                  <form onSubmit={handleSetPassword} className="space-y-3.5">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Add Password Sign-In</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Create a secure password so you can sign in with your email directly.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="h-9 w-full rounded-md border border-border/80 bg-background px-3 pr-9 text-xs focus:border-indigo-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Confirm Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="h-9 w-full rounded-md border border-border/80 bg-background px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("providers")}
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={setPasswordMutation.isPending}
                        className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                      >
                        {setPasswordMutation.isPending && (
                          <Loader2 className="size-3.5 animate-spin" />
                        )}
                        <span>Set Password</span>
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Active Device Sessions */}
            <TabsContent value="sessions" className="space-y-3 focus:outline-hidden">
              <div className="rounded-lg border border-border/70 bg-card p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Active Sessions</span>
                    <p className="text-[11px] text-muted-foreground">
                      Devices currently authorized to access your account.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refetchSessions()}
                      disabled={isLoadingSessions}
                      className="text-xs h-7 gap-1"
                    >
                      <RefreshCw className={isLoadingSessions ? "size-3 animate-spin" : "size-3"} />
                      <span>Refresh</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRevokeAll}
                      disabled={revokeAllSessionsMutation.isPending || sessions.length <= 1}
                      className="text-xs h-7 gap-1"
                    >
                      <LogOut className="size-3" />
                      <span>Revoke All Others</span>
                    </Button>
                  </div>
                </div>

                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No active sessions found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {sessions.map((sess) => {
                      const isCurrent = sess.isCurrent || false
                      return (
                        <div
                          key={sess.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              {sess.deviceName?.toLowerCase().includes("mobile") ||
                              sess.userAgent?.toLowerCase().includes("mobile") ? (
                                <Smartphone className="size-4" />
                              ) : (
                                <Laptop className="size-4" />
                              )}
                            </div>
                            <div className="leading-tight">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-foreground">
                                  {sess.deviceName || "Web Browser"}
                                </span>
                                {isCurrent && (
                                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[9px] py-0">
                                    Current Device
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                {sess.ipAddress && <span>IP: {sess.ipAddress}</span>}
                                {sess.lastUsedAt && (
                                  <span>Active: {new Date(sess.lastUsedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {!isCurrent && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={revokeSessionMutation.isPending}
                              onClick={() => handleRevokeSession(sess.id)}
                              className="text-xs h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
