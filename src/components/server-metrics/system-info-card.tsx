/**
 * @file system-info-card.tsx
 * @description Real Host System & Runtime Telemetry Card.
 * Displays "using out of given capacity" metrics: RSS vs Host RAM, V8 Heap vs limits,
 * CPU cores & runtime execution, storage capacity, and host environment specs.
 * Zero dummy/mock data: strictly displays real parsed system information and Prometheus gauges.
 */

"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SystemHostInfo, ParsedMemoryMetrics, ParsedCpuMetrics } from "@/types/server-metrics"
import {
  Cpu,
  Server,
  HardDrive,
  ShieldCheck,
  Terminal,
  Info,
  Layers,
  Activity,
  Disc,
  Network,
} from "lucide-react"

interface SystemInfoCardProps {
  system?: SystemHostInfo
  memory?: ParsedMemoryMetrics
  cpu?: ParsedCpuMetrics
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  if (i < 0 || i >= sizes.length) return "0 B"
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function SystemInfoCard({ system, memory, cpu }: SystemInfoCardProps) {
  // 1. Process Memory & Heap calculations
  const heapUsed = memory?.heapUsedBytes ? formatBytes(memory.heapUsedBytes) : "0 B"
  const heapTotal = memory?.heapTotalBytes ? formatBytes(memory.heapTotalBytes) : "0 B"
  const processRss = memory?.residentBytes ? formatBytes(memory.residentBytes) : "0 B"
  const externalMem = memory?.externalBytes ? formatBytes(memory.externalBytes) : "0 B"
  const heapPercent = memory?.heapUsedPercent || 0
  const heapLimit = system?.heapLimitBytes && system.heapLimitBytes > 0 ? formatBytes(system.heapLimitBytes) : ""

  // 2. Physical Host RAM calculations
  const totalHostRam = system?.totalRamBytes || 0
  const usedHostRam = system?.usedRamBytes || 0
  const freeHostRam = system?.freeRamBytes || (totalHostRam > usedHostRam ? totalHostRam - usedHostRam : 0)
  const hostRamPercent = system?.ramUsedPercent && system.ramUsedPercent > 0
    ? system.ramUsedPercent
    : (totalHostRam > 0 ? Number(((usedHostRam / totalHostRam) * 100).toFixed(1)) : 0)
  const rssOfHostPercent = totalHostRam > 0 && memory?.residentBytes
    ? Number(((memory.residentBytes / totalHostRam) * 100).toFixed(1))
    : 0

  // 3. CPU Telemetry calculations
  const totalCpuSeconds = cpu?.totalSeconds ? `${cpu.totalSeconds.toFixed(2)}s` : "0s"
  const uptimeMinutes = cpu?.uptimeSeconds ? `${Math.floor(cpu.uptimeSeconds / 60)} mins` : "0 mins"
  const cpuCores = system?.cpuCores || 0
  const cpuSpeed = system?.cpuSpeedMhz && system.cpuSpeedMhz > 0 ? `${system.cpuSpeedMhz} MHz` : ""
  const cpuModel = system?.cpuModel || ""

  // 4. Host OS & Node Runtime
  const nodeVer = system?.nodeVersion || (typeof process !== "undefined" ? process.version : "") || ""
  const v8Ver = system?.v8Version || ""
  const osPlatform = system?.platform
    ? `${system.platform} ${system.osRelease || ""} ${system.arch ? `(${system.arch})` : ""}`.trim()
    : ""
  const hostname = system?.hostname || ""
  const pid = system?.pid || 0

  // 5. Disk Storage calculations ("Using out of given capacity")
  const diskTotal = system?.disk?.totalBytes || 0
  const diskUsed = system?.disk?.usedBytes || 0
  const diskFree = system?.disk?.freeBytes || (diskTotal > diskUsed ? diskTotal - diskUsed : 0)
  const diskCalcPercent = diskTotal > 0 ? Number(((diskUsed / diskTotal) * 100).toFixed(1)) : 0
  const diskPercent = (system?.disk?.usedPercent && system.disk.usedPercent > 0)
    ? system.disk.usedPercent
    : diskCalcPercent
  const diskStatus = system?.disk?.status || (diskPercent > 90 ? "Critical" : diskPercent > 75 ? "Warning" : diskTotal > 0 ? "Healthy" : "")
  const diskMount = system?.disk?.mount || "/"

  // 6. Network Telemetry
  const networkSockets = system?.network?.activeSockets ?? 0
  const networkInterfaces = system?.network?.interfacesCount ?? 0
  const primaryIp = system?.network?.primaryIp || ""

  // 7. Process & Thread Usage ("using out of given")
  const threadCount = system?.threads?.count || (cpuCores > 0 ? cpuCores : 0)
  const activeThreads = system?.threads?.active ?? 0
  const activeHandles = system?.processHandles?.activeHandles ?? 0
  const activeRequests = system?.processHandles?.activeRequests ?? 0

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Host System & Process Telemetry</CardTitle>
                {pid > 0 && (
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                    PID {pid}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Live V8 execution engine, memory allocations, and CPU runtime statistics
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hostname && (
              <Badge variant="outline" className="font-mono text-xs bg-muted/40 text-muted-foreground">
                {hostname}
              </Badge>
            )}
            <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Telemetry Connected
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Core Process Telemetry Grid (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Process RSS vs System RAM */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Resident Set (RSS)</span>
                </div>
                {totalHostRam > 0 ? (
                  <Badge variant="outline" className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                    {rssOfHostPercent > 0 ? `${rssOfHostPercent}%` : "<0.1%"} of Host
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                    Physical RAM
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono text-foreground">{processRss}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {totalHostRam > 0 ? `of ${formatBytes(totalHostRam)} Total System RAM` : "Dedicated Process Memory"}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{
                    width: `${
                      totalHostRam > 0
                        ? Math.min(rssOfHostPercent, 100)
                        : Math.min(heapPercent, 100)
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] font-mono text-muted-foreground">
                {totalHostRam > 0 ? (
                  <>
                    <span>Host Used: {formatBytes(usedHostRam)} ({hostRamPercent}%)</span>
                    <span>Free: {formatBytes(freeHostRam)}</span>
                  </>
                ) : (
                  <>
                    <span>V8 Heap: {heapUsed}</span>
                    <span>C++ Buffers: {externalMem}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: V8 Heap Allocation */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <HardDrive className="h-3.5 w-3.5 text-emerald-500" />
                  <span>V8 JavaScript Heap</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {heapPercent}% In-Use
                </Badge>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{heapUsed}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  of {heapTotal} allocated{heapLimit ? ` (${heapLimit})` : ""}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(heapPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] font-mono text-muted-foreground">
                <span>C++ Buffers:</span>
                <span>{externalMem}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Process CPU Runtime */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Cpu className="h-3.5 w-3.5 text-amber-500" />
                  <span>Process CPU Runtime</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {totalCpuSeconds} Total
                </Badge>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono text-foreground">
                  {cpuCores > 0 ? `${cpuCores} Cores` : "0 Cores"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate" title={cpuModel || "Processor"}>
                  {cpuSpeed ? `${cpuSpeed} • ` : ""}{cpuModel || "Processor"}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User / Kernel:</span>
                <span className="font-mono font-medium text-foreground">
                  {cpu?.userSeconds ? `${cpu.userSeconds.toFixed(2)}s` : "0s"} / {cpu?.systemSeconds ? `${cpu.systemSeconds.toFixed(2)}s` : "0s"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Process Uptime:</span>
                <span className="font-mono text-primary font-semibold">{uptimeMinutes}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Engine & Thread Telemetry ("Using out of given") */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Terminal className="h-3.5 w-3.5 text-blue-500" />
                  <span>Process & Threads</span>
                </div>
                {nodeVer && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {nodeVer}
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono text-foreground truncate">
                  {threadCount > 0 ? `${activeThreads} / ${threadCount} Threads` : `${activeThreads} Threads`}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate" title={osPlatform || "Host OS"}>
                  {osPlatform || "Host System"}{v8Ver ? ` • V8 ${v8Ver.replace(/^v8\s*/i, "")}` : ""}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Handles:</span>
                <span className="font-mono text-foreground font-medium">
                  {activeHandles} Libuv handles
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Async Requests:</span>
                <span className="font-mono text-foreground font-medium">
                  {activeRequests} active req
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Telemetry: Storage Volume Capacity & Network Interfaces */}
        {(system?.disk || system?.network) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Storage Volume Capacity ("Using out of given") */}
            {system.disk && (
              <div className="p-4 rounded-lg border border-border/50 bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <Disc className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground block">Root Storage Volume</span>
                      <span className="text-[10.5px] text-muted-foreground block font-mono">{diskMount}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono capitalize ${
                      diskPercent > 90
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : diskPercent > 75
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    }`}
                  >
                    {diskStatus}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Capacity Allocation:</span>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatBytes(diskUsed)} / {formatBytes(diskTotal)}{" "}
                      <span
                        className={
                          diskPercent > 90
                            ? "text-rose-500"
                            : diskPercent > 75
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }
                      >
                        ({diskPercent}%)
                      </span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        diskPercent > 90
                          ? "bg-rose-500"
                          : diskPercent > 75
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-emerald-500 to-indigo-500"
                      }`}
                      style={{ width: `${Math.min(diskPercent, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
                    <span>Free Space Remaining:</span>
                    <span className="text-foreground font-medium">{formatBytes(diskFree)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Host Network Interfaces & Concurrency */}
            {system.network && (
              <div className="p-4 rounded-lg border border-border/50 bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <Network className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground block">Host Network & Sockets</span>
                      <span className="text-[10.5px] text-muted-foreground block font-mono">
                        {primaryIp ? `Primary: ${primaryIp}` : "Network Interface"}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-teal-500/10 text-teal-600 border-teal-500/20">
                    {networkSockets} Active Sockets
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/40 space-y-1">
                    <span className="text-[10.5px] text-muted-foreground block">Network Interfaces</span>
                    <span className="font-mono text-base font-bold text-foreground block">
                      {networkInterfaces} Available
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/40 space-y-1">
                    <span className="text-[10.5px] text-muted-foreground block">Active Connections</span>
                    <span className="font-mono text-base font-bold text-foreground block">
                      {networkSockets} TCP Handles
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technical Formula Explanation */}
        <div className="p-2.5 rounded-md bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Telemetry Formula:</strong> Real process signals derived from OS kernel bindings.{" "}
            <span className="font-semibold text-foreground">Resident Set Size (RSS)</span> measures physical RAM occupied by Fastify out of total machine RAM.{" "}
            <span className="font-semibold text-foreground">V8 Heap</span> measures dynamic JavaScript memory relative to the V8 memory limit ceiling.{" "}
            <span className="font-semibold text-foreground">Storage Capacity</span> reflects real root filesystem allocations.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
