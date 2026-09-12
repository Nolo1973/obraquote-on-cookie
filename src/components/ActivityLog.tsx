import type { EscrowIntentResult } from '../cookie/escrowIntent'

type Props = { items: EscrowIntentResult[] }

export function ActivityLog({ items }: Props) {
  return (
    <section className="card activity-log">
      <div className="card-head">
        <h2>Activity</h2>
        <span className="tag">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="hint">Quotes anchored here appear with status + explorer links.</p>
      ) : (
        <ul className="log-list">
          {items.map((it) => (
            <li key={`${it.signature}-${it.quoteId}`}>
              <div>
                <span className={`pill ${it.mode === 'onchain' ? 'ok' : 'muted'}`}>{it.mode}</span>{' '}
                <strong>{it.quoteId}</strong> · {it.intentUsdc.toFixed(2)} USDC intent
              </div>
              <div className="hint">{it.status}</div>
              {it.mode === 'onchain' && (
                <a href={it.explorerUrl} target="_blank" rel="noreferrer">
                  Explorer
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
