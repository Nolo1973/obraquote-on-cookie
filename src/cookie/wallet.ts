/**
 * Nightly-first wallet helpers for Cookie Chain (SVM).
 * Prefer injected Nightly (`window.nightly.solana`) + changeNetwork(genesisHash).
 * Falls back to any Solana Wallet Standard provider when present.
 */

import { COOKIE_CHAIN } from './network'

export type WalletAccountLike = {
  address: string
  publicKey: Uint8Array<ArrayBufferLike>
}

export type ConnectedWallet = {
  name: string
  address: string
  publicKey: Uint8Array<ArrayBufferLike>
  signAndSendTransaction: (tx: Uint8Array) => Promise<string>
  disconnect: () => Promise<void>
}

declare global {
  interface Window {
    nightly?: {
      solana?: NightlySolana
    }
    solana?: LegacySolanaProvider
  }
}

type NightlySolana = {
  connect?: (opts?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey?: { toBytes?: () => Uint8Array; toBase58?: () => string; toString?: () => string }
    accounts?: WalletAccountLike[]
  }>
  disconnect?: () => Promise<void>
  changeNetwork?: (opts: { genesisHash: string; url?: string }) => Promise<unknown>
  signAndSendTransaction?: (
    tx: unknown,
    opts?: unknown,
  ) => Promise<{ signature?: string } | string>
  signTransaction?: (tx: unknown) => Promise<unknown>
  publicKey?: { toBytes?: () => Uint8Array; toBase58?: () => string; toString?: () => string }
  isNightly?: boolean
  features?: Record<
    string,
    {
      connect?: (input?: { silent?: boolean }) => Promise<{ accounts: WalletAccountLike[] }>
      disconnect?: () => Promise<void>
      signAndSendTransaction?: (input: {
        accounts?: WalletAccountLike[]
        transaction: Uint8Array
        options?: unknown
      }) => Promise<{ signature: string }>
    }
  >
}

type LegacySolanaProvider = {
  isNightly?: boolean
  isPhantom?: boolean
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey: { toBytes: () => Uint8Array; toBase58: () => string; toString: () => string }
  }>
  disconnect: () => Promise<void>
  signAndSendTransaction: (
    tx: unknown,
    opts?: unknown,
  ) => Promise<{ signature: string } | string>
  publicKey?: { toBytes: () => Uint8Array; toBase58: () => string }
}

function encodeBase58(bytes: Uint8Array): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let zeros = 0
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++
  const size = Math.ceil(((bytes.length - zeros) * 138) / 100) + 1
  const b = new Uint8Array(size)
  let length = 0
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i]
    let j = size - 1
    while (j >= 0 && (carry !== 0 || j >= size - length)) {
      carry += 256 * b[j]
      b[j] = carry % 58
      carry = (carry / 58) | 0
      j--
    }
    length = size - 1 - j
  }
  let str = '1'.repeat(zeros)
  for (let i = size - length; i < size; i++) str += ALPHABET[b[i]]
  return str
}

function pkToAddress(pk: {
  toBytes?: () => Uint8Array<ArrayBufferLike>
  toBase58?: () => string
  toString?: () => string
}): { address: string; publicKey: Uint8Array<ArrayBufferLike> } {
  const publicKey: Uint8Array<ArrayBufferLike> = pk.toBytes?.() ?? new Uint8Array()
  const address = pk.toBase58?.() ?? pk.toString?.() ?? encodeBase58(publicKey)
  return { address, publicKey }
}

export function detectNightly(): boolean {
  return Boolean(window.nightly?.solana || window.solana?.isNightly)
}

export async function connectNightlyWallet(): Promise<ConnectedWallet> {
  const nightly = window.nightly?.solana
  if (!nightly) {
    throw new Error(
      'Nightly wallet not found. Install Nightly (https://nightly.app) and enable Cookie Chain / Solana.',
    )
  }

  // Switch injected Nightly to Cookie Cluster when supported
  if (typeof nightly.changeNetwork === 'function') {
    try {
      await nightly.changeNetwork({
        genesisHash: COOKIE_CHAIN.genesisHash,
        url: COOKIE_CHAIN.rpcUrl,
      })
    } catch (e) {
      console.warn('Nightly changeNetwork skipped:', e)
    }
  }

  let address = ''
  let publicKey: Uint8Array<ArrayBufferLike> = new Uint8Array()

  const featureConnect = nightly.features?.['standard:connect']?.connect
  if (featureConnect) {
    const out = await featureConnect()
    const acct = out.accounts?.[0]
    if (!acct) throw new Error('Nightly connected but returned no accounts')
    address = acct.address
    publicKey = new Uint8Array(acct.publicKey)
  } else if (nightly.connect) {
    const res = await nightly.connect()
    if (res.publicKey) {
      const parsed = pkToAddress(res.publicKey)
      address = parsed.address
      publicKey = new Uint8Array(parsed.publicKey)
    } else if (res.accounts?.[0]) {
      address = res.accounts[0].address
      publicKey = new Uint8Array(res.accounts[0].publicKey)
    }
  } else {
    throw new Error('Nightly provider has no connect method')
  }

  if (!address) throw new Error('Could not read Nightly address')

  const signAndSendTransaction = async (txBytes: Uint8Array): Promise<string> => {
    const featureSend = nightly.features?.['solana:signAndSendTransaction']?.signAndSendTransaction
    if (featureSend) {
      const out = await featureSend({ transaction: txBytes })
      if (!out?.signature) throw new Error('Nightly returned empty signature')
      return out.signature
    }
    if (nightly.signAndSendTransaction) {
      // Many Nightly builds accept VersionedTransaction / Transaction objects;
      // callers pass serialized bytes — reconstruct via dynamic import in escrow module.
      const out = await nightly.signAndSendTransaction(txBytes)
      if (typeof out === 'string') return out
      if (out?.signature) return out.signature
      throw new Error('Nightly signAndSendTransaction returned no signature')
    }
    throw new Error('Nightly cannot signAndSendTransaction')
  }

  const disconnect = async () => {
    try {
      await nightly.features?.['standard:disconnect']?.disconnect?.()
    } catch {
      /* ignore */
    }
    try {
      await nightly.disconnect?.()
    } catch {
      /* ignore */
    }
  }

  return {
    name: 'Nightly',
    address,
    publicKey,
    signAndSendTransaction,
    disconnect,
  }
}

/** Optional fallback: Phantom / other injected Solana provider (still targets Cookie RPC). */
export async function connectInjectedSolana(): Promise<ConnectedWallet> {
  const provider = window.solana
  if (!provider) throw new Error('No injected Solana wallet found')
  const res = await provider.connect()
  const { address, publicKey } = pkToAddress(res.publicKey)
  return {
    name: provider.isNightly ? 'Nightly' : provider.isPhantom ? 'Phantom' : 'Solana Wallet',
    address,
    publicKey,
    signAndSendTransaction: async (txBytes: Uint8Array) => {
      const out = await provider.signAndSendTransaction(txBytes)
      if (typeof out === 'string') return out
      if (out?.signature) return out.signature
      throw new Error('Wallet returned empty signature')
    },
    disconnect: () => provider.disconnect(),
  }
}
