import { describe, expect, it } from 'vitest'
import { unixSecondsToRippleTime, cancelAfterRippleTimeFromNow } from './time'
import { RIPPLE_EPOCH_UNIX_OFFSET } from './constants'

describe('unixSecondsToRippleTime', () => {
  it('maps Ripple epoch start to 0', () => {
    expect(unixSecondsToRippleTime(RIPPLE_EPOCH_UNIX_OFFSET)).toBe(0)
  })

  it('is one second ahead for unix+1', () => {
    expect(unixSecondsToRippleTime(RIPPLE_EPOCH_UNIX_OFFSET + 1)).toBe(1)
  })
})

describe('cancelAfterRippleTimeFromNow', () => {
  it('returns a finite Ripple time in the future', () => {
    const t = cancelAfterRippleTimeFromNow(1)
    const nowRipple = unixSecondsToRippleTime(Math.floor(Date.now() / 1000))
    expect(t).toBeGreaterThan(nowRipple)
  })
})
