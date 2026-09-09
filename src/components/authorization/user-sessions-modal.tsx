/**
 * @file user-sessions-modal.tsx
 * @description Modal dialog listing active login sessions for an operator with emergency revocation.
 */

"use client"

import * as React from "react"
import { Globe, Laptop, Ban } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useUserSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllUserSessionsMutation,
} from "@/hooks/use-authorization-query"

import type { AdminCustomer } from "@/types/customer"

export interface UserSessionsModalProps {
  user: AdminCustomer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserSessionsModal({
  user,
  open,
  onOpenChange,
}: UserSessionsModalProps) {
  const userId = user?.id || ""
  const { data: sessions, isLoading } = useUserSessionsQuery(userId, open)
  const revokeMutation = useRevokeSessionMutation()
  const revokeAllMutation = useRevokeAllUserSessionsMutation()

  const [revokingId, setRevokingId] = React.useState<string | null>(null)
  const [isRevokingAll, setIsRevokingAll] = React.useState(false)

  const userName = user
    ? user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.email
    : "Operator"

  const handleRevoke = async (sessionId: string) => {
    try {
      setRevokingId(sessionId)
      await revokeMutation.mutateAsync({ userId, sessionId })
    } finally {
      setRevokingId(null)
    }
  }

  const handleRevokeAll = async () => {
    try {
      setIsRevokingAll(true)
      await revokeAllMutation.mutateAsync(userId)
    } finally {
      setIsRevokingAll(false)
    }
  }

  const sessionList = sessions ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <Laptop className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Active Login Sessions
              </DialogTitle>
              <DialogDescription className="text-xs">
                Device sessions for{" "}
                <span className="font-semibold text-foreground">
                  {userName}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sessionList.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No active login sessions detected for this account.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sessionList.map((sess) => {
                const isThisRevoking = revokingId === sess.id

                return (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Globe className="size-3.5 text-primary" />
                        <span className="font-mono font-semibold text-foreground">
                          {sess.ipAddress || "Unknown IP"}
                        </span>
                        {sess.isCurrent && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 text-emerald-600 border-emerald-500/30"
                          >
                            Current Device
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-[10.5px] text-muted-foreground truncate max-w-[260px]">
                        {sess.userAgent || "Desktop Browser"}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        Issued: {new Date(sess.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isThisRevoking || isRevokingAll}
                      onClick={() => handleRevoke(sess.id)}
                      className="h-7 px-2 text-[11px] border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-950/30 shrink-0"
                    >
                      <Ban className="mr-1 size-3" />
                      {isThisRevoking ? "Revoking..." : "Revoke"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {sessionList.length > 0 ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isRevokingAll}
              onClick={handleRevokeAll}
              className="text-xs h-8"
            >
              <Ban className="mr-1.5 size-3.5" />
              <span>{isRevokingAll ? "Revoking All..." : "Revoke All Sessions"}</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

