import { Client, Wallet, type EscrowCreate } from 'xrpl'
import { createConditionAndFulfillment } from './conditionAndFulfillment'
import { XRPL_TESTNET_WSS } from './constants'
import { cancelAfterRippleTimeFromNow } from './time'

function xrpToDropsString(amountXrp: number): string {
  if (!Number.isFinite(amountXrp) || amountXrp <= 0) {
    throw new Error('amountXrp must be a finite number > 0')
  }
  const drops = Math.round(amountXrp * 1_000_000)
  if (drops < 1) {
    throw new Error('amountXrp is too small to represent in drops')
  }
  return drops.toString()
}

/** Build an unsigned EscrowCreate transaction (for testing and advanced flows). */
export function buildEscrowCreateTransaction(
  wallet: Wallet,
  destinationAddress: string,
  amountXrp: number,
  cancelAfterHours: number,
  conditionHex: string,
): EscrowCreate {
  if (cancelAfterHours <= 0 || !Number.isFinite(cancelAfterHours)) {
    throw new Error('cancelAfterHours must be a finite number > 0')
  }

  return {
    TransactionType: 'EscrowCreate',
    Account: wallet.classicAddress,
    Amount: xrpToDropsString(amountXrp),
    Destination: destinationAddress,
    CancelAfter: cancelAfterRippleTimeFromNow(cancelAfterHours),
    Condition: conditionHex,
  }
}

export type CreateEscrowResult = {
  escrowHash: string
  fulfillment: string
}

function extractEngineResult(meta: unknown): string | undefined {
  if (meta && typeof meta === 'object' && 'TransactionResult' in meta) {
    const tr = (meta as { TransactionResult?: unknown }).TransactionResult
    return typeof tr === 'string' ? tr : undefined
  }
  return undefined
}

/**
 * Create a conditional testnet escrow: returns the tx hash and fulfillment hex.
 * The fulfillment acts like a password — store it securely; it releases the funds when used with `fulfillEscrow`.
 */
export async function createEscrow(
  initiatingWalletSeed: string,
  destinationAddress: string,
  amountXrp: number,
  cancelAfterHours: number,
  wssUrl: string = XRPL_TESTNET_WSS,
): Promise<CreateEscrowResult> {
  const wallet = Wallet.fromSeed(initiatingWalletSeed)
  const { condition, fulfillment } = createConditionAndFulfillment()
  const client = new Client(wssUrl)

  await client.connect()
  try {
    const tx = buildEscrowCreateTransaction(
      wallet,
      destinationAddress,
      amountXrp,
      cancelAfterHours,
      condition,
    )
    const prepared = await client.autofill(tx)
    const signed = wallet.sign(prepared)
    const response = await client.submitAndWait(signed.tx_blob)
    const meta = response.result.meta
    const code = extractEngineResult(meta)

    if (code !== 'tesSUCCESS') {
      throw new Error(
        `EscrowCreate failed: ${code ?? 'unknown'} — ${JSON.stringify(response.result)}`,
      )
    }

    return { escrowHash: signed.hash, fulfillment }
  } finally {
    await client.disconnect()
  }
}
