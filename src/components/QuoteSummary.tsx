import type { QuoteResult } from '../quote/calc'

type Props = { quote: QuoteResult | null }

function ars(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function QuoteSummary({ quote }: Props) {
  if (!quote) {
    return (
      <section className="card quote-summary muted-card">
        <h2>Resumen</h2>
        <p className="hint">Completá el formulario para ver materiales, flete e intent USDC.</p>
      </section>
    )
  }

  return (
    <section className="card quote-summary">
      <div className="card-head">
        <h2>Resumen {quote.id}</h2>
        <span className="tag">{new Date(quote.createdAt).toLocaleString('es-AR')}</span>
      </div>
      <p>
        <strong>{quote.input.clientName}</strong> · {quote.input.obra}
      </p>
      <p className="hint">
        {quote.input.areaM2} m² · {quote.input.thicknessMm} mm · {quote.material.name}
      </p>
      <table className="lines">
        <thead>
          <tr>
            <th>Ítem</th>
            <th>Cant.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {quote.lines
            .filter((l) => l.totalArs > 0)
            .map((l) => (
              <tr key={l.label}>
                <td>{l.label}</td>
                <td className="mono">
                  {l.qty.toLocaleString('es-AR')} {l.unit}
                </td>
                <td className="mono">{ars(l.totalArs)}</td>
              </tr>
            ))}
          <tr>
            <td>Flete</td>
            <td>—</td>
            <td className="mono">{ars(quote.freightArs)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Total ARS</td>
            <td className="mono">{ars(quote.totalArs)}</td>
          </tr>
          <tr>
            <td colSpan={2}>USDC intent (demo rate {quote.usdArsRate})</td>
            <td className="mono">{quote.intentUsdc.toFixed(2)} USDC</td>
          </tr>
        </tfoot>
      </table>
      <p className="hint">
        Precios orientativos para demo. No es una oferta comercial vinculante de Todo Proyectable.
      </p>
    </section>
  )
}
