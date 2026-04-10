import { Client, Wallet, type EscrowFinish } from 'xrpl'
import { XRPL_TESTNET_WSS } from './constants'
import { fetchTransaction } from './lookupTxHash'

export type FulfillEscrowResult = {
  success: boolean
  message: string
  engineResult?: string
}

function extractEngineResult(meta: unknown): string | undefined {
  if (meta && typeof meta === 'object' && 'TransactionResult' in meta) {
    const tr = (meta as { TransactionResult?: unknown }).TransactionResult
    return typeof tr === 'string' ? tr : undefined
  }
  return undefined
}

/** User-facing copy when tesSUCCESS. */
export const FULFILL_SUCCESS_MESSAGE =
  'Escrow fulfilled; funds were sent to the destination account (per EscrowCreate).'

/**
 * Finish an escrow using the fulfillment hex from `createEscrow` and the EscrowCreate tx hash.
 */
export async function fulfillEscrow(
  walletSeed: string,
  escrowCreateTxHash: string,
  fulfillmentHex: string,
  wssUrl: string = XRPL_TESTNET_WSS,
): Promise<FulfillEscrowResult> {
  const wallet = Wallet.fromSeed(walletSeed)
  const client = new Client(wssUrl)

  await client.connect()
  try {
    const escrowTx = await fetchTransaction(client, escrowCreateTxHash)
    const created = escrowTx.result

    if (created.TransactionType !== 'EscrowCreate') {
      throw new Error(
        `Expected an EscrowCreate transaction, got ${String(created.TransactionType)}.`,
      )
    }

    const owner = created.Account
    const sequence = created.Sequence
    const condition = created.Condition

    if (typeof owner !== 'string' || typeof sequence !== 'number' || typeof condition !== 'string') {
      throw new Error(
        'EscrowCreate transaction is missing Account, Sequence, or Condition (conditional escrows require Condition).',
      )
    }

    const finishTx: EscrowFinish = {
      TransactionType: 'EscrowFinish',
      Account: wallet.classicAddress,
      Owner: owner,
      OfferSequence: sequence,
      Condition: condition,
      Fulfillment: fulfillmentHex,
    }

    const prepared = await client.autofill(finishTx)
    const signed = wallet.sign(prepared)
    const response = await client.submitAndWait(signed.tx_blob)
    const code = extractEngineResult(response.result.meta)

    if (code === 'tesSUCCESS') {
      return { success: true, message: FULFILL_SUCCESS_MESSAGE, engineResult: code }
    }

    return {
      success: false,
      message:
        'EscrowFinish was not successful (wrong fulfillment, expired cancel time, or bad sequence).',
      engineResult: code,
    }
  } finally {
    await client.disconnect()
  }
}
