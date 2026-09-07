# ⚡ Meeo Enterprise Commerce Admin Dashboard

A modern, production-grade E-Commerce Administration and Management Platform built with **Next.js 16 (App Router + Turbopack)**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**, **Base UI**, and **Recharts**.

Designed with enterprise-grade aesthetics, strict modularity following **SOLID principles**, full **Mobile Responsiveness**, and an integrated **Dark Mode Engine**.

---

## 📑 Table of Contents

- [Architectural Principles](#-architectural-principles)
- [Project Directory Structure](#-project-directory-structure)
- [Reusable Component Architecture](#-reusable-component-architecture)
- [Separated Data Layer](#-separated-data-layer)
- [Dark Mode & Theme Engine](#-dark-mode--theme-engine)
- [Responsive Navigation & Header](#-responsive-navigation--header)
- [Developer Guide: Adding a New Page](#-developer-guide-adding-a-new-page)
- [Getting Started & Scripts](#-getting-started--scripts)
- [Technology Stack](#-technology-stack)

---

## 🏛️ Architectural Principles

This codebase is organized around strict modular software engineering practices to ensure high maintainability, zero code duplication, and seamless team collaboration:

1. **SOLID Design Principles**:
   - **S (Single Responsibility)**: Every component has one distinct responsibility (e.g., `<StatusBadge>` only renders status pills, `<DataTableToolbar>` only handles search/filter controls, `<PageHeader>` only handles page header composition).
   - **O (Open/Closed)**: Components expose extensible prop interfaces, slot injection (`children`, `actions`, `footer`, `filterContent`), and polymorphic styling without modifying source code.
   - **L (Liskov Substitution)**: Standardized data contracts (`StatusConfig`, `MetricCardData`, `FilterOption`) are interchangeable across all business domains.
   - **I (Interface Segregation)**: Granular interfaces in `src/types/common.ts` prevent oversized prop definitions.
   - **D (Dependency Inversion)**: Pages depend on clean abstractions (`src/components/common`, `src/lib/formatters.ts`) rather than ad-hoc inline formatting or raw UI primitives.

2. **File Size Constraint ($\le 330$ Lines per App Page)**:
   - Every `.tsx` route in `src/app/**/*` is kept clean, concise, and focused purely on layout assembly, state binding, and composition. No monolithic page files exist.

3. **Data Layer Isolation**:
   - All mock datasets, initial fixtures, telemetry points, and testing records are strictly extracted into `src/data/` rather than hardcoded in UI components.

---

## 📁 Project Directory Structure

```text
src/
├── app/                           # Next.js 16 App Router Pages (<= 330 lines each)
│   ├── layout.tsx                 # Root layout with Poppins font, ThemeProvider, SidebarProvider
│   ├── page.tsx                   # Master Overview Dashboard
│   ├── admin/                     # RBAC users, roles, audit logs, system settings
│   ├── analytics/                 # Business performance metrics & scheduled reports
│   ├── brands/                    # Brand roster & partner performance
│   ├── categories/                # Category taxonomy & margin tracking
│   ├── customers/                 # Customer directory, segments & Customer 360 profile
│   ├── finance/                   # Transactions, settlements, refunds, payment gateway health
│   ├── inventory/                 # Warehouse stock, adjustment logs, low stock alerts
│   ├── marketing/                 # Promotions, discount engine, coupons
│   ├── operations/                # Outbox CDC events, background jobs, worker fleet, notifications
│   ├── orders/                    # Orders console, fulfillment pipeline, drawer inspection
│   ├── products/                  # SKU management, product catalog, SKU creation
│   └── reviews/                   # Customer ratings & review moderation queue
│
├── components/
│   ├── theme/                     # Dark Mode & Theme Engine
│   │   ├── theme-provider.tsx     # Context provider with Light/Dark/System resolution & localStorage
│   │   ├── theme-toggle.tsx       # Animated mode switcher dropdown (Light / Dark / System)
│   │   └── index.ts               # Theme barrel export
│   │
│   ├── dashboard/                 # Responsive Top Header & Shell Components
│   │   ├── dashboard-header.tsx   # Responsive top bar (zero mobile overflow, desktop search)
│   │   ├── header-search-dialog.tsx # Global ⌘K / Ctrl+K search dialog & mobile command palette
│   │   ├── header-notifications-popover.tsx # Alert notification popover with real-time badges
│   │   ├── header-quick-create-menu.tsx # Quick create action dropdown (Order, SKU, Promo, Job)
│   │   └── header-profile-menu.tsx # User profile menu with settings, audit, and signout
│   │
│   ├── common/                    # Core Reusable UI & Layout Components
│   │   ├── page-header.tsx        # Standardized page title, badge, and action slots
│   │   ├── metric-card.tsx        # KPI card with sparklines, delta badges, and subtitle info
│   │   ├── metric-grid.tsx        # Responsive multi-column layout for metric cards
│   │   ├── status-badge.tsx       # Polymorphic status pill with pulse animation and semantic variants
│   │   ├── data-table-toolbar.tsx # Search input, filter popovers, and view switcher
│   │   ├── data-table-pagination.tsx # Standard table footer, row counters & page buttons
│   │   ├── empty-state.tsx        # Standardized empty result placeholder
│   │   ├── triage-banner.tsx      # Real-time operational alert strip
│   │   ├── detail-drawer.tsx      # Slide-over Sheet for deep record inspection
│   │   ├── confirm-dialog.tsx     # Confirmation dialog (Refund, Purge, Replay actions)
│   │   └── index.ts               # Common barrel export
│   │
│   ├── charts/                    # Recharts Abstractions
│   │   ├── area-trend-chart.tsx   # Area trend chart with gradient fills & dark tooltip
│   │   ├── bar-metric-chart.tsx   # Bar chart for comparative volume distributions
│   │   ├── donut-distribution-chart.tsx # Donut / Pie chart for status splits
│   │   └── index.ts               # Charts barrel export
│   │
│   ├── modules/                   # Domain-Specific Subcomponents
│   │   ├── orders/                # Order detail sheet, timeline step
│   │   ├── marketing/             # Promotion rule card, discount cart simulator
│   │   ├── operations/            # Outbox CDC payload viewer, worker cluster health card
│   │   └── finance/               # Financial settlement audit modal
│   │
│   ├── app-sidebar/               # Navigation Sidebar
│   └── ui/                        # Base UI / shadcn Primitive Components
│
├── data/                          # Isolated, Typed Mock Datasets & Telemetry Fixtures
│   ├── dashboard.ts               # Overview KPIs, revenue charts, live orders, triage alerts
│   ├── orders.ts                  # Orders dataset, fulfillment steps, order metrics
│   ├── operations.ts              # Outbox CDC events, queue jobs, worker nodes, telemetry
│   ├── finance.ts                 # Settlements, payment transactions, gateway health
│   ├── refunds.ts                 # Refund requests, dispute cases, policies
│   ├── marketing.ts               # Promotion rules, catalog discounts, BOGO rules
│   ├── coupons.ts                 # Coupon codes, discount tiers, usage limits
│   ├── reviews.ts                 # Review moderation queue, sentiment breakdown
│   ├── customers.ts               # Customer records, RFM cohorts, segments
│   ├── customer-360.ts            # Customer 360 profile, order history, activity timeline
│   ├── products.ts                # Product catalog, SKU list, inventory status
│   ├── inventory.ts               # Stock levels, warehouse allocations, restock alerts
│   ├── brands.ts                  # Brand partners, revenue volume, tiering
│   ├── categories.ts              # Category taxonomy tree, margins
│   ├── admin.ts                   # Admin users, RBAC roles, audit logs
│   ├── analytics.ts               # Sales benchmarks, traffic sources, conversion funnels
│   └── reports.ts                 # Scheduled & generated exports
│
├── lib/
│   ├── formatters.ts              # formatCurrency, formatNumber, formatPercentage, formatDate, formatDuration
│   └── utils.ts                   # cn class merger helper
│
└── types/
    └── common.ts                  # Common shared interfaces (ISP compliant)
```

---

## 🧩 Reusable Component Architecture

All components in `src/components/common` are designed for maximum reusability across any page:

### 1. `PageHeader`
Standardizes the top action bar of every page.
```tsx
import { PageHeader } from "@/components/common"
import { Plus, Download } from "lucide-react"

<PageHeader
  title="Orders Console"
  badge="Live Stream"
  badgeVariant="brand"
  description="Manage multi-channel order fulfillment and lifecycle events."
  cacheStatus="Synced 2s ago"
>
  <Button variant="outline" size="sm" className="gap-1.5">
    <Download className="size-3.5" />
    <span>Export CSV</span>
  </Button>
  <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
    <Plus className="size-3.5" />
    <span>Create Order</span>
  </Button>
</PageHeader>
```

### 2. `MetricCard` & `MetricGrid`
Displays KPI cards with sparklines, status pills, and delta metrics.
```tsx
import { MetricCard, MetricGrid } from "@/components/common"

<MetricGrid columns={4}>
  <MetricCard
    title="Gross Volume"
    value="$184,290.00"
    change={12.4}
    changePeriod="vs last month"
    sparklineData={[40, 65, 80, 75, 90, 110, 130]}
  />
</MetricGrid>
```

### 3. `StatusBadge`
Polymorphic status badge supporting semantic variants, pulse animations, and icons.
```tsx
import { StatusBadge } from "@/components/common"

<StatusBadge status="delivered" variant="success" pulse />
<StatusBadge status="processing" variant="info" />
<StatusBadge status="failed" variant="danger" />
<StatusBadge status="review" variant="warning" />
```

### 4. `DataTableToolbar` & `DataTablePagination`
Provides instant search, faceted filters, and responsive pagination controls.
```tsx
import { DataTableToolbar, DataTablePagination } from "@/components/common"

<DataTableToolbar
  searchQuery={search}
  onSearchChange={setSearch}
  searchPlaceholder="Filter records..."
  filterOptions={[
    {
      key: "status",
      label: "Status",
      values: [
        { label: "Active", value: "active", count: 12 },
        { label: "Paused", value: "paused", count: 3 },
      ],
      selectedValue: statusFilter,
      onChange: setStatusFilter,
    }
  ]}
  onResetFilters={() => { setSearch(""); setStatusFilter("all"); }}
/>

<DataTablePagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={filteredData.length}
  pageSize={10}
  onPageChange={setPage}
/>
```

---

## 🌓 Dark Mode & Theme Engine

The application includes a zero-dependency, hydration-safe theme engine in `src/components/theme`:

- **Modes Supported**: `light`, `dark`, `system` (auto-detects OS theme via `window.matchMedia`).
- **Hydration Safe**: Includes an inline script in `src/app/layout.tsx` to prevent any flash of unstyled theme during initial render.
- **Persistent**: Theme preference is automatically saved to `localStorage` under `meeo-dashboard-theme`.
- **Theme Toggle Component**: `<ThemeToggle />` in `src/components/dashboard/dashboard-header.tsx` provides an animated switcher dropdown.

### Using the Theme Hook:
```tsx
import { useTheme } from "@/components/theme"

export function Example() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      Current Mode: {resolvedTheme}
    </button>
  )
}
```

---

## 📱 Responsive Navigation & Header

The top navigation header (`DashboardHeader`) is optimized for all viewports:

- **Mobile Viewports (< 640px)**:
  - Sidebar drawer trigger with touch-friendly bounds.
  - Compact `PROD` badge (no horizontal overflow).
  - Dedicated **Mobile Search Trigger** opening a command palette dialog.
  - Compact **Quick Create** icon button.
  - **Theme Switcher** and **Notifications Popover**.
  - **User Profile Menu** with account settings and sign out.
- **Desktop Viewports (md+)**:
  - Full search bar with `⌘K` / `Ctrl+K` keyboard shortcut.
  - System uptime & operational health telemetry pill.
  - Full labeled Quick Create button and profile overview.

---

## 🛠️ Developer Guide: Adding a New Page

Follow this 3-step pattern to create any new page while adhering to the architecture:

### Step 1: Add Data in `src/data/`
Create or update your data fixture in `src/data/my-feature.ts`:
```typescript
export interface MyItem {
  id: string
  name: string
  status: "active" | "inactive"
  amount: number
}

export const MY_ITEMS: MyItem[] = [
  { id: "ITEM-1", name: "Sample Item", status: "active", amount: 150.00 }
]
```

### Step 2: Build Domain Module Components (if needed)
If the page has complex modals or widgets, place them in `src/components/modules/my-feature/`.

### Step 3: Create the App Page in `src/app/my-feature/page.tsx`
Assemble the page using common components, keeping it under 330 lines:
```tsx
"use client"

import * as React from "react"
import { PageHeader, MetricCard, MetricGrid, DataTableToolbar, DataTablePagination, StatusBadge } from "@/components/common"
import { MY_ITEMS } from "@/data/my-feature"
import { formatCurrency } from "@/lib/formatters"

export default function MyFeaturePage() {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  const filtered = MY_ITEMS.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Feature"
        description="Feature management console"
      />

      <MetricGrid columns={3}>
        <MetricCard title="Total Items" value={MY_ITEMS.length.toString()} />
      </MetricGrid>

      <DataTableToolbar
        searchQuery={search}
        onSearchChange={setSearch}
      />

      {/* Table view */}
      <div className="rounded-md border border-border bg-card">
        {filtered.map(item => (
          <div key={item.id} className="flex items-center justify-between p-4 border-b border-border/40">
            <span>{item.name}</span>
            <StatusBadge status={item.status} variant={item.status === "active" ? "success" : "neutral"} />
            <span>{formatCurrency(item.amount)}</span>
          </div>
        ))}
      </div>

      <DataTablePagination
        currentPage={page}
        totalPages={1}
        totalItems={filtered.length}
        pageSize={10}
        onPageChange={setPage}
      />
    </div>
  )
}
```

---

## 🚀 Getting Started & Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Code Quality & Linting
```bash
npm run lint
```

---

## 🧰 Technology Stack

- **Framework**: [Next.js 16.3.4 (App Router)](https://nextjs.org/)
- **Runtime & UI Core**: [React 19.2.8](https://react.dev/) & [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **Primitives**: [Base UI (@base-ui/react)](https://base-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [Poppins via `next/font/google`](https://fonts.google.com/specimen/Poppins)

---

## 📄 License

This project is private and proprietary.
