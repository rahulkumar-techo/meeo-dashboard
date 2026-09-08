/**
 * @file settings.service.ts
 * @description Communication layer for Platform System Settings & Governance API.
 * Connects directly to /api/v1/settings for Tier 1-3 configuration, feature flags, and emergency freeze controls.
 */

import { apiClient } from "@/config/client"
import type {
  SystemSettings,
  UpdateSystemSettingsPayload,
  EmergencyKillSwitchPayload,
  SettingsApiResponse,
} from "@/types/settings"

export const settingsService = {
  /**
   * 1. Retrieve Full System Settings across all 3 tiers
   * Endpoint: GET /api/v1/settings
   */
  async getSettings(): Promise<SettingsApiResponse<SystemSettings>> {
    const response = await apiClient.get<SettingsApiResponse<SystemSettings>>(
      "/settings"
    )
    return response.data
  },

  /**
   * 2. Update System Settings (atomic in-memory hot cache sync + audit trail)
   * Endpoint: PUT /api/v1/settings
   */
  async updateSettings(
    payload: UpdateSystemSettingsPayload
  ): Promise<SettingsApiResponse<SystemSettings>> {
    const response = await apiClient.put<SettingsApiResponse<SystemSettings>>(
      "/settings",
      payload
    )
    return response.data
  },

  /**
   * 3. Toggle Emergency Kill Switch (immediate platform freeze / unfreeze)
   * Endpoint: POST /api/v1/settings/emergency-kill-switch
   */
  async toggleEmergencyKillSwitch(
    payload: EmergencyKillSwitchPayload
  ): Promise<SettingsApiResponse<Partial<SystemSettings>>> {
    const response = await apiClient.post<
      SettingsApiResponse<Partial<SystemSettings>>
    >("/settings/emergency-kill-switch", payload)
    return response.data
  },
}
