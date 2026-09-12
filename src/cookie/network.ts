/** Cookie Chain (SVM) network config — Solana-compatible, not EVM. */

export const COOKIE_CHAIN = {
  name: 'Cookie Chain',
  shortName: 'Cookie',
  /** SVM genesis hash — primary network identifier (no EVM chainId). */
  genesisHash: '9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2',
  rpcUrl: 'https://rpc.cookiescan.io' as string,
  explorerUrl: 'https://cookiescan.io',
  bridgeUrl: 'https://bridge.cookiescan.io',
  docsUrl: 'https://docs.cookiechain.wtf',
  websiteUrl: 'https://www.cookiechain.wtf',
  apiUrl: 'https://api.cookiescan.io',
  nativeSymbol: 'COOK',
  nativeDecimals: 9,
  /** SPL Memo program (available on Cookie as Solana-compatible tooling). */
  memoProgramId: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
} as const

export type ChainHealth = {
  ok: boolean
  slot?: number
  version?: string
  genesisHash?: string
  genesisMatch?: boolean
  latencyMs?: number
  error?: string
}

export async function probeCookieRpc(
  rpcUrl: string = COOKIE_CHAIN.rpcUrl,
): Promise<ChainHealth> {
  const started = performance.now()
  try {
    const [health, version, slot, genesis] = await Promise.all([
      rpc(rpcUrl, 'getHealth', []),
      rpc(rpcUrl, 'getVersion', []),
      rpc(rpcUrl, 'getSlot', []),
      rpc(rpcUrl, 'getGenesisHash', []),
    ])
    const latencyMs = Math.round(performance.now() - started)
    if (health.error) {
      return { ok: false, latencyMs, error: String(health.error.message ?? health.error) }
    }
    const genesisHash = genesis.result as string | undefined
    return {
      ok: true,
      slot: slot.result as number,
      version: (version.result as { 'solana-core'?: string } | undefined)?.['solana-core'],
      genesisHash,
      genesisMatch: genesisHash === COOKIE_CHAIN.genesisHash,
      latencyMs,
    }
  } catch (e) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - started),
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

async function rpc(url: string, method: string, params: unknown[]) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
  return res.json() as Promise<{ result?: unknown; error?: { message?: string } }>
}

export function explorerTxUrl(signature: string): string {
  return `${COOKIE_CHAIN.explorerUrl}/tx/${signature}`
}

export function explorerAddressUrl(address: string): string {
  return `${COOKIE_CHAIN.explorerUrl}/account/${address}`
}

export function shortenAddress(addr: string, chars = 4): string {
  if (addr.length <= chars * 2 + 3) return addr
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`
}
