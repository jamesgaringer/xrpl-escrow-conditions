import crypto from 'crypto'
import { PreimageSha256 } from 'five-bells-condition'

export type ConditionPair = {
  /** Hex condition placed on `EscrowCreate` (public). */
  condition: string
  /** Hex fulfillment preimage proof — keep secret until release (same as "password"). */
  fulfillment: string
}

/**
 * Build a PREIMAGE-SHA-256 condition and matching fulfillment for XRPL conditional escrows.
 * Anyone with `fulfillment` can finish the escrow (before cancel time) if they pay the fee.
 */
export function createConditionAndFulfillment(): ConditionPair {
  const preimage = crypto.randomBytes(32)
  const fulfillmentObj = new PreimageSha256()
  fulfillmentObj.setPreimage(preimage)

  const condition = fulfillmentObj.getConditionBinary().toString('hex').toUpperCase()
  const fulfillment = fulfillmentObj.serializeBinary().toString('hex').toUpperCase()

  return { condition, fulfillment }
}
