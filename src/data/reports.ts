/**
 * @file reports.ts
 * @description Mock data and fixture items for Scheduled Reports & Data Exports.
 */

export interface ScheduledReport {
  id: string
  name: string
  format: "CSV" | "PDF" | "Parquet" | "JSON"
  frequency: "Daily" | "Weekly" | "Monthly" | "Realtime"
  recipients: string
  lastGenerated: string
  fileSize: string
  status: "active" | "paused" | string
}

export const SCHEDULED_REPORTS_DATA: ScheduledReport[] = [
  {
    id: "rep_01",
    name: "Executive Monthly Financial Reconciliation",
    format: "PDF",
    frequency: "Monthly",
    recipients: "cfo@apexcommerce.io, sarah.j@apexcommerce.io",
    lastGenerated: "Nov 01, 2024 00:00 EST",
    fileSize: "4.2 MB",
    status: "active",
  },
  {
    id: "rep_02",
    name: "Daily Multi-Warehouse Stock Thresholds",
    format: "CSV",
    frequency: "Daily",
    recipients: "warehouse-ops@apexcommerce.io",
    lastGenerated: "Today, 06:00 EST",
    fileSize: "184 KB",
    status: "active",
  },
  {
    id: "rep_03",
    name: "Weekly Marketing Campaign ROI & Attribution",
    format: "CSV",
    frequency: "Weekly",
    recipients: "growth-team@apexcommerce.io",
    lastGenerated: "Oct 28, 2024 08:00 EST",
    fileSize: "890 KB",
    status: "active",
  },
]
