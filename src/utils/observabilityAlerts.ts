/**
 * @file observabilityAlerts.ts
 * @description Real-time alert threshold evaluation logic for Observability.
 * Provides evaluated alert severities and diagnostic messages across server 5xx,
 * client 4xx, security events, and business operations.
 */

import type { ObservabilityThresholdConfig } from "@/types/observability"

export type AlertSeverity = "nominal" | "warning" | "critical"

export interface EvaluatedAlert {
  severity: AlertSeverity
  message: string
}

/**
 * Evaluates 500-599 user-impacting server errors against dynamic config thresholds.
 */
export function evaluateServerAlert(
  current5xxRate: number,
  config?: ObservabilityThresholdConfig
): EvaluatedAlert {
  if (!config) return { severity: "nominal", message: "Nominal" }
  const critical = config.criticalRatePercent ?? 5.0
  const warning = config.warningRatePercent ?? 2.0

  if (current5xxRate >= critical) {
    return {
      severity: "critical",
      message: `Critical Outage: 5xx rate is ${current5xxRate.toFixed(2)}% (Threshold: >${critical}%)`,
    }
  }

  if (current5xxRate >= warning) {
    return {
      severity: "warning",
      message: `Elevated Server Errors: 5xx rate is ${current5xxRate.toFixed(2)}% (Threshold: >${warning}%)`,
    }
  }

  return { severity: "nominal", message: "Nominal" }
}

/**
 * Evaluates client 4xx errors (excluding 401 Auth and 409/410 normal traffic).
 */
export function evaluateClientAlert(
  current4xxRate: number,
  config?: ObservabilityThresholdConfig
): EvaluatedAlert {
  if (!config) return { severity: "nominal", message: "Nominal" }
  const critical = config.criticalRatePercent ?? 25.0
  const warning = config.warningRatePercent ?? 10.0

  if (current4xxRate >= critical) {
    return {
      severity: "critical",
      message: `High Client Errors: 4xx rate is ${current4xxRate.toFixed(2)}% (Threshold: >${critical}%)`,
    }
  }

  if (current4xxRate >= warning) {
    return {
      severity: "warning",
      message: `Elevated Client Errors: 4xx rate is ${current4xxRate.toFixed(2)}% (Threshold: >${warning}%)`,
    }
  }

  return { severity: "nominal", message: "Nominal" }
}

/**
 * Evaluates security anomalies (401/403 bursts or 429 rate limit triggers).
 */
export function evaluateSecurityAlert(
  spikeReqPerMin: number,
  rateLimitHitsPerMin: number,
  config?: ObservabilityThresholdConfig
): EvaluatedAlert {
  if (!config) return { severity: "nominal", message: "Nominal" }
  const spikeThreshold = config.spikeThresholdRequestsPerMin ?? 30
  const rateLimitThreshold = config.rateLimit429ThresholdPerMin ?? 15

  if (spikeReqPerMin >= spikeThreshold || rateLimitHitsPerMin >= rateLimitThreshold) {
    return {
      severity: "warning",
      message: `Security Warning: ${spikeReqPerMin} auth/sec spikes, ${rateLimitHitsPerMin} 429 rate-limits/min`,
    }
  }

  return { severity: "nominal", message: "Nominal" }
}

/**
 * Evaluates business operational failures (payment, checkout, and DLQ errors).
 */
export function evaluateBusinessAlert(
  paymentFailPercent: number,
  orderFailPercent: number,
  dlqCount: number,
  config?: ObservabilityThresholdConfig
): EvaluatedAlert {
  if (!config) return { severity: "nominal", message: "Nominal" }
  const maxPayment = config.paymentFailureRatePercent ?? 2.0
  const maxOrder = config.orderFailureRatePercent ?? 1.0
  const maxDlq = config.backgroundJobDlqThreshold ?? 5

  if (paymentFailPercent >= maxPayment || orderFailPercent >= maxOrder || dlqCount >= maxDlq) {
    return {
      severity: "critical",
      message: `Business Operations Alert: Payment fails ${paymentFailPercent}%, Order fails ${orderFailPercent}%, DLQ: ${dlqCount}`,
    }
  }

  return { severity: "nominal", message: "Nominal" }
}
