# ObraQuote on Cookie

**cApp for [Cookie Chain](https://www.cookiechain.wtf)** (SVM) — cotización de **revoque proyectable** (Todo Proyectable / La Plata) + **escrow-intent** anclado on-chain vía SPL Memo.

Built for Superteam Earn: [Create an App on Cookie Chain](https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app/) (1000 USDC pool).

## What it does

1. **Quote calculator** — m², espesor, material proyectable, merma, flete (La Plata / GBA), malla opcional → total ARS + **USDC intent** (demo FX, no real transfer).
2. **Cookie Chain status** — live probe of `https://rpc.cookiescan.io` (health, slot, genesis hash match).
3. **Nightly wallet** — connect Nightly (required by bounty), show address, switch network via Cookie **genesis hash** when the extension supports `changeNetwork`.
4. **Escrow intent tx** — SHA-256 of the quote → SPL Memo (`OBRAQUOTE|…`) + 0-lamport self-transfer on Cookie; confirmation + error handling. **Demo mode** works offline without a wallet.

No real money is required. Demo receipts are local; turn off Demo mode and connect Nightly to broadcast.

## Cookie Chain notes

| | |
|---|---|
| Network | Cookie Chain (Solana-compatible **SVM**) |
| Identifier | Genesis hash `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2` (not an EVM chainId) |
| RPC | `https://rpc.cookiescan.io` |
| Explorer | https://cookiescan.io |
| Docs | https://docs.cookiechain.wtf |
| API | https://api.cookiescan.io |
| Bridge | https://bridge.cookiescan.io |
| Native | COOK (9 decimals) |
| Wallet | [Nightly](https://nightly.app) (required) |

Point a custom RPC by editing the **Cookie RPC** field in the header (persists for the session). Config lives in `src/cookie/network.ts`.

### How to point wallets / CLI at Cookie

```bash
# Solana CLI example
solana config set --url https://rpc.cookiescan.io

# Verify genesis
curl -s https://rpc.cookiescan.io -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
# expect: 9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2
```

In Nightly, select / add Cookie Chain (or allow the dApp `changeNetwork` call with the genesis hash above).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle → dist/
npm run preview  # serve dist/
```

**Requirements:** Node 20+ recommended. Browser with [Nightly](https://nightly.app) for live txs.

## Screenshots

Place PNGs under `docs/screenshots/`:

| File | Content |
|------|---------|
| `docs/screenshots/01-home.png` | Home / quote form + Cookie status |
| `docs/screenshots/02-wallet.png` | Nightly connected + address |
| `docs/screenshots/03-escrow.png` | Escrow intent receipt / CookieScan |

Placeholders (`.txt`) are checked in until you capture real shots.

## Project layout

```
src/
  cookie/     # network config, Nightly wallet, escrow memo tx
  quote/      # materials catalog + calculator
  components/ # UI panels
```

## Addresses / programs used

- **Memo program:** `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` (SPL Memo — Solana-compatible)
- No custom program deploy in v1 (intent is client-side memo + hash)
- Application addresses: _(fill after deploy / first live tx)_

## Optional ecosystem

Ready to extend with [Cookiebox](https://cookiebox.app/), [Cookieswap](https://cookieswap.fun/), [api.cookiescan.io](https://api.cookiescan.io/), [cookie-mcp](https://github.com/cookiechain/cookie-mcp).

## License

MIT — submit-ready demo for Earn; commercial quotes remain with Todo Proyectable / Alpeba.
