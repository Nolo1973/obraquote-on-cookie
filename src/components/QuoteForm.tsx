import { FREIGHT_ZONES, MATERIALS } from '../quote/materials'
import type { QuoteInput } from '../quote/calc'

type Props = {
  value: QuoteInput
  onChange: (v: QuoteInput) => void
  onSubmit: () => void
}

export function QuoteForm({ value, onChange, onSubmit }: Props) {
  function patch<K extends keyof QuoteInput>(key: K, v: QuoteInput[K]) {
    onChange({ ...value, [key]: v })
  }

  const plasterMaterials = MATERIALS.filter((m) => m.id !== 'malla')

  return (
    <section className="card quote-form">
      <div className="card-head">
        <h2>Cotización · revoque proyectable</h2>
        <span className="tag">Todo Proyectable · La Plata</span>
      </div>

      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <label>
          Cliente
          <input
            value={value.clientName}
            onChange={(e) => patch('clientName', e.target.value)}
            placeholder="Ej. Estudio López"
            required
          />
        </label>
        <label>
          Obra / dirección
          <input
            value={value.obra}
            onChange={(e) => patch('obra', e.target.value)}
            placeholder="Calle, barrio, La Plata"
            required
          />
        </label>
        <label>
          Superficie (m²)
          <input
            type="number"
            min={1}
            step={0.5}
            value={value.areaM2}
            onChange={(e) => patch('areaM2', Number(e.target.value))}
            required
          />
        </label>
        <label>
          Espesor (mm)
          <input
            type="number"
            min={5}
            max={40}
            step={1}
            value={value.thicknessMm}
            onChange={(e) => patch('thicknessMm', Number(e.target.value))}
            required
          />
        </label>
        <label>
          Material
          <select
            value={value.materialId}
            onChange={(e) => patch('materialId', e.target.value)}
          >
            {plasterMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Merma (%)
          <input
            type="number"
            min={0}
            max={25}
            step={1}
            value={value.wastePct}
            onChange={(e) => patch('wastePct', Number(e.target.value))}
          />
        </label>
        <label>
          Zona de flete
          <select
            value={value.freightZoneId}
            onChange={(e) => patch('freightZoneId', e.target.value)}
          >
            {FREIGHT_ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label} ({z.feeArs === 0 ? 'sin cargo' : `$${z.feeArs.toLocaleString('es-AR')}`})
              </option>
            ))}
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={value.includeMesh}
            onChange={(e) => patch('includeMesh', e.target.checked)}
          />
          Incluir malla de refuerzo
        </label>
        {value.includeMesh && (
          <label>
            Malla (m²)
            <input
              type="number"
              min={0}
              step={1}
              value={value.meshM2}
              onChange={(e) => patch('meshM2', Number(e.target.value))}
            />
          </label>
        )}
        <label className="full">
          Notas
          <textarea
            rows={2}
            value={value.notes}
            onChange={(e) => patch('notes', e.target.value)}
            placeholder="Acceso, piso, energía, etc."
          />
        </label>
        <div className="full actions">
          <button type="submit" className="btn primary">
            Calcular cotización
          </button>
        </div>
      </form>
    </section>
  )
}
