import type { Client } from 'xrpl'

/** Fetch a validated transaction by hash (used to read EscrowCreate fields for EscrowFinish). */
export async function fetchTransaction(client: Client, transactionHash: string) {
  return client.request({
    command: 'tx',
    transaction: transactionHash,
  })
}
