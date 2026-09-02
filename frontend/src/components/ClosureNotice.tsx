import { useTranslation } from 'react-i18next'
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
 *
 * Deliberately plain: no emoji, no tinted panel, no rounded corners — the site is a
 * square-cornered, single-weight serif design, so the notice is just a thin left rule
 * and a quiet uppercase label, matching the callout cards on the B2B page. The date
 * range is rendered through the i18n sentence ("Closed from X to Y"), so no arrows or
 * symbols appear, and the dates themselves are localised.
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
            className={`closure-notice__item${isActive ? '' : ' closure-notice__item--upcoming'}`}
          >
            <span className="closure-notice__label">
              {isActive ? t('common.closure_notice_title') : t('common.closure_notice_title_upcoming')}
            </span>
            <p className="closure-notice__message">{closureMessage(c, i18n.language)}</p>
            <span className="closure-notice__dates">
              {t('common.closure_notice_dates', {
                start: formatDate(c.startDate, i18n.language),
                end: formatDate(c.endDate, i18n.language),
              })}
            </span>
            {isActive && !compact && (
              <span className="closure-notice__dates">{t('common.closure_notice_hint')}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
