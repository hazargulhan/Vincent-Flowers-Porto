import { describe, it, expect } from 'vitest'
import { toIsoDate, fromIsoDate, minDeliveryDate, formatDate } from './dates'

describe('Date utilities (dates.ts)', () => {
  it('converts Date to YYYY-MM-DD local format without UTC shifting', () => {
    // January 15, 2026 at 23:30 (late evening)
    const d = new Date(2026, 0, 15, 23, 30, 0)
    expect(toIsoDate(d)).toBe('2026-01-15')
  })

  it('parses YYYY-MM-DD string to valid local Date object', () => {
    const d = fromIsoDate('2026-05-20')
    expect(d).toBeInstanceOf(Date)
    expect(d?.getFullYear()).toBe(2026)
    expect(d?.getMonth()).toBe(4) // 0-indexed May
    expect(d?.getDate()).toBe(20)
  })

  it('returns undefined for empty or invalid ISO date strings', () => {
    expect(fromIsoDate('')).toBeUndefined()
    expect(fromIsoDate('invalid-date')).toBeUndefined()
  })

  it('calculates minDeliveryDate to be at least tomorrow midnight', () => {
    const min = minDeliveryDate()
    const now = new Date()
    expect(min.getTime()).toBeGreaterThan(now.getTime())
    expect(min.getHours()).toBe(0)
    expect(min.getMinutes()).toBe(0)
    expect(min.getSeconds()).toBe(0)
  })

  it('formats dates into long human-readable strings for EN and PT', () => {
    // 2026-12-24
    const enFormatted = formatDate('2026-12-24', 'en')
    expect(enFormatted).toContain('24')
    expect(enFormatted).toContain('December')
    expect(enFormatted).toContain('2026')

    const ptFormatted = formatDate('2026-12-24', 'pt')
    expect(ptFormatted).toContain('24')
    expect(ptFormatted).toContain('dezembro')
    expect(ptFormatted).toContain('2026')
  })

  it('gracefully falls back to raw string on malformed date input', () => {
    expect(formatDate('not-a-date', 'en')).toBe('not-a-date')
  })
})
