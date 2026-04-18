import { useState } from 'react'
import ImageModal from '../components/ImageModal'
import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  return (
    <div className="container page-section">
      <h1>{t('about.title')}</h1>
      <div className="grid" style={{ gap: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div 
             style={{ background: '#f0f0f0', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
             onClick={() => setLightboxImg('/images/About/IMG_5305.webp')}
          >
            <img src="/images/About/IMG_5305.webp" alt="Founder Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div 
             style={{ background: '#f0f0f0', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
             onClick={() => setLightboxImg('/images/landing-hero.jpg')}
          >
            <img src="/images/landing-hero.jpg" alt="Studio Detail" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2>{t('about.subtitle')}</h2>
          <p>{t('about.desc1')}</p>
          <p>
            {t('about.desc2')}
          </p>
          
          <h3 style={{ marginTop: '2rem' }}>{t('about.follow')}</h3>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
             <a href="https://www.instagram.com/vincent_flowers_porto/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'border-color 0.2s', cursor: 'pointer' }}>
                   <div>
                       <strong style={{ display: 'block', fontSize: '1.2rem' }}>@vincent_flowers_porto</strong>
                       <span style={{ color: '#666' }}>{t('about.follow_desc')}</span>
                   </div>
                </div>
             </a>
          </div>
        </div>
      </div>

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
