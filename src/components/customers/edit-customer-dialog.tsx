/**
 * @file edit-customer-dialog.tsx
 * @description Modal dialog for updating customer first and last names.
 */

"use client"

import * as React from "react"
import { UserCog, Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUpdateCustomerProfileMutation } from "@/hooks/use-customer-query"
import type { AdminCustomer } from "@/types/customer"

export interface EditCustomerDialogProps {
  customer: AdminCustomer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: EditCustomerDialogProps) {
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const updateProfileMutation = useUpdateCustomerProfileMutation()

  React.useEffect(() => {
    if (open && customer) {
      setFirstName(customer.firstName || "")
      setLastName(customer.lastName || "")
      setError(null)
    }
  }, [open, customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer?.id) {
      setError("No customer selected.")
      return
    }

    try {
      setError(null)
      await updateProfileMutation.mutateAsync({
        userId: customer.id,
        payload: {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile."
      setError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <UserCog className="size-5" />
              <DialogTitle>Edit Customer Profile</DialogTitle>
            </div>
            <DialogDescription>
              Update name details for account <span className="font-mono">{customer?.email}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  First Name
                </label>
                <Input
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Last Name
                </label>
                <Input
                  placeholder="e.g. Connor"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 font-medium"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <UserCog className="size-3.5" />
                  <span>Update Profile</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
