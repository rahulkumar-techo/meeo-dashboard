# Rendering & Responsiveness Guidelines

## 1. Server-Side Rendering (SSR) & Client-Side Rendering (CSR)
- **Strict Hydration Safety**: Avoid non-deterministic values (like `Math.random()`, `Date.now()`, unseeded UUIDs, or raw `window` checks) during initial component render.
- **Client Boundaries**: Always prepend `"use client"` at the very top of components using browser APIs, React hooks (`useState`, `useEffect`, `usePathname`), or event handlers.
- **Server Components by Default**: Keep pages and layout wrappers as Server Components where possible for optimal performance and SEO.
- **Base UI & Radix Primitives**: Always set `nativeButton={false}` when wrapping non-button elements (e.g. Next.js `<Link>`) inside `<Button render={...}>`.

## 2. Responsiveness & Mobile-First Adaptation
- **Breakpoints**: Design mobile-first and test across:
  - Mobile (`< 640px`): Collapsible drawer sheets, stacked cards, horizontally scrollable data tables (`overflow-x-auto`).
  - Tablet (`640px - 1024px`): 2-column KPI grids, compact headers, icon-collapsible sidebar.
  - Desktop (`> 1024px`): Full multi-column grids (4-column KPIs, 12-column layouts), sticky headers, expanded charts.
- **Information Density**: Keep padding compact (`p-3 sm:p-4 lg:p-6`), text hierarchy crisp, and prevent text truncation clipping on smaller viewports.
