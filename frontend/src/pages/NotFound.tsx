import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'

const linkStyle: React.CSSProperties = {
  padding: '0.9rem 1.8rem',
  border: '1px solid var(--text-color)',
  color: 'var(--text-color)',
  textDecoration: 'none',
}

/**
 * Catch-all route. Without it an unknown URL rendered the header and footer around an
 * empty <main>, which reads as a broken site rather than a wrong address.
 */
export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="container page-section" style={{ textAlign: 'center', padding: '6rem 0' }}>
      <Seo title={t('notfound.title')} description={t('notfound.desc')} path="/404" noindex />
      <h1>{t('notfound.heading')}</h1>
      <p style={{ maxWidth: '480px', margin: '1.5rem auto 3rem', color: '#666', lineHeight: 1.6 }}>
        {t('notfound.desc')}
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" style={linkStyle}>{t('notfound.back_home')}</Link>
        <Link to="/shop" style={linkStyle}>{t('notfound.browse_shop')}</Link>
      </div>
    </div>
  )
}
