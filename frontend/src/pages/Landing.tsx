import { Link } from 'react-router-dom'
import { ArrowRight, Instagram } from 'lucide-react'
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
              <Instagram size={24} />
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
