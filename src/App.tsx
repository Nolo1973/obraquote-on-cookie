import { useMemo, useState } from 'react'
import { ChainStatus } from './components/ChainStatus'
import { WalletPanel } from './components/WalletPanel'
import { QuoteForm } from './components/QuoteForm'
import { QuoteSummary } from './components/QuoteSummary'
import { EscrowPanel } from './components/EscrowPanel'
import { ActivityLog } from './components/ActivityLog'
import { COOKIE_CHAIN } from './cookie/network'
import type { ConnectedWallet } from './cookie/wallet'
import { calcQuote, type QuoteInput, type QuoteResult } from './quote/calc'
import type { EscrowIntentResult } from './cookie/escrowIntent'
import './App.css'

const DEFAULT_INPUT: QuoteInput = {
  clientName: '',
  obra: '',
  areaM2: 120,
  thicknessMm: 15,
  materialId: 'proy-base',
  wastePct: 8,
  freightZoneId: 'lp',
  includeMesh: true,
  meshM2: 40,
  notes: '',
}

export default function App() {
  const [rpcUrl, setRpcUrl] = useState<string>(COOKIE_CHAIN.rpcUrl)
  const [input, setInput] = useState<QuoteInput>(DEFAULT_INPUT)
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null)
  const [demoMode, setDemoMode] = useState(true)
  const [activity, setActivity] = useState<EscrowIntentResult[]>([])

  const title = useMemo(() => 'ObraQuote on Cookie', [])

  function buildQuote() {
    setQuote(calcQuote(input))
  }

  function onEscrow(result: EscrowIntentResult) {
    setActivity((prev) => [result, ...prev].slice(0, 20))
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">cApp · Cookie Chain SVM</p>
          <h1>{title}</h1>
          <p className="lede">
            Cotizá revoque proyectable (Todo Proyectable / La Plata) y anclá un{' '}
            <em>escrow-intent</em> en Cookie Chain: memo on-chain + hash de cotización. Nightly
            wallet required for live txs · demo mode works offline.
          </p>
        </div>
        <div className="hero-rpc">
          <label>
            Cookie RPC
            <input
              className="mono"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value.trim())}
              spellCheck={false}
            />
          </label>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setRpcUrl(COOKIE_CHAIN.rpcUrl)}
          >
            Reset default
          </button>
        </div>
      </header>

      <main className="layout">
        <div className="col">
          <ChainStatus rpcUrl={rpcUrl} />
          <WalletPanel
            wallet={wallet}
            onChange={setWallet}
            demoMode={demoMode}
            onDemoMode={setDemoMode}
          />
          <QuoteForm value={input} onChange={setInput} onSubmit={buildQuote} />
        </div>
        <div className="col">
          <QuoteSummary quote={quote} />
          <EscrowPanel
            quote={quote}
            wallet={wallet}
            demoMode={demoMode}
            rpcUrl={rpcUrl}
            onResult={onEscrow}
          />
          <ActivityLog items={activity} />
        </div>
      </main>

      <footer className="footer">
        <p>
          Built for Superteam Earn ·{' '}
          <a
            href="https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app/"
            target="_blank"
            rel="noreferrer"
          >
            Create an App on Cookie Chain
          </a>
          . Genesis <code>{COOKIE_CHAIN.genesisHash.slice(0, 8)}…</code> · Native COOK · No real
          money required.
        </p>
      </footer>
    </div>
  )
}
