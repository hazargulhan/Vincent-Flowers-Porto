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
        </div>
        <div className="hero-image-content">
          <img 
            src="/images/landing-hero.jpg" 
            alt="Artisanal Bouquet" 
            style={{ width: '100%', minHeight: '400px', objectFit: 'cover' }} 
          />
        </div>
      </section>

    </div>
  )
}
