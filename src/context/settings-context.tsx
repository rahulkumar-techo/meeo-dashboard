/**
 * @file settings-context.tsx
 * @description Centralized React Context for Platform System Settings & Governance.
 * Enables synchronized state between the Dedicated Settings Sidebar and the Settings View.
 */

"use client"

import * as React from "react"
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
  useEmergencyKillSwitchMutation,
} from "@/hooks/use-settings-query"
import type { SystemSettings } from "@/types/settings"

export interface SettingsContextType {
  // Navigation
  activeTab: string
  setActiveTab: (tabId: string, subFieldId?: string) => void
  activeSubField: string | null

  // Live Data & Form State
  formState: SystemSettings | null
  serverSettings: SystemSettings | undefined
  isDirty: boolean
  isLoading: boolean
  isRefetching: boolean
  isSaving: boolean

  // Handlers
  handleFormChange: (updates: Partial<SystemSettings>) => void
  handleSave: (e?: React.FormEvent) => Promise<void>
  handleReset: () => void
  refetch: () => void

  // Operational Status
  isKillSwitchActive: boolean
  isMaintenanceActive: boolean
  isReadOnlyActive: boolean

  // Emergency Modal Controls
  isKillSwitchModalOpen: boolean
  setIsKillSwitchModalOpen: (open: boolean) => void
  handleToggleKillSwitch: (active: boolean, emergencyMessage: string) => Promise<void>

  // Feedback Notification Banner
  banner: { type: "success" | "error"; text: string } | null
  showBanner: (type: "success" | "error", text: string) => void
}

const SettingsContext = React.createContext<SettingsContextType | null>(null)

export function useSettingsContext() {
  const context = React.useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettingsContext must be used within a SettingsProvider")
  }
  return context
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = React.useState<string>("tier1")
  const [activeSubField, setActiveSubField] = React.useState<string | null>(null)
  const [isKillSwitchModalOpen, setIsKillSwitchModalOpen] = React.useState(false)

  // Local form state
  const [formState, setFormState] = React.useState<SystemSettings | null>(null)
  const [isDirty, setIsDirty] = React.useState(false)

  // Feedback notifications
  const [banner, setBanner] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const showBanner = React.useCallback((type: "success" | "error", text: string) => {
    setBanner({ type, text })
    setTimeout(() => {
      setBanner((prev) => (prev?.text === text ? null : prev))
    }, 4500)
  }, [])

  // Backend queries & mutations
  const { data: serverSettings, isLoading, refetch, isRefetching } = useSettingsQuery()
  const updateSettingsMutation = useUpdateSettingsMutation()
  const killSwitchMutation = useEmergencyKillSwitchMutation()

  // Sync server data into form state
  React.useEffect(() => {
    if (serverSettings && !isDirty) {
      setFormState(serverSettings)
    }
  }, [serverSettings, isDirty])

  React.useEffect(() => {
    if (serverSettings && !formState) {
      setFormState(serverSettings)
    }
  }, [serverSettings, formState])

  const setActiveTab = React.useCallback((tabId: string, subFieldId?: string) => {
    setActiveTabState(tabId)
    setActiveSubField(subFieldId || null)

    if (subFieldId && typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById(subFieldId)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          el.classList.add("ring-2", "ring-indigo-500", "transition-all")
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-indigo-500")
          }, 1800)
        }
      }, 100)
    }
  }, [])

  const handleFormChange = React.useCallback((updates: Partial<SystemSettings>) => {
    setFormState((prev) => {
      if (!prev) return null
      return {
        ...prev,
        ...updates,
      }
    })
    setIsDirty(true)
  }, [])

  const handleReset = React.useCallback(() => {
    if (serverSettings) {
      setFormState(serverSettings)
      setIsDirty(false)
      showBanner("success", "Settings reverted to active server configuration.")
    }
  }, [serverSettings, showBanner])

  const handleSave = React.useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!formState) return

    try {
      await updateSettingsMutation.mutateAsync(formState)
      setIsDirty(false)
      showBanner("success", "System settings successfully updated and hot-reloaded.")
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save system settings."
      )
    }
  }, [formState, updateSettingsMutation, showBanner])

  const handleToggleKillSwitch = React.useCallback(
    async (active: boolean, emergencyMessage: string) => {
      try {
        await killSwitchMutation.mutateAsync({
          killSwitchActive: active,
          emergencyMessage: emergencyMessage || null,
        })
        refetch()
        showBanner(
          "success",
          active
            ? "CRITICAL: Platform emergency kill switch engaged."
            : "Platform emergency kill switch disengaged. Operations resumed."
        )
      } catch (err: any) {
        showBanner(
          "error",
          err?.response?.data?.message ||
            err?.message ||
            "Failed to execute emergency kill switch toggle."
        )
      }
    },
    [killSwitchMutation, refetch, showBanner]
  )

  const isKillSwitchActive = Boolean(
    formState?.emergencyControls?.killSwitchActive ??
      serverSettings?.emergencyControls?.killSwitchActive
  )

  const isMaintenanceActive = Boolean(
    formState?.maintenanceMode ?? serverSettings?.maintenanceMode
  )

  const isReadOnlyActive = Boolean(
    formState?.readOnlyMode ?? serverSettings?.readOnlyMode
  )

  const value: SettingsContextType = {
    activeTab,
    setActiveTab,
    activeSubField,
    formState,
    serverSettings,
    isDirty,
    isLoading,
    isRefetching,
    isSaving: updateSettingsMutation.isPending,
    handleFormChange,
    handleSave,
    handleReset,
    refetch,
    isKillSwitchActive,
    isMaintenanceActive,
    isReadOnlyActive,
    isKillSwitchModalOpen,
    setIsKillSwitchModalOpen,
    handleToggleKillSwitch,
    banner,
    showBanner,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
