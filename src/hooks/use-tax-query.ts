/**
 * @file use-tax-query.ts
 * @description React Query hooks for the Meeo GST Tax Engine.
 * Caches rules, classifications, seller profiles, and handles mutations for
 * drafting, dual-authorization approval, publication, retirement, and seeding.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { taxService } from "@/services/tax.service"
import type {
  TaxRulesQueryParams,
  TaxClassificationsQueryParams,
  CreateTaxRulePayload,
  ApproveTaxRulePayload,
  RetireTaxRulePayload,
  CreateTaxClassificationPayload,
  UpdateClassificationStatusPayload,
  UpsertSellerProfilePayload,
  TaxQuotePayload,
  TaxRule,
  TaxClassification,
} from "@/types/tax"

export const TAX_QUERY_KEYS = {
  all: ["tax"] as const,
  rules: (params?: TaxRulesQueryParams) =>
    [...TAX_QUERY_KEYS.all, "rules", params] as const,
  ruleAudits: (id: string) =>
    [...TAX_QUERY_KEYS.all, "ruleAudits", id] as const,
  classifications: (params?: TaxClassificationsQueryParams) =>
    [...TAX_QUERY_KEYS.all, "classifications", params] as const,
  sellers: () => [...TAX_QUERY_KEYS.all, "sellers"] as const,
}

/**
 * 1. Hook to fetch statutory tax rules with pagination and filters
 */
export function useTaxRulesQuery(
  params?: TaxRulesQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.rules(params),
    queryFn: async () => {
      const res: any = await taxService.listRules(params)
      // Normalize rules payload
      let rules: TaxRule[] = []
      let total = 0

      if (Array.isArray(res?.data?.rules)) {
        rules = res.data.rules
        total = res.data.total ?? rules.length
      } else if (Array.isArray(res?.data)) {
        rules = res.data
        total = res?.meta?.total ?? rules.length
      } else if (Array.isArray(res?.rules)) {
        rules = res.rules
        total = res.total ?? rules.length
      }

      return { rules, total }
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * 2. Hook to fetch audit trail for a statutory rule
 */
export function useTaxRuleAuditsQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.ruleAudits(id),
    queryFn: async () => {
      if (!id) return []
      const res = await taxService.getRuleAudits(id)
      return res.data ?? []
    },
    enabled: Boolean(id) && enabled,
  })
}

/**
 * 3. Hook to fetch HSN/SAC classifications
 */
export function useTaxClassificationsQuery(
  params?: TaxClassificationsQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.classifications(params),
    queryFn: async () => {
      const res: any = await taxService.listClassifications(params)
      let classifications: TaxClassification[] = []
      let total = 0

      if (Array.isArray(res?.data?.classifications)) {
        classifications = res.data.classifications
        total = res.data.total ?? classifications.length
      } else if (Array.isArray(res?.data)) {
        classifications = res.data
        total = res?.meta?.total ?? classifications.length
      } else if (Array.isArray(res?.classifications)) {
        classifications = res.classifications
        total = res.total ?? classifications.length
      }

      return { classifications, total }
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * 4. Hook to fetch Seller Tax Profiles
 */
export function useSellerProfilesQuery() {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.sellers(),
    queryFn: async () => {
      const res = await taxService.listSellerProfiles()
      return res.data ?? []
    },
  })
}

/**
 * 5. Mutations for Tax Rule Lifecycle
 */
export function useCreateTaxRuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaxRulePayload) =>
      taxService.createDraftRule(payload),
    onSuccess: () => {
      toast.success("Draft GST rule created successfully")
      queryClient.invalidateQueries({ queryKey: [...TAX_QUERY_KEYS.all, "rules"] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to create draft rule"
      toast.error(msg)
    },
  })
}

export function useApproveTaxRuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApproveTaxRulePayload }) =>
      taxService.approveRule(id, payload),
    onSuccess: () => {
      toast.success("Tax rule independently approved with gazette verification")
      queryClient.invalidateQueries({ queryKey: [...TAX_QUERY_KEYS.all, "rules"] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to approve rule"
      toast.error(msg)
    },
  })
}

export function usePublishTaxRuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => taxService.publishRule(id),
    onSuccess: () => {
      toast.success("Statutory tax rule published / scheduled successfully")
      queryClient.invalidateQueries({ queryKey: [...TAX_QUERY_KEYS.all, "rules"] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to publish rule"
      toast.error(msg)
    },
  })
}

export function useRetireTaxRuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: RetireTaxRulePayload }) =>
      taxService.retireRule(id, payload),
    onSuccess: () => {
      toast.success("Statutory rule retired safely")
      queryClient.invalidateQueries({ queryKey: [...TAX_QUERY_KEYS.all, "rules"] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to retire rule"
      toast.error(msg)
    },
  })
}

/**
 * 6. Mutations for Classifications
 */
export function useCreateTaxClassificationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaxClassificationPayload) =>
      taxService.createClassification(payload),
    onSuccess: () => {
      toast.success("HSN/SAC classification registered")
      queryClient.invalidateQueries({
        queryKey: [...TAX_QUERY_KEYS.all, "classifications"],
      })
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "Failed to create classification"
      toast.error(msg)
    },
  })
}

export function useUpdateClassificationStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateClassificationStatusPayload
    }) => taxService.updateClassificationStatus(id, payload),
    onSuccess: () => {
      toast.success("Classification verification status updated")
      queryClient.invalidateQueries({
        queryKey: [...TAX_QUERY_KEYS.all, "classifications"],
      })
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update verification status"
      toast.error(msg)
    },
  })
}

/**
 * 7. Seed Standard Rules Mutation
 */
export function useSeedStandardRulesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => taxService.seedStandardRules(),
    onSuccess: (data) => {
      toast.success(data?.data?.message || "Standard CBIC GST rules and seller seeded")
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.all })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to seed rules"
      toast.error(msg)
    },
  })
}

/**
 * 8. Seller Profile Mutation
 */
export function useUpsertSellerProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertSellerProfilePayload) =>
      taxService.upsertSellerProfile(payload),
    onSuccess: () => {
      toast.success("Seller GSTIN tax profile updated successfully")
      queryClient.invalidateQueries({ queryKey: [...TAX_QUERY_KEYS.all, "sellers"] })
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "Failed to update seller profile"
      toast.error(msg)
    },
  })
}

/**
 * 9. Live Quote Calculation Mutation
 */
export function useTaxQuoteMutation() {
  return useMutation({
    mutationFn: (payload: TaxQuotePayload) => taxService.calculateQuote(payload),
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "Failed to calculate tax quote"
      toast.error(msg)
    },
  })
}
