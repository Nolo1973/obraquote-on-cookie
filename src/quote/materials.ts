/** Materials catalog for Todo Proyectable / revoque proyectable (La Plata). */

export type Material = {
  id: string
  name: string
  unit: 'kg' | 'm2' | 'bag'
  /** Indicative ARS price per unit — demo list prices, not a live quote. */
  priceArs: number
  /** kg per m² at 10mm reference thickness (scale linearly). */
  kgPerM2At10mm?: number
  bagKg?: number
  notes?: string
}

export const MATERIALS: Material[] = [
  {
    id: 'proy-base',
    name: 'Revoque proyectable base (interior)',
    unit: 'kg',
    priceArs: 420,
    kgPerM2At10mm: 15,
    bagKg: 30,
    notes: 'Orientativo · validar ficha técnica',
  },
  {
    id: 'proy-ext',
    name: 'Revoque proyectable exterior / hidrofugado',
    unit: 'kg',
    priceArs: 510,
    kgPerM2At10mm: 16,
    bagKg: 30,
    notes: 'Mayor resistencia a intemperie',
  },
  {
    id: 'proy-fino',
    name: 'Revoque fino proyectable / terminación',
    unit: 'kg',
    priceArs: 580,
    kgPerM2At10mm: 8,
    bagKg: 25,
    notes: 'Capa fina de terminación',
  },
  {
    id: 'malla',
    name: 'Malla de refuerzo (rollo)',
    unit: 'm2',
    priceArs: 890,
    notes: 'Para encuentros y fisuras',
  },
]

export const FREIGHT_ZONES = [
  { id: 'lp', label: 'La Plata / Berisso / Ensenada', feeArs: 35000 },
  { id: 'gba-s', label: 'GBA Sur (hasta ~40 km)', feeArs: 55000 },
  { id: 'gba-o', label: 'GBA Oeste / Norte', feeArs: 72000 },
  { id: 'pickup', label: 'Retiro en depósito (sin flete)', feeArs: 0 },
] as const

export const USD_ARS_DEMO = 1450
