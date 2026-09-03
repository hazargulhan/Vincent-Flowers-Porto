import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import Seo from '../components/Seo'
import ClosureNotice from '../components/ClosureNotice'
import { useClosures } from '../hooks/useClosures'
import { getLocalizedPath } from '../lib/locale'

export default function Landing() {
  const { t, i18n } = useTranslation()
  const { closures, closureMessage } = useClosures()
  const isPt = i18n.language.startsWith('pt')

  return (
    <div className="landing-page">
      <Seo
        title={t('seo.landing_title')}
        description={t('seo.landing_desc')}
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Florist',
            '@id': 'https://vincentflowersporto.com/#florist',
            name: 'Vincent Flowers Porto',
            alternateName: ['Vincent Flowers', 'Vincent Flowers Porto Atelier'],
            description: 'Artisan floral studio in Porto, Portugal offering custom flower bouquets, curated arrangements, flower subscriptions, and event florals.',
            image: 'https://vincentflowersporto.com/images/logo.webp',
            logo: 'https://vincentflowersporto.com/images/logo.webp',
            url: 'https://vincentflowersporto.com',
            telephone: '+351911119351',
            email: 'vincent.flowers.porto@gmail.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Rua de Tanger 1544',
              postalCode: '4150-722',
              addressLocality: 'Porto',
              addressRegion: 'Porto',
              addressCountry: 'PT'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 41.1643,
              longitude: -8.6601
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '09:00',
                closes: '18:00'
              }
            ],
            priceRange: '€€',
            currenciesAccepted: 'EUR',
            paymentAccepted: 'MB WAY, Bank Transfer',
            areaServed: [
              { '@type': 'City', name: 'Porto' },
              { '@type': 'City', name: 'Vila Nova de Gaia' },
              { '@type': 'City', name: 'Matosinhos' },
              { '@type': 'City', name: 'Maia' },
              { '@type': 'City', name: 'Gondomar' }
            ],
            sameAs: [
              'https://www.instagram.com/vincent_flowers_porto/'
            ],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Floral Products & Services',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Custom Bouquet Builder'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: 'Curated Artisan Bouquets'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Fresh Flower Subscriptions'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Wedding & Event Florals'
                  }
                }
              ]
            }
          })}
        </script>
      </Helmet>
      <section className="hero-section container landing-hero">
        <div className="hero-text-content">
          <h1 className="hero-title">{t('landing.title')}</h1>
          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {t('landing.subtitle')}
          </p>

          <ClosureNotice closures={closures} closureMessage={closureMessage} />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link to={getLocalizedPath('/builder', isPt)} className="landing-btn" style={{ flex: '1 1 250px' }}>
              {t('landing.btn_custom')} <ArrowRight size={20} />
            </Link>
            <Link to={getLocalizedPath('/shop', isPt)} className="landing-btn" style={{ flex: '1 1 250px' }}>
              {t('landing.btn_shop')} <ArrowRight size={20} />
            </Link>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <a href="https://www.instagram.com/vincent_flowers_porto/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '50%', color: 'inherit', transition: 'all 0.2s ease' }} className="ig-icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>
        <div className="hero-image-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src="/images/About/IMG_5663.webp"
            alt={t('landing.hero_alt')}
            width={1400}
            height={2491}
            fetchPriority="high"
            style={{ width: '95%', height: 'auto', minHeight: '400px', maxHeight: '85vh', objectFit: 'cover', borderRadius: '8px' }}
          />
        </div>
      </section>

    </div>
  )
}
