# ⚡ Apex E-Commerce Admin Dashboard

A modern, production-grade E-Commerce Administration and Management Platform built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**, and **Base UI**.

Inspired by enterprise control centers like Stripe, Shopify Admin, Linear, and Vercel.

---

## ✨ Features

- 🧭 **Enterprise Navigation Sidebar**: Data-driven, accessible, and information-dense sidebar across 9 core business domains:
  - **Overview**: Dashboard KPIs and store summaries.
  - **Commerce**: Orders *(live count badge)*, Products *(nested categories & creation)*, Categories, Brands, and Inventory *(adjustments & transactions)*.
  - **Customers**: Customer directory and product reviews.
  - **Finance**: Payments, refunds, and transaction ledgers.
  - **Marketing**: Discount coupons and promotional campaigns.
  - **Operations**: Notifications, background worker jobs, outbox events, and failed event tracking.
  - **Analytics**: Performance charts and exportable business reports.
  - **Administration**: User accounts, role-based access control (RBAC), and audit logs.
  - **System**: Platform settings, API key management, and system health status.
- 🏬 **Store & Workspace Switcher**: Switch between production storefronts, regional markets, and staging sandboxes on the fly.
- 🎛️ **Collapsible & Responsive**: Smooth desktop icon mode (`collapsible="icon"`), keyboard shortcut (`⌘B`), draggable `SidebarRail`, and automatic mobile drawer sheets.
- 🗂️ **Nested Navigation**: Collapsible multi-level sub-routes with active route matching and smooth animations.
- 🟢 **Live Telemetry & System Status**: Real-time operational indicator linked directly to `/system-health`.
- 👤 **Administrator Profile**: Quick account settings, profile drawer, notifications, and sign out dropdown.
- 🔎 **Global Search & Quick Actions**: Search shortcut (`⌘K`), notification center, and breadcrumbs.
- 🎨 **Typography & Design System**: Modern **Poppins** Google Font integration, OkLCH color palette, dark mode ready, and glassmorphism accents.
- 🛡️ **Graceful Route States**: Dedicated custom **404 Route Not Found**, **Error Boundary**, and **Loading** views with luminous hero icons.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **UI & Primitives**: [shadcn/ui](https://ui.shadcn.com/) & [@base-ui/react](https://base-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [Poppins via next/font/google](https://fonts.google.com/specimen/Poppins)

---

## 📁 Project Structure

```text
admin-dash/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root Layout (Poppins, SidebarProvider, SidebarInset)
│   │   ├── page.tsx                # Dashboard Overview (KPIs, Recent Orders, Quick Modules)
│   │   ├── not-found.tsx           # Custom 404 Route Not Found with Hero Icon
│   │   ├── error.tsx               # Client Error Boundary with Diagnostics Drawer
│   │   ├── loading.tsx             # Animated Route Loading State
│   │   └── globals.css             # Tailwind v4 Theme Variables & Base Styles
│   ├── components/
│   │   ├── app-sidebar/
│   │   │   ├── appSidebar.tsx      # Master Sidebar Assembly
│   │   │   ├── nav-config.ts       # Structured, Data-Driven Navigation Config
│   │   │   ├── nav-header.tsx      # Branded Workspace / Storefront Switcher
│   │   │   ├── nav-main.tsx        # Navigation Groups & Nested Collapsible Menus
│   │   │   ├── nav-system-status.tsx # Real-Time Health & Uptime Pill
│   │   │   └── nav-user.tsx        # Administrator Profile & Actions Menu
│   │   ├── dashboard/
│   │   │   └── dashboard-header.tsx # Header Bar with Trigger, Breadcrumbs & Search
│   │   └── ui/                     # Reusable shadcn/ui Components
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       └── tooltip.tsx
│   └── hooks/
│       └── use-mobile.ts           # Responsive Mobile Viewport Hook
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```

---

## ⚙️ Customization

### Adding Navigation Items
To add or modify sidebar items, edit [`src/components/app-sidebar/nav-config.ts`](src/components/app-sidebar/nav-config.ts):

```typescript
{
  id: "custom-group",
  label: "MARKETPLACE",
  items: [
    {
      title: "Vendors",
      url: "/vendors",
      icon: Users,
      badge: "New",
      badgeVariant: "success",
    },
  ],
}
```

### Switching Workspaces / Admin Profile
Update `WORKSPACES` or `CURRENT_ADMIN` in [`nav-config.ts`](src/components/app-sidebar/nav-config.ts) to connect dynamic multi-tenant storefront data or user authentication sessions.

---

## 📄 License

This project is private and proprietary.
