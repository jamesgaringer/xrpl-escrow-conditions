/**
 * Optional demo script: copy `.env.example` to `.env`, fund testnet wallets, then uncomment a block.
 *
 * Run after build: `node dist/example.js`
 */
import 'dotenv/config'
import { fetchTwoWalletSnapshots } from './checkWallets'
// import { createEscrow, fulfillEscrow } from './index'

async function main(): Promise<void> {
  const initiator = process.env.INITIATOR_SEED
  const destination = process.env.DESTINATION_ADDRESS
  const peer = process.env.SECOND_WALLET_SEED

  if (!initiator || !destination) {
    console.info(
      'Copy .env.example to .env and set INITIATOR_SEED and DESTINATION_ADDRESS (testnet only).',
    )
    return
  }

  // --- Check balances (optional second seed) ---
  if (peer) {
    const snap = await fetchTwoWalletSnapshots(initiator, peer)
    console.info('Wallet snapshots:', snap)
  }

  // --- Create escrow (uncomment import + block) ---
  // const { createEscrow } = await import('./index')
  // const created = await createEscrow(initiator, destination, 1, 24)
  // console.info('Created escrow:', created)

  // --- Fulfill escrow (uncomment import + block) ---
  // const { fulfillEscrow } = await import('./index')
  // const done = await fulfillEscrow(
  //   initiator,
  //   'YOUR_ESCROW_CREATE_TX_HASH',
  //   'YOUR_FULFILLMENT_HEX',
  // )
  // console.info(done)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exitCode = 1
})
