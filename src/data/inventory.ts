/**
 * @file inventory.ts
 * @description Mock data and fixture items for Multi-Warehouse Inventory Stock Matrix.
 */

export interface InventoryItem {
  id: string
  name: string
  variant: string
  sku: string
  barcode: string
  primaryBin: string
  badge?: string
  njStock: number
  caStock: number
  nlStock: number
  reserved: number
  available: number
  image?: string
  isLowStock?: boolean
  isOutOfStock?: boolean
}

export const INVENTORY_DATA: InventoryItem[] = [
  {
    id: "inv-mouse",
    name: "Apex Pro Wireless Mouse",
    variant: "Matte Black",
    sku: "APX-MS-BLK",
    barcode: "8490192841",
    primaryBin: "4B-12",
    badge: "Flagship",
    njStock: 2,
    caStock: 2,
    nlStock: 0,
    reserved: 4,
    available: 0,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&auto=format&fit=crop&q=80",
    isOutOfStock: true,
  },
  {
    id: "inv-keyboard",
    name: "Apex Precision Keyboard",
    variant: "Tactile Brown",
    sku: "APX-KB-BLK-TAC",
    barcode: "8490192848",
    primaryBin: "2A-04",
    njStock: 120,
    caStock: 85,
    nlStock: 42,
    reserved: 38,
    available: 209,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&auto=format&fit=crop&q=80",
  },
  {
    id: "inv-mount",
    name: "Studio Monitor Desk Mount",
    variant: "Dual Articulating",
    sku: "MNT-DK-DUAL",
    barcode: "7728190012",
    primaryBin: "9C-01",
    njStock: 0,
    caStock: 0,
    nlStock: 0,
    reserved: 6,
    available: 0,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&auto=format&fit=crop&q=80",
    isOutOfStock: true,
  },
  {
    id: "inv-keycaps",
    name: "Ergonomic Keycap Set (Nordic)",
    variant: "Nordic ISO",
    sku: "APX-KC-NOR",
    barcode: "8829012481",
    primaryBin: "1F-08",
    njStock: 2,
    caStock: 0,
    nlStock: 0,
    reserved: 0,
    available: 2,
    image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=80&auto=format&fit=crop&q=80",
    isLowStock: true,
  },
]
