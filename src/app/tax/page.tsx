/**
 * @file page.tsx
 * @description Top-level /tax alias redirecting to /finance/tax.
 */

import { redirect } from "next/navigation"

export default async function TaxRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value)
    }
  })

  const queryString = query.toString() ? `?${query.toString()}` : ""
  redirect(`/finance/tax${queryString}`)
}
