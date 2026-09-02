import { useTranslation } from 'react-i18next'
import { AlertCircle, Calendar } from 'lucide-react'
import type { ClosurePeriod } from '../types/order'
import { formatDate, todayIso } from '../lib/dates'

interface ClosureNoticeProps {
  /** Already filtered by useClosures to valid, not-yet-finished periods. */
  closures: ClosurePeriod[]
  closureMessage: (closure: ClosurePeriod, lang: string) => string
  /** Tighter type scale for use inside the date picker dropdown. */
  compact?: boolean
}

/**
 * Holiday / closed-period notice.
 * Distinct, high-visibility callout card with brand-aligned typography and clear icons.
 */
export default function ClosureNotice({ closures, closureMessage, compact = false }: ClosureNoticeProps) {
  const { t, i18n } = useTranslation()

  if (closures.length === 0) return null

  const today = todayIso()

  return (
    <div className={`closure-notice${compact ? ' closure-notice--compact' : ''}`}>
      {closures.map(c => {
        const isActive = today >= c.startDate && today <= c.endDate
        return (
          <div
            key={c.id}
            className={`closure-notice__item${isActive ? ' closure-notice__item--active' : ' closure-notice__item--upcoming'}`}
          >
            <div className="closure-notice__header">
              <span className="closure-notice__badge">
                <AlertCircle size={compact ? 14 : 16} />
                {isActive ? t('common.closure_notice_title') : t('common.closure_notice_title_upcoming')}
              </span>
            </div>
            <p className="closure-notice__message">{closureMessage(c, i18n.language)}</p>
            <div className="closure-notice__dates">
              <Calendar size={compact ? 13 : 15} />
              <span>
                {t('common.closure_notice_dates', {
                  start: formatDate(c.startDate, i18n.language),
                  end: formatDate(c.endDate, i18n.language),
                })}
              </span>
            </div>
            {isActive && !compact && (
              <p className="closure-notice__hint">{t('common.closure_notice_hint')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
