/**
 * @file customer.service.ts
 * @description API communication layer for Customer Management, Ecommerce Intelligence, and 360-Degree Views.
 */

import { apiClient } from "@/config/client"
import type {
  AdminCustomer,
  CustomerMetrics,
  Customer360Intelligence,
  CustomerQueryParams,
  UpdateCustomerStatusPayload,
  UpdateCustomerProfilePayload,
  CustomerApiResponse,
  CustomerListResponseData,
} from "@/types/customer"

export const customerService = {
  /**
   * 1. List all customers with Ecommerce Intelligence (Tier, Lifetime Spend, Risk Score).
   * Endpoint: GET /api/v1/user/admin
   */
  async getCustomers(
    params?: CustomerQueryParams
  ): Promise<CustomerApiResponse<CustomerListResponseData>> {
    const response = await apiClient.get<
      CustomerApiResponse<CustomerListResponseData>
    >("/user/admin", {
      params,
    })
    return response.data
  },

  /**
   * 2. Customer Analytics & Platform KPIs (Repeat purchase rate, LTV, tier distribution).
   * Endpoint: GET /api/v1/user/admin/metrics
   */
  async getCustomerMetrics(): Promise<CustomerApiResponse<CustomerMetrics>> {
    const response = await apiClient.get<CustomerApiResponse<CustomerMetrics>>(
      "/user/admin/metrics"
    )
    return response.data
  },

  /**
   * 3. Customer 360-Degree Intelligence View (Profile, Summary, Orders, Reviews, Sessions).
   * Endpoint: GET /api/v1/user/admin/:userId/360
   */
  async getCustomer360(
    userId: string
  ): Promise<CustomerApiResponse<Customer360Intelligence>> {
    const response = await apiClient.get<
      CustomerApiResponse<Customer360Intelligence>
    >(`/user/admin/${userId}/360`)
    return response.data
  },

  /**
   * 4. Moderate Customer Status - Block / Suspend / Activate (auto-revokes sessions if suspended/blocked).
   * Endpoint: PATCH /api/v1/user/admin/:userId/status
   */
  async updateCustomerStatus(
    userId: string,
    payload: UpdateCustomerStatusPayload
  ): Promise<CustomerApiResponse<Partial<AdminCustomer>>> {
    const response = await apiClient.patch<
      CustomerApiResponse<Partial<AdminCustomer>>
    >(`/user/admin/${userId}/status`, payload)
    return response.data
  },

  /**
   * 5. Update User Profile & Account (Names, status).
   * Endpoint: PATCH /api/v1/user/admin/:userId
   */
  async updateCustomerProfile(
    userId: string,
    payload: UpdateCustomerProfilePayload
  ): Promise<CustomerApiResponse<Partial<AdminCustomer>>> {
    const response = await apiClient.patch<
      CustomerApiResponse<Partial<AdminCustomer>>
    >(`/user/admin/${userId}`, payload)
    return response.data
  },

  /**
   * 6. Cross-Module: Revoke specific login session.
   * Endpoint: DELETE /api/v1/authorization/users/:userId/sessions/:sessionId
   */
  async revokeUserSession(
    userId: string,
    sessionId: string
  ): Promise<CustomerApiResponse<{ success: boolean; message: string }>> {
    const response = await apiClient.delete<
      CustomerApiResponse<{ success: boolean; message: string }>
    >(`/authorization/users/${userId}/sessions/${sessionId}`)
    return response.data
  },
}
