/**
 * Escrow-intent on Cookie Chain: hash a quote and anchor it via SPL Memo
 * (optional tiny self-transfer for a clear on-chain receipt). Demo mode OK.
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { COOKIE_CHAIN } from './network'
import type { ConnectedWallet } from './wallet'
import type { QuoteResult } from '../quote/calc'
import { quotePayloadForHash, sha256Hex } from '../quote/calc'
import { Buffer } from 'buffer'

export type EscrowIntentResult = {
  mode: 'onchain' | 'demo'
  quoteId: string
  quoteHash: string
  memo: string
  intentUsdc: number
  signature: string
  explorerUrl: string
  confirmed: boolean
  status: string
  error?: string
}

function getConnection(rpcUrl: string = COOKIE_CHAIN.rpcUrl): Connection {
  return new Connection(rpcUrl, 'confirmed')
}

export async function buildEscrowMemo(quote: QuoteResult): Promise<{
  quoteHash: string
  memo: string
  payload: string
}> {
  const payload = quotePayloadForHash(quote)
  const quoteHash = await sha256Hex(payload)
  const memo = `OBRAQUOTE|v1|${quote.id}|usdc:${quote.intentUsdc}|sha256:${quoteHash.slice(0, 32)}`
  return { quoteHash, memo, payload }
}

/**
 * Send memo (+ optional 0-lamport self-transfer) on Cookie Chain via connected wallet.
 * Falls back to deterministic demo signature when `demoMode` or wallet/RPC fails.
 */
export async function submitEscrowIntent(opts: {
  quote: QuoteResult
  wallet: ConnectedWallet | null
  demoMode: boolean
  rpcUrl?: string
}): Promise<EscrowIntentResult> {
  const { quote, wallet, demoMode } = opts
  const rpcUrl = opts.rpcUrl ?? COOKIE_CHAIN.rpcUrl
  const { quoteHash, memo } = await buildEscrowMemo(quote)
  const base = {
    quoteId: quote.id,
    quoteHash,
    memo,
    intentUsdc: quote.intentUsdc,
  }

  if (demoMode || !wallet) {
    const demoSig = await demoSignature(quoteHash, memo)
    return {
      ...base,
      mode: 'demo',
      signature: demoSig,
      explorerUrl: `${COOKIE_CHAIN.explorerUrl}/tx/${demoSig}`,
      confirmed: true,
      status: 'Demo receipt (offline) — switch off Demo mode + connect Nightly to broadcast on Cookie.',
    }
  }

  try {
    const connection = getConnection(rpcUrl)
    const payer = new PublicKey(wallet.address)
    const memoIx = new TransactionInstruction({
      keys: [{ pubkey: payer, isSigner: true, isWritable: true }],
      programId: new PublicKey(COOKIE_CHAIN.memoProgramId),
      data: Buffer.from(memo, 'utf8'),
    })
    // Tiny self-transfer keeps a clear SystemProgram interaction on explorers
    const transferIx = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: payer,
      lamports: 0,
    })

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    const tx = new Transaction({
      feePayer: payer,
      blockhash,
      lastValidBlockHeight,
    })
    tx.add(memoIx, transferIx)

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })

    let signature: string
    try {
      signature = await wallet.signAndSendTransaction(serialized)
    } catch {
      // Some wallets expect a Transaction object via window.nightly.solana
      signature = await signWithInjectedTransaction(tx)
    }

    let confirmed = false
    let status = 'Submitted — waiting for confirmation…'
    try {
      const conf = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed',
      )
      if (conf.value.err) {
        return {
          ...base,
          mode: 'onchain',
          signature,
          explorerUrl: `${COOKIE_CHAIN.explorerUrl}/tx/${signature}`,
          confirmed: false,
          status: 'Transaction landed with error',
          error: JSON.stringify(conf.value.err),
        }
      }
      confirmed = true
      status = 'Confirmed on Cookie Chain'
    } catch (e) {
      status = `Submitted; confirmation pending (${e instanceof Error ? e.message : String(e)})`
    }

    return {
      ...base,
      mode: 'onchain',
      signature,
      explorerUrl: `${COOKIE_CHAIN.explorerUrl}/tx/${signature}`,
      confirmed,
      status,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const demoSig = await demoSignature(quoteHash, memo)
    return {
      ...base,
      mode: 'demo',
      signature: demoSig,
      explorerUrl: `${COOKIE_CHAIN.explorerUrl}/tx/${demoSig}`,
      confirmed: false,
      status: 'Fell back to demo receipt after on-chain error',
      error: msg,
    }
  }
}

async function signWithInjectedTransaction(tx: Transaction): Promise<string> {
  const nightly = window.nightly?.solana as
    | {
        signAndSendTransaction?: (t: Transaction) => Promise<{ signature?: string } | string>
      }
    | undefined
  const legacy = window.solana as
    | {
        signAndSendTransaction?: (t: Transaction) => Promise<{ signature?: string } | string>
      }
    | undefined
  const provider = nightly?.signAndSendTransaction ? nightly : legacy
  if (!provider?.signAndSendTransaction) {
    throw new Error('No injected signAndSendTransaction for Transaction object')
  }
  const out = await provider.signAndSendTransaction(tx)
  if (typeof out === 'string') return out
  if (out?.signature) return out.signature
  throw new Error('Empty signature from injected wallet')
}

async function demoSignature(quoteHash: string, memo: string): Promise<string> {
  const hex = await sha256Hex(`demo|${quoteHash}|${memo}|cookie`)
  // Fake base58-ish sig for UI (not a real Solana signature)
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let out = 'Demo'
  for (let i = 0; i < hex.length && out.length < 64; i += 2) {
    const n = parseInt(hex.slice(i, i + 2), 16) % alphabet.length
    out += alphabet[n]
  }
  return out
}
