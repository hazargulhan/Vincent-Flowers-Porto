import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { getLocalizedPath } from '../lib/locale'

export const COOKIE_CONSENT_KEY = 'vfp_cookie_consent'

export default function CookieBanner() {
  const { t, i18n } = useTranslation()
  const [visible, setVisible] = useState(false)
  const isPt = i18n.language.startsWith('pt')

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!saved) {
      // Small delay so it appears smoothly after initial load
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }

    const handleOpenPreferences = () => setVisible(true)
    window.addEventListener('vfp_open_cookie_banner', handleOpenPreferences)
    return () => window.removeEventListener('vfp_open_cookie_banner', handleOpenPreferences)
  }, [])

  const handleChoice = (choice: 'accepted' | 'essential') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      className="cookie-banner"
      role="region"
      aria-label={t('cookies.title')}
    >
      <div className="cookie-banner-content">
        <div className="cookie-banner-title">
          <ShieldCheck size={18} style={{ color: 'var(--accent-color)' }} />
          <strong>{t('cookies.title')}</strong>
        </div>
        <p className="cookie-banner-text">
          {t('cookies.message')}{' '}
          <Link to={getLocalizedPath('/privacy', isPt)} className="cookie-banner-link">
            {t('cookies.learn_more')}
          </Link>
        </p>
      </div>
      <div className="cookie-banner-actions">
        <button
          type="button"
          onClick={() => handleChoice('essential')}
          className="cookie-btn-secondary"
        >
          {t('cookies.essential')}
        </button>
        <button
          type="button"
          onClick={() => handleChoice('accepted')}
          className="cookie-btn-primary"
        >
          {t('cookies.accept')}
        </button>
      </div>
    </aside>
  )
}
