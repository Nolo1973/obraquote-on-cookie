import { useState } from 'react'
import { explorerAddressUrl, shortenAddress } from '../cookie/network'
import {
  connectInjectedSolana,
  connectNightlyWallet,
  detectNightly,
  type ConnectedWallet,
} from '../cookie/wallet'

type Props = {
  wallet: ConnectedWallet | null
  onChange: (w: ConnectedWallet | null) => void
  demoMode: boolean
  onDemoMode: (v: boolean) => void
}

export function WalletPanel({ wallet, onChange, demoMode, onDemoMode }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const nightlyPresent = typeof window !== 'undefined' && detectNightly()

  async function connectNightly() {
    setBusy(true)
    setError(null)
    try {
      const w = await connectNightlyWallet()
      onChange(w)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function connectOther() {
    setBusy(true)
    setError(null)
    try {
      const w = await connectInjectedSolana()
      onChange(w)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    try {
      await wallet?.disconnect()
    } catch {
      /* ignore */
    }
    onChange(null)
  }

  return (
    <section className="card wallet-panel">
      <div className="card-head">
        <h2>Wallet</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => onDemoMode(e.target.checked)}
          />
          Demo mode
        </label>
      </div>

      {wallet ? (
        <div className="wallet-connected">
          <p>
            <span className="pill ok">{wallet.name}</span>{' '}
            <a
              className="mono"
              href={explorerAddressUrl(wallet.address)}
              target="_blank"
              rel="noreferrer"
              title={wallet.address}
            >
              {shortenAddress(wallet.address, 6)}
            </a>
          </p>
          <p className="hint mono full-addr">{wallet.address}</p>
          <button type="button" className="btn ghost" onClick={() => void disconnect()}>
            Disconnect
          </button>
        </div>
      ) : (
        <div className="wallet-actions">
          <button
            type="button"
            className="btn primary"
            disabled={busy}
            onClick={() => void connectNightly()}
          >
            {busy ? 'Connecting…' : 'Connect Nightly'}
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={busy}
            onClick={() => void connectOther()}
          >
            Other Solana wallet
          </button>
          <p className="hint">
            {nightlyPresent
              ? 'Nightly detected — will switch to Cookie genesis when supported.'
              : 'Nightly not detected. Install from nightly.app (required by bounty), or use Demo mode.'}
          </p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {demoMode && (
        <p className="hint warn">
          Demo mode: escrow receipts are local hashes (no broadcast). Turn off + connect Nightly for
          a real Cookie memo tx.
        </p>
      )}
    </section>
  )
}
