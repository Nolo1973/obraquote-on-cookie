import { useState } from 'react'
import type { QuoteResult } from '../quote/calc'
import type { ConnectedWallet } from '../cookie/wallet'
import {
  submitEscrowIntent,
  type EscrowIntentResult,
} from '../cookie/escrowIntent'
import { shortenAddress } from '../cookie/network'

type Props = {
  quote: QuoteResult | null
  wallet: ConnectedWallet | null
  demoMode: boolean
  rpcUrl: string
  onResult: (r: EscrowIntentResult) => void
}

export function EscrowPanel({ quote, wallet, demoMode, rpcUrl, onResult }: Props) {
  const [busy, setBusy] = useState(false)
  const [last, setLast] = useState<EscrowIntentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (!quote) return
    setBusy(true)
    setError(null)
    try {
      const result = await submitEscrowIntent({ quote, wallet, demoMode, rpcUrl })
      setLast(result)
      onResult(result)
      if (result.error && result.mode === 'onchain') setError(result.error)
      if (result.error && result.mode === 'demo' && !demoMode) setError(result.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card escrow-panel">
      <div className="card-head">
        <h2>Escrow intent on Cookie</h2>
        <span className="tag">Memo + receipt hash</span>
      </div>
      <p className="hint">
        Anchors a SHA-256 of the quote as an SPL Memo on Cookie Chain (SVM). Optional 0-lamport
        self-transfer for a clear explorer trail. <strong>No real USDC moves</strong> — this is an
        intent receipt for obra deposits.
      </p>
      <button
        type="button"
        className="btn primary"
        disabled={!quote || busy}
        onClick={() => void run()}
      >
        {busy
          ? 'Submitting…'
          : demoMode || !wallet
            ? 'Generate demo receipt'
            : 'Submit memo tx (Nightly)'}
      </button>

      {error && <p className="error-text">{error}</p>}

      {last && (
        <div className="receipt">
          <p>
            <span className={`pill ${last.confirmed ? 'ok' : 'warn'}`}>{last.mode}</span>{' '}
            {last.status}
          </p>
          <dl className="meta-grid">
            <div>
              <dt>Quote</dt>
              <dd className="mono">{last.quoteId}</dd>
            </div>
            <div>
              <dt>Hash</dt>
              <dd className="mono truncate" title={last.quoteHash}>
                {last.quoteHash.slice(0, 18)}…
              </dd>
            </div>
            <div>
              <dt>USDC intent</dt>
              <dd className="mono">{last.intentUsdc.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Signature</dt>
              <dd className="mono truncate" title={last.signature}>
                {shortenAddress(last.signature, 8)}
              </dd>
            </div>
          </dl>
          <p className="mono memo">{last.memo}</p>
          {last.mode === 'onchain' && (
            <a className="btn ghost" href={last.explorerUrl} target="_blank" rel="noreferrer">
              View on CookieScan
            </a>
          )}
        </div>
      )}
    </section>
  )
}
