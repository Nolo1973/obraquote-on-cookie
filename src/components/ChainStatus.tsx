import { useCallback, useEffect, useState } from 'react'
import {
  COOKIE_CHAIN,
  probeCookieRpc,
  type ChainHealth,
} from '../cookie/network'

type Props = { rpcUrl: string }

export function ChainStatus({ rpcUrl }: Props) {
  const [health, setHealth] = useState<ChainHealth | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setBusy(true)
    try {
      setHealth(await probeCookieRpc(rpcUrl))
    } finally {
      setBusy(false)
    }
  }, [rpcUrl])

  useEffect(() => {
    void refresh()
    const id = window.setInterval(() => void refresh(), 30_000)
    return () => window.clearInterval(id)
  }, [refresh])

  return (
    <section className="card chain-status">
      <div className="card-head">
        <h2>Cookie Chain</h2>
        <button type="button" className="btn ghost" onClick={() => void refresh()} disabled={busy}>
          {busy ? 'Probing…' : 'Refresh'}
        </button>
      </div>
      <dl className="meta-grid">
        <div>
          <dt>Network</dt>
          <dd>{COOKIE_CHAIN.name} (SVM)</dd>
        </div>
        <div>
          <dt>RPC</dt>
          <dd className="mono truncate">{rpcUrl}</dd>
        </div>
        <div>
          <dt>Genesis</dt>
          <dd className="mono truncate" title={COOKIE_CHAIN.genesisHash}>
            {COOKIE_CHAIN.genesisHash.slice(0, 12)}…
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            {health == null ? (
              <span className="pill muted">—</span>
            ) : health.ok ? (
              <span className="pill ok">Healthy</span>
            ) : (
              <span className="pill bad">Down / unreachable</span>
            )}
          </dd>
        </div>
        {health?.slot != null && (
          <div>
            <dt>Slot</dt>
            <dd className="mono">{health.slot.toLocaleString()}</dd>
          </div>
        )}
        {health?.version && (
          <div>
            <dt>solana-core</dt>
            <dd className="mono">{health.version}</dd>
          </div>
        )}
        {health?.latencyMs != null && (
          <div>
            <dt>Latency</dt>
            <dd>{health.latencyMs} ms</dd>
          </div>
        )}
        {health?.genesisMatch != null && (
          <div>
            <dt>Genesis match</dt>
            <dd>{health.genesisMatch ? '✓' : '⚠ mismatch'}</dd>
          </div>
        )}
      </dl>
      {health?.error && <p className="error-text">{health.error}</p>}
      <p className="hint">
        Explorer:{' '}
        <a href={COOKIE_CHAIN.explorerUrl} target="_blank" rel="noreferrer">
          cookiescan.io
        </a>{' '}
        · Bridge:{' '}
        <a href={COOKIE_CHAIN.bridgeUrl} target="_blank" rel="noreferrer">
          bridge COOK
        </a>{' '}
        · Docs:{' '}
        <a href={COOKIE_CHAIN.docsUrl} target="_blank" rel="noreferrer">
          docs.cookiechain.wtf
        </a>
      </p>
    </section>
  )
}
