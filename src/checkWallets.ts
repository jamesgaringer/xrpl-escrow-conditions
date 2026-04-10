import { Client, Wallet } from 'xrpl'
import { XRPL_TESTNET_WSS } from './constants'

export type WalletAccountSnapshot = {
  classicAddress: string
  balanceXrp: string
  sequence: number
}

function toSnapshot(
  account: string,
  data: { Balance?: string; Sequence?: number } | undefined,
): WalletAccountSnapshot {
  if (!data?.Balance || data.Sequence === undefined) {
    throw new Error(`account_info missing fields for ${account}`)
  }
  const drops = BigInt(data.Balance)
  const xrp = Number(drops) / 1_000_000
  return {
    classicAddress: account,
    balanceXrp: xrp.toString(),
    sequence: data.Sequence,
  }
}

/** Fetch validated `account_info` for two seeds (handy for testnet faucet checks). */
export async function fetchTwoWalletSnapshots(
  seedA: string,
  seedB: string,
  wssUrl: string = XRPL_TESTNET_WSS,
): Promise<{ walletA: WalletAccountSnapshot; walletB: WalletAccountSnapshot }> {
  const walletA = Wallet.fromSeed(seedA)
  const walletB = Wallet.fromSeed(seedB)
  const client = new Client(wssUrl)

  await client.connect()
  try {
    const [resA, resB] = await Promise.all([
      client.request({
        command: 'account_info',
        account: walletA.classicAddress,
        ledger_index: 'validated',
      }),
      client.request({
        command: 'account_info',
        account: walletB.classicAddress,
        ledger_index: 'validated',
      }),
    ])

    return {
      walletA: toSnapshot(walletA.classicAddress, resA.result.account_data),
      walletB: toSnapshot(walletB.classicAddress, resB.result.account_data),
    }
  } finally {
    await client.disconnect()
  }
}
