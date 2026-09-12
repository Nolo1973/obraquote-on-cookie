# Superteam Earn — Submission pack

**Listing:** [Create an App on Cookie Chain](https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app/)  
**Sponsor:** Cookie Chain · **Pool:** 1000 USDC (500 / 500)  
**Deadline:** ~2026-09-22 · **Winners by:** ~2026-09-28  
**agentAccess:** `HUMAN_ONLY` — submit as **Manuel Parodi** (human).

## Paste fields (Earn form)

### Eligibility answers

| Question | Answer (paste) |
|----------|----------------|
| **GitHub repository** | `REPLACE_AFTER_PUBLISH` — e.g. `https://github.com/<user>/obraquote-on-cookie` |
| **Relevant program, contract, token, or application addresses (if applicable)** | Memo program: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`. Cookie genesis: `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2`. RPC: `https://rpc.cookiescan.io`. App does not deploy a custom program in v1; escrow-intent uses SPL Memo + optional 0-lamport self-transfer. Live tx signature(s): `REPLACE_AFTER_FIRST_LIVE_TX`. |
| **Live application URL** | `REPLACE_AFTER_DEPLOY` — e.g. Vercel/Netlify/Cloudflare Pages URL of this repo |

### Main submission fields

| Field | Value |
|-------|-------|
| **link** | Same as Live application URL (or GitHub if form expects one primary link — prefer live app) |
| **tweet** | `REPLACE_AFTER_X_THREAD` — X thread URL demoing the cApp + Nightly + Cookie bridge mention |
| **otherInfo** | See block below |
| **telegram** | Optional for bounty; Cookie community: https://t.me/TheCookieNetChain |

### otherInfo (paste)

```
ObraQuote on Cookie — construction materials quote + escrow-intent cApp on Cookie Chain (SVM).

What: Cotización de revoque proyectable (Todo Proyectable / La Plata) with m², thickness, freight zones, and a USDC-intent amount. Anchors a SHA-256 quote hash on Cookie via SPL Memo (+ 0-lamport self-transfer) using Nightly wallet; demo/offline mode included.

Cookie: RPC https://rpc.cookiescan.io · genesis 9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2 · explorer cookiescan.io · Nightly connect + address display + tx confirm/error handling.

Stack: Vite + React + TypeScript + @solana/web3.js. No custom program deploy required for v1.

Human steps done/left: code + build ready locally; GitHub publish, static host deploy, Nightly live memo tx, X thread + share in Cookie Telegram still required before Earn submit.
```

## Demo checklist (human)

- [ ] Publish public GitHub repo (parent / Manuel)
- [ ] Deploy live URL (`npm run build` → static host)
- [ ] Install Nightly, switch to Cookie, submit one real memo tx, paste signature into addresses field
- [ ] Capture 3 screenshots → `docs/screenshots/*.png`
- [ ] X thread: what it does + how to use + Cookie Bridge link where relevant
- [ ] Share thread in Cookie Chain Telegram
- [ ] Submit on Earn as Manuel (HUMAN_ONLY)

## Local verify

```bash
cd cookie-chain-app
npm install && npm run build
```
