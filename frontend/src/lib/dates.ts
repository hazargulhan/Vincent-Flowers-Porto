/** Shared date helpers. Previously duplicated in useClosures, DeliveryDatePicker, Home and Shop. */

/** Local-time YYYY-MM-DD. Deliberately not toISOString() alone, which would shift the day in UTC+N. */
export function toIsoDate(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
}

/** Parse a YYYY-MM-DD string as a local-time Date (not UTC midnight). */
export function fromIsoDate(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

/** Today, local time, as YYYY-MM-DD. */
export function todayIso(): string {
  return toIsoDate(new Date())
}

/** Earliest date an order may be placed for: tomorrow, local time, at midnight. */
export function minDeliveryDate(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Human-readable, localised date: "24 December 2026" / "24 de dezembro de 2026".
 *
 * dateStyle 'long' is used deliberately: the numeric pt-PT form (24/12/2026) is
 * ambiguous against the US order for international customers, and month names read
 * unmistakably in both languages. Falls back to the raw string if it cannot be
 * parsed, so a malformed stored value never shows a customer "Invalid Date".
 */
export function formatDate(iso: string, lang: string): string {
  const date = fromIsoDate(iso)
  if (!date || Number.isNaN(date.getTime())) return iso
  const locale = lang.startsWith('pt') ? 'pt-PT' : 'en-GB'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
}
