import { FREIGHT_ZONES, MATERIALS, USD_ARS_DEMO, type Material } from './materials'

export type QuoteInput = {
  clientName: string
  obra: string
  areaM2: number
  thicknessMm: number
  materialId: string
  wastePct: number
  freightZoneId: string
  includeMesh: boolean
  meshM2: number
  notes: string
}

export type QuoteLine = {
  label: string
  qty: number
  unit: string
  unitPriceArs: number
  totalArs: number
}

export type QuoteResult = {
  id: string
  createdAt: string
  input: QuoteInput
  material: Material
  lines: QuoteLine[]
  subtotalArs: number
  freightArs: number
  totalArs: number
  /** Demo USDC intent (not a real transfer). */
  intentUsdc: number
  usdArsRate: number
}

export function calcQuote(input: QuoteInput): QuoteResult {
  const material = MATERIALS.find((m) => m.id === input.materialId) ?? MATERIALS[0]
  const freight = FREIGHT_ZONES.find((z) => z.id === input.freightZoneId) ?? FREIGHT_ZONES[0]
  const lines: QuoteLine[] = []

  if (material.kgPerM2At10mm) {
    const kgRaw =
      input.areaM2 * material.kgPerM2At10mm * (input.thicknessMm / 10) * (1 + input.wastePct / 100)
    const bags = material.bagKg ? Math.ceil(kgRaw / material.bagKg) : Math.ceil(kgRaw)
    const qtyKg = material.bagKg ? bags * material.bagKg : bags
    lines.push({
      label: material.name,
      qty: qtyKg,
      unit: 'kg',
      unitPriceArs: material.priceArs,
      totalArs: Math.round(qtyKg * material.priceArs),
    })
    if (material.bagKg) {
      lines.push({
        label: `Equiv. bolsas (${material.bagKg} kg)`,
        qty: bags,
        unit: 'bag',
        unitPriceArs: material.priceArs * material.bagKg,
        totalArs: Math.round(bags * material.bagKg * material.priceArs),
      })
      // Avoid double-counting: keep bags as info only — zero out duplicate total on second line display
      lines[1].totalArs = 0
    }
  } else {
    lines.push({
      label: material.name,
      qty: input.areaM2,
      unit: material.unit,
      unitPriceArs: material.priceArs,
      totalArs: Math.round(input.areaM2 * material.priceArs),
    })
  }

  if (input.includeMesh && input.meshM2 > 0) {
    const mesh = MATERIALS.find((m) => m.id === 'malla')!
    lines.push({
      label: mesh.name,
      qty: input.meshM2,
      unit: 'm2',
      unitPriceArs: mesh.priceArs,
      totalArs: Math.round(input.meshM2 * mesh.priceArs),
    })
  }

  const materialTotal = lines.reduce((s, l) => s + l.totalArs, 0)
  const freightArs = freight.feeArs
  const totalArs = materialTotal + freightArs
  const intentUsdc = Math.max(1, Math.round((totalArs / USD_ARS_DEMO) * 100) / 100)

  const id = `OQ-${Date.now().toString(36).toUpperCase()}`

  return {
    id,
    createdAt: new Date().toISOString(),
    input,
    material,
    lines,
    subtotalArs: materialTotal,
    freightArs,
    totalArs,
    intentUsdc,
    usdArsRate: USD_ARS_DEMO,
  }
}

export function quotePayloadForHash(quote: QuoteResult): string {
  return JSON.stringify({
    v: 1,
    id: quote.id,
    createdAt: quote.createdAt,
    client: quote.input.clientName,
    obra: quote.input.obra,
    areaM2: quote.input.areaM2,
    thicknessMm: quote.input.thicknessMm,
    materialId: quote.material.id,
    totalArs: quote.totalArs,
    intentUsdc: quote.intentUsdc,
    chain: 'cookie',
  })
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
