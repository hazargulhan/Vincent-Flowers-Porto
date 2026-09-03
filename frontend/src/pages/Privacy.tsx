import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Shield, Lock, Server, Cookie, ArrowLeft } from 'lucide-react'
import Seo from '../components/Seo'

export default function Privacy() {
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleOpenPreferences = () => {
    window.dispatchEvent(new CustomEvent('vfp_open_cookie_banner'))
  }

  return (
    <div className="container page-section" style={{ maxWidth: '820px', lineHeight: 1.7 }}>
      <Seo
        title={t('seo.privacy_title')}
        description={t('seo.privacy_desc')}
        path="/privacy"
      />

      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('privacy.title')}</h1>
        <p style={{ color: '#777', fontSize: '0.9rem' }}>{t('privacy.last_updated')}</p>
      </div>

      <p style={{ fontSize: '1.05rem', marginBottom: '2.5rem', color: '#444' }}>
        {t('privacy.intro')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Section 1 */}
        <section>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={22} style={{ color: 'var(--accent-color)' }} />
            {t('privacy.controller_title')}
          </h2>
          <p>{t('privacy.controller_desc')}</p>
          <div style={{ background: '#faf8f5', padding: '1rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '0.8rem' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>{t('privacy.controller_email')}</p>
            <p style={{ margin: '0.3rem 0 0 0', fontWeight: 500 }}>{t('privacy.controller_phone')}</p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
            {t('privacy.data_title')}
          </h2>
          <p style={{ marginBottom: '1.2rem' }}>{t('privacy.data_intro')}</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ background: '#faf8f5', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <strong>{t('privacy.data_orders_title')}</strong> {t('privacy.data_orders_desc')}
            </li>
            <li style={{ background: '#faf8f5', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <strong>{t('privacy.data_contact_title')}</strong> {t('privacy.data_contact_desc')}
            </li>
            <li style={{ background: '#faf8f5', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <strong>{t('privacy.data_events_title')}</strong> {t('privacy.data_events_desc')}
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
            {t('privacy.basis_title')}
          </h2>
          <ul style={{ paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li>{t('privacy.basis_contract')}</li>
            <li>{t('privacy.basis_consent')}</li>
            <li>{t('privacy.basis_legal')}</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={22} style={{ color: 'var(--accent-color)' }} />
            {t('privacy.third_parties_title')}
          </h2>
          <p>{t('privacy.third_parties_desc')}</p>
          <ul style={{ paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.8rem' }}>
            <li>{t('privacy.third_parties_cloudflare')}</li>
            <li>{t('privacy.third_parties_resend')}</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={22} style={{ color: 'var(--accent-color)' }} />
            {t('privacy.payments_title')}
          </h2>
          <p>{t('privacy.payments_desc')}</p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cookie size={22} style={{ color: 'var(--accent-color)' }} />
            {t('privacy.cookies_title')}
          </h2>
          <p style={{ marginBottom: '1.2rem' }}>{t('privacy.cookies_desc')}</p>

          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#faf8f5', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Storage Key</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Purpose</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>cart</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{t('privacy.cookie_cart_desc')}</td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Persistent</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>i18nextLng</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{t('privacy.cookie_lang_desc')}</td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Persistent</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>vfp_cookie_consent</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{t('privacy.cookie_consent_desc')}</td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Persistent</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>__cf_bm, cf_clearance</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{t('privacy.cookie_security_desc')}</td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Session / 30m</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleOpenPreferences}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ⚙️ {t('footer.cookie_preferences')}
          </button>
        </section>

        {/* Section 7 */}
        <section>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
            {t('privacy.rights_title')}
          </h2>
          <p style={{ marginBottom: '1rem' }}>{t('privacy.rights_desc')}</p>
          <ul style={{ paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
            <li>{t('privacy.right_access')}</li>
            <li>{t('privacy.right_rectification')}</li>
            <li>{t('privacy.right_erasure')}</li>
            <li>{t('privacy.right_restriction')}</li>
          </ul>
          <p style={{ background: '#faf8f5', padding: '1rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {t('privacy.rights_contact')}
          </p>
        </section>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.6rem',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              textDecoration: 'none',
              color: 'inherit',
              fontSize: '0.95rem'
            }}
          >
            <ArrowLeft size={16} />
            {t('privacy.btn_back_home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
