/**
 * @file job.service.ts
 * @description Admin API communication layer for Background Jobs & Worker Nodes Observability.
 * Connects to BullMQ Redis queues, worker pod telemetry, jobs list, trace inspectors, and bulk remediation.
 */

import { apiClient } from "@/config/client"
import type {
  JobApiResponse,
  JobsOverviewData,
  WorkerNodeTelemetry,
  JobsListResponseData,
  JobsQueryParams,
  JobDetail,
  RetryJobResponseData,
  CancelJobResponseData,
  BulkJobActionPayload,
  BulkJobActionResponseData,
} from "@/types/job"

export const jobService = {
  /**
   * 1. Background Jobs Overview & Throughput KPIs
   * Endpoint: GET /api/v1/jobs/overview
   */
  async getOverview(): Promise<JobApiResponse<JobsOverviewData>> {
    const response = await apiClient.get<JobApiResponse<JobsOverviewData>>(
      "/jobs/overview"
    )
    return response.data
  },

  /**
   * 2. Worker Nodes Health & Utilization Telemetry
   * Endpoint: GET /api/v1/jobs/workers
   */
  async getWorkers(): Promise<JobApiResponse<WorkerNodeTelemetry[]>> {
    const response = await apiClient.get<
      JobApiResponse<WorkerNodeTelemetry[]>
    >("/jobs/workers")
    return response.data
  },

  /**
   * 3. List Background Jobs with Queue Filters
   * Endpoint: GET /api/v1/jobs
   */
  async getJobs(
    params?: JobsQueryParams
  ): Promise<JobApiResponse<JobsListResponseData>> {
    const response = await apiClient.get<
      JobApiResponse<JobsListResponseData>
    >("/jobs", {
      params,
    })
    return response.data
  },

  /**
   * 4. Inspect Job Details & Trace Logs
   * Endpoint: GET /api/v1/jobs/:id
   */
  async getJobById(id: string): Promise<JobApiResponse<JobDetail>> {
    const response = await apiClient.get<JobApiResponse<JobDetail>>(
      `/jobs/${id}`
    )
    return response.data
  },

  /**
   * 5. Retry Failed or Dead-Lettered Job
   * Endpoint: POST /api/v1/jobs/:id/retry
   */
  async retryJob(id: string): Promise<JobApiResponse<RetryJobResponseData>> {
    const response = await apiClient.post<
      JobApiResponse<RetryJobResponseData>
    >(`/jobs/${id}/retry`)
    return response.data
  },

  /**
   * 6. Cancel / Discard Job
   * Endpoint: POST /api/v1/jobs/:id/cancel
   */
  async cancelJob(id: string): Promise<JobApiResponse<CancelJobResponseData>> {
    const response = await apiClient.post<
      JobApiResponse<CancelJobResponseData>
    >(`/jobs/${id}/cancel`)
    return response.data
  },

  /**
   * 7. Execute Bulk Queue Actions
   * Endpoint: POST /api/v1/jobs/bulk-action
   */
  async executeBulkAction(
    payload: BulkJobActionPayload
  ): Promise<JobApiResponse<BulkJobActionResponseData>> {
    const response = await apiClient.post<
      JobApiResponse<BulkJobActionResponseData>
    >("/jobs/bulk-action", payload)
    return response.data
  },
}
