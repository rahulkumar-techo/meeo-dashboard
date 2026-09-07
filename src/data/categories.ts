/**
 * @file categories.ts
 * @description Mock data and fixture items for Taxonomy Category Hierarchy.
 */

export interface CategoryItem {
  id: string
  name: string
  slug: string
  skusCount: number
  level: number
  parentName?: string
  status: "active" | "draft" | string
  facets: string[]
  description: string
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "node-mech-kb",
    name: "Mechanical Keyboards",
    slug: "electronics/keyboards/mechanical",
    skusCount: 64,
    level: 2,
    parentName: "Electronics & Hardware",
    status: "active",
    facets: [
      "Switch Type (Tactile, Linear, Clicky)",
      "Form Factor (65%, 75%, TKL, Full)",
      "Hot-Swappable PCB (Yes, Soldered)",
      "Connectivity (2.4G, Bluetooth, USB-C)",
    ],
    description: "High-end enthusiast mechanical keyboard barebones, switches, and assembled custom decks.",
  },
  {
    id: "node-audio",
    name: "Audiophile Headphones & IEMs",
    slug: "electronics/audio/headphones",
    skusCount: 38,
    level: 2,
    parentName: "Electronics & Hardware",
    status: "active",
    facets: [
      "Driver Type (Planar, Dynamic, BA)",
      "Acoustic Design (Open Back, Closed Back)",
      "Impedance (16Ω, 32Ω, 300Ω)",
    ],
    description: "Studio reference headphones, precision DAC amps, and in-ear monitors.",
  },
  {
    id: "node-desk",
    name: "Desk Setup & Ergonomics",
    slug: "workspace/ergonomics",
    skusCount: 52,
    level: 2,
    parentName: "Workspace & Office",
    status: "active",
    facets: [
      "Material (Walnut Wood, Anodized Aluminum, Felt)",
      "Load Capacity (Up to 25kg, 50kg+)",
    ],
    description: "Monitor arms, desk pads, wrist rests, and ergonomic articulating mounts.",
  },
]
