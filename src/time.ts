import { RIPPLE_EPOCH_UNIX_OFFSET } from './constants'

/** Convert a Unix time in seconds to XRPL ledger time (seconds since Ripple epoch). */
export function unixSecondsToRippleTime(unixSeconds: number): number {
  return Math.floor(unixSeconds) - RIPPLE_EPOCH_UNIX_OFFSET
}

/** `CancelAfter` value for an escrow that expires N hours from now. */
export function cancelAfterRippleTimeFromNow(hoursFromNow: number): number {
  const unixNow = Math.floor(Date.now() / 1000)
  const cancelUnix = unixNow + hoursFromNow * 60 * 60
  return unixSecondsToRippleTime(cancelUnix)
}
