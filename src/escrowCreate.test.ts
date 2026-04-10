import { describe, expect, it } from 'vitest'
import { Wallet } from 'xrpl'
import { buildEscrowCreateTransaction, createEscrow } from './escrowCreate'

describe('buildEscrowCreateTransaction', () => {
  it('builds EscrowCreate with drops string and condition', () => {
    const wallet = Wallet.generate()
    const condition =
      'A0258020' +
      'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855' +
      '810100'

    const tx = buildEscrowCreateTransaction(wallet, wallet.classicAddress, 2.5, 3, condition)

    expect(tx.TransactionType).toBe('EscrowCreate')
    expect(tx.Account).toBe(wallet.classicAddress)
    expect(tx.Destination).toBe(wallet.classicAddress)
    expect(tx.Amount).toBe('2500000')
    expect(tx.Condition).toBe(condition)
    expect(typeof tx.CancelAfter).toBe('number')
  })

  it('rejects non-positive amount', () => {
    const wallet = Wallet.generate()
    expect(() =>
      buildEscrowCreateTransaction(wallet, wallet.classicAddress, 0, 1, 'AB'),
    ).toThrow(/amountXrp/)
  })
})

describe('createEscrow (integration)', () => {
  it('skips without funded testnet wallet', async () => {
    const seed = process.env.INTEGRATION_TEST_SEED
    const dest = process.env.INTEGRATION_DESTINATION

    if (!seed || !dest) {
      return
    }

    const result = await createEscrow(seed, dest, 0.000001, 1)
    expect(result.escrowHash).toMatch(/^[A-F0-9]{64}$/)
    expect(result.fulfillment).toMatch(/^[0-9A-F]+$/)
  })
})
