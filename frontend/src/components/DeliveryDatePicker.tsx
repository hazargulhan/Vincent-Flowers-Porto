import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { enGB, pt } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { useTranslation } from 'react-i18next'
import type { ClosurePeriod } from '../types/order'
import ClosureNotice from './ClosureNotice'
import { formatDate, fromIsoDate, toIsoDate } from '../lib/dates'

interface DeliveryDatePickerProps {
  value: string
  onChange: (value: string) => void
  minDate: Date
  closures: ClosurePeriod[]
  closureMessage: (closure: ClosurePeriod, lang: string) => string
  /** Closure data still in flight — block selection so no closed day looks available. */
  loading?: boolean
}

export default function DeliveryDatePicker({
  value,
  onChange,
  minDate,
  closures,
  closureMessage,
  loading = false,
}: DeliveryDatePickerProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const minIso = toIsoDate(minDate)

  const isDateDisabled = (date: Date): boolean => {
    const iso = toIsoDate(date)
    if (iso < minIso) return true
    return closures.some(c => c.startDate && c.endDate && iso >= c.startDate && iso <= c.endDate)
  }

  // Close on outside click and on Escape, returning focus to the toggle.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="delivery-date-picker" ref={containerRef}>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="date-picker-toggle"
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={loading}
        style={{ width: '100%', textAlign: 'left', padding: '0.8rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit' }}
      >
        {value ? formatDate(value, i18n.language) : t('common.select_date')}
      </button>

      {open && (
        <div style={{ marginTop: '0.5rem', border: '1px solid var(--border-color)', padding: '0.5rem', background: 'var(--bg-color)' }}>
          <DayPicker
            mode="single"
            locale={i18n.language.startsWith('pt') ? pt : enGB}
            selected={fromIsoDate(value)}
            onSelect={(date) => {
              if (date) {
                onChange(toIsoDate(date))
                setOpen(false)
                toggleRef.current?.focus()
              }
            }}
            disabled={isDateDisabled}
            startMonth={minDate}
          />
          {closures.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              <ClosureNotice closures={closures} closureMessage={closureMessage} compact />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
