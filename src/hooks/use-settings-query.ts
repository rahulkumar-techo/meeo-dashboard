/**
 * @file use-settings-query.ts
 * @description TanStack React Query hooks for Platform System Settings & Governance.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsService } from "@/services/settings.service"
import type {
  UpdateSystemSettingsPayload,
  EmergencyKillSwitchPayload,
} from "@/types/settings"

export const SETTINGS_QUERY_KEYS = {
  all: ["settings"] as const,
  current: () => [...SETTINGS_QUERY_KEYS.all, "current"] as const,
}

/**
 * Hook to retrieve full platform system settings
 */
export function useSettingsQuery() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.current(),
    queryFn: async () => {
      const res = await settingsService.getSettings()
      return res.data
    },
    staleTime: 30 * 1000, // 30s cache
  })
}

/**
 * Hook to update system settings
 */
export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSystemSettingsPayload) =>
      settingsService.updateSettings(payload),
    onSuccess: (res) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.current(), (old: any) => {
        if (!old) return res.data
        return {
          ...old,
          ...res.data,
        }
      })
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.current() })
    },
  })
}

/**
 * Hook to engage or disengage emergency kill switch
 */
export function useEmergencyKillSwitchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EmergencyKillSwitchPayload) =>
      settingsService.toggleEmergencyKillSwitch(payload),
    onSuccess: (res) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.current(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          ...res.data,
        }
      })
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.current() })
    },
  })
}
