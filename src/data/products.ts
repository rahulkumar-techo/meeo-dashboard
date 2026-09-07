/**
 * @file products.ts
 * @description Mock data and fixture items for Product Variant Matrix and Catalog.
 */

export interface VariantRow {
  id: string
  color: string
  colorDot: string
  switchType: string
  sku: string
  barcode: string
  price: string
  stock: number
  enabled: boolean
}

export const INITIAL_VARIANTS: VariantRow[] = [
  {
    id: "v1",
    color: "Matte Black",
    colorDot: "#1e293b",
    switchType: "Tactile Brown",
    sku: "APX-KB-BLK-TAC",
    barcode: "849201948210",
    price: "189.00",
    stock: 65,
    enabled: true,
  },
  {
    id: "v2",
    color: "Matte Black",
    colorDot: "#1e293b",
    switchType: "Linear Red",
    sku: "APX-KB-BLK-LIN",
    barcode: "849201948211",
    price: "189.00",
    stock: 55,
    enabled: true,
  },
  {
    id: "v3",
    color: "Chalk White",
    colorDot: "#f8fafc",
    switchType: "Tactile Brown",
    sku: "APX-KB-WHT-TAC",
    barcode: "849201948212",
    price: "199.00",
    stock: 40,
    enabled: true,
  },
  {
    id: "v4",
    color: "Midnight Navy",
    colorDot: "#1e3a8a",
    switchType: "Clicky Blue",
    sku: "APX-KB-NVY-CLK",
    barcode: "849201948213",
    price: "199.00",
    stock: 25,
    enabled: true,
  },
]

export const COLOR_OPTIONS = [
  { label: "Matte Black", dot: "#1e293b" },
  { label: "Chalk White", dot: "#f8fafc" },
  { label: "Midnight Navy", dot: "#1e3a8a" },
]

export const SWITCH_OPTIONS = [
  { label: "Tactile Brown", dot: "#78350f" },
  { label: "Linear Red", dot: "#dc2626" },
  { label: "Clicky Blue", dot: "#2563eb" },
]
