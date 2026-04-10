# XRPL conditional escrows (testnet)

Small TypeScript utilities to build **PREIMAGE-SHA-256** conditions with [`five-bells-condition`](https://github.com/interledgerjs/five-bells-condition), submit **`EscrowCreate`** on the [XRPL](https://xrpl.org/), and complete the hold with **`EscrowFinish`** when you have the fulfillment preimage.

## Prerequisites

- Node.js **18.18+**
- Two funded **testnet** accounts ([faucet](https://xrpl.org/xrp-testnet-faucet.html))

**Security:** Never commit wallet seeds or `.env`. Copy `.env.example` to `.env` and keep it local. If seeds were ever pushed to a public remote, treat them as compromised and use new testnet wallets.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Consuming projects can depend on this package and import from `dist/` after build, or copy the `src/` patterns into their own codebase.

## API

### `createEscrow(initiatorSeed, destinationAddress, amountXrp, cancelAfterHours, wssUrl?)`

Creates a conditional escrow from the initiator’s balance toward `destinationAddress`. Returns:

- `escrowHash` — ledger hash of the `EscrowCreate` (needed for finish)
- `fulfillment` — hex fulfillment (“password”); **keep private** until you intend to release funds

On failure, throws with the engine result (e.g. not enough XRP, bad destination).

### `fulfillEscrow(walletSeed, escrowCreateTxHash, fulfillmentHex, wssUrl?)`

Submits `EscrowFinish` signed by `walletSeed` (any funded account can pay the fee). Uses the **EscrowCreate** transaction hash to load `Owner`, `Sequence`, and `Condition` from the ledger.

Returns `{ success, message, engineResult? }` instead of throwing on `tec`/`tel` outcomes so you can branch in application code.

### Other exports

- `createConditionAndFulfillment()` — condition/fulfillment pair only (no ledger I/O)
- `buildEscrowCreateTransaction(...)` — unsigned `EscrowCreate` JSON (for tests or custom signing)
- `fetchTransaction(client, hash)` — `tx` request helper
- `fetchTwoWalletSnapshots(seedA, seedB)` — validated balances for two seeds
- `XRPL_TESTNET_WSS` — default `wss://s.altnet.rippletest.net/`

## Example script

After `npm run build`:

```bash
cp .env.example .env
# edit .env with testnet seed + destination r-address
npm run example
```

Uncomment the `createEscrow` / `fulfillEscrow` blocks in [`src/example.ts`](src/example.ts) when you are ready to hit the network.

## Development

| Command        | Description                |
| -------------- | -------------------------- |
| `npm run lint` | ESLint (TypeScript-aware)  |
| `npm test`     | Vitest unit tests          |
| `npm run build`| `tsc` → `dist/`            |

Optional on-ledger test: set `INTEGRATION_TEST_SEED` and `INTEGRATION_DESTINATION` in the environment, then run `npm test` (creates a minimal escrow on testnet).

## Dependencies

This project uses [`xrpl`](https://github.com/XRPLF/xrpl.js) **v2.x**. `npm audit` may still report low-severity advisories in transitive crypto libraries; upgrading to **xrpl v4+** is the upstream path if you need a clean audit report.

## License

MIT — see [LICENSE](LICENSE).
