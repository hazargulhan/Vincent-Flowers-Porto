import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Landing() {
  const { t } = useTranslation()

  return (
    <div className="landing-page">
      <section className="hero-section container landing-hero">
        <div className="hero-text-content">
          <h1 className="hero-title">{t('landing.title')}</h1>
          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            {t('landing.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/builder" className="landing-btn" style={{ flex: '1 1 250px' }}>
              {t('landing.btn_custom')} <ArrowRight size={20} />
            </Link>
            <Link to="/shop" className="landing-btn" style={{ flex: '1 1 250px' }}>
              {t('landing.btn_shop')} <ArrowRight size={20} />
            </Link>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <a href="https://www.instagram.com/vincent_flowers_porto/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '50%', color: 'inherit', transition: 'all 0.2s ease' }} className="ig-icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>
        <div className="hero-image-content">
          <img 
            src="/images/About/IMG_5663.JPG" 
            alt="Artisanal Bouquet" 
            style={{ width: '100%', minHeight: '400px', objectFit: 'cover' }} 
          />
        </div>
      </section>

    </div>
  )
}
