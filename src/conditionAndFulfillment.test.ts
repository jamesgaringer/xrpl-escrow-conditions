import { describe, expect, it, vi } from 'vitest'
import { createConditionAndFulfillment } from './conditionAndFulfillment'
import crypto from 'crypto'

describe('createConditionAndFulfillment', () => {
  it('returns uppercase hex condition and fulfillment', () => {
    const pair = createConditionAndFulfillment()
    expect(pair.condition).toMatch(/^[0-9A-F]+$/)
    expect(pair.fulfillment).toMatch(/^[0-9A-F]+$/)
    expect(pair.condition.length).toBeGreaterThan(32)
    expect(pair.fulfillment.length).toBeGreaterThan(32)
  })

  it('is deterministic when random bytes are fixed', () => {
    const fixed = Buffer.alloc(32, 0xab)
    vi.spyOn(crypto, 'randomBytes').mockReturnValue(fixed as Buffer)
    const a = createConditionAndFulfillment()
    const b = createConditionAndFulfillment()
    expect(a).toEqual(b)
    vi.restoreAllMocks()
  })
})
