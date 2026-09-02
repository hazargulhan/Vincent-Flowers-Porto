import { useEffect, useMemo, useState } from 'react'
import type { ClosurePeriod } from '../types/order'
import { todayIso } from '../lib/dates'
import { apiUrl } from '../lib/api'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * A closure is only usable if both ends are real dates in the right order.
 *
 * This guard is load-bearing: in JavaScript `'2026-08-26' >= ''` is true, so a row
 * saved with an empty startDate would otherwise match every date since the beginning
 * of time and silently close the whole shop. A reversed range (start > end) matches
 * nothing, which is the opposite failure — the owner goes on holiday and orders keep
 * coming in. Both are dropped here rather than trusted.
 */
function isValidClosure(c: ClosurePeriod): boolean {
  return (
    !!c &&
    ISO_DATE.test(c.startDate || '') &&
    ISO_DATE.test(c.endDate || '') &&
    c.startDate <= c.endDate
  )
}

export function useClosures() {
  const [rawClosures, setRawClosures] = useState<ClosurePeriod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(apiUrl('/api/closures'))
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        setRawClosures(Array.isArray(data) ? data.filter(isValidClosure) : [])
      })
      .catch(() => {
        if (!cancelled) setRawClosures([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const today = todayIso()

  /** Valid closures that have not already finished — the only ones worth showing or enforcing. */
  const closures = useMemo(
    () => rawClosures
      .filter(c => c.endDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [rawClosures, today]
  )

  const closureForDate = (dateStr: string): ClosurePeriod | undefined => {
    if (!dateStr) return undefined
    return closures.find(c => dateStr >= c.startDate && dateStr <= c.endDate)
  }

  const isDateBlocked = (dateStr: string): boolean => !!closureForDate(dateStr)

  /** A closure covering today — the shop is shut right now. */
  const activeClosure = closureForDate(today)

  /** Closures that have not started yet — shown as advance warning. */
  const upcomingClosures = useMemo(
    () => closures.filter(c => c.startDate > today),
    [closures, today]
  )

  const closureMessage = (closure: ClosurePeriod, lang: string): string => {
    return lang.startsWith('pt') ? closure.messagePt : closure.messageEn
  }

  return {
    closures,
    loading,
    isDateBlocked,
    closureForDate,
    activeClosure,
    upcomingClosures,
    closureMessage,
  }
}
