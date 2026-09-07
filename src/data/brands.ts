/**
 * @file brands.ts
 * @description Mock data and fixture items for Brand Directory and Vendor Partnerships.
 */

export interface BrandEntity {
  id: string
  code: string
  name: string
  monogram: string
  website: string
  vendorType: string
  skusCount: number
  gmv30d: string
  status: "Active" | "In Review" | "Suspended" | string
  category: string
  targetMargin: string
  story: string
}

export const BRANDS_DATA: BrandEntity[] = [
  {
    id: "brand-apex",
    code: "APX-001",
    name: "Apex Hardware",
    monogram: "AH",
    website: "apex.internal",
    vendorType: "1st Party Direct",
    skusCount: 84,
    gmv30d: "$552,140",
    status: "Active",
    category: "Keyboards",
    targetMargin: "62.0%",
    story: "Precision-machined mechanical peripherals manufactured directly in-house.",
  },
  {
    id: "brand-keychron",
    code: "V-8891",
    name: "Keychron Global",
    monogram: "KG",
    website: "keychron.com",
    vendorType: "3rd Party Vendor",
    skusCount: 42,
    gmv30d: "$198,400",
    status: "Active",
    category: "Keyboards",
    targetMargin: "38.5%",
    story: "Authorized distributor partnership for wireless mechanical keyboards.",
  },
  {
    id: "brand-moondrop",
    code: "V-9012",
    name: "Moondrop Audio Labs",
    monogram: "MD",
    website: "moondroplab.com",
    vendorType: "3rd Party Vendor",
    skusCount: 28,
    gmv30d: "$142,800",
    status: "Active",
    category: "Audio",
    targetMargin: "44.0%",
    story: "Audiophile in-ear monitors and DAC headphone amplifiers.",
  },
]
