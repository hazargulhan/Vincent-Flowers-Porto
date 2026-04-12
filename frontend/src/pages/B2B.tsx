import { useState } from 'react'
import ImageModal from '../components/ImageModal'
import { useTranslation } from 'react-i18next'

export default function B2B() {
  const { t } = useTranslation()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const portfolioImages = [
    '/images/b2b/DSC07339.webp',
    '/images/b2b/DSC07363.webp',
    '/images/b2b/DSC07379.webp',
    '/images/b2b/DSC07381.webp',
    '/images/b2b/IMG_5311.webp',
    '/images/b2b/IMG_5313.webp',
    '/images/b2b/IMG_5314.webp',
    '/images/b2b/IMG_5315.webp'
  ];

  return (
    <div className="container page-section">
      <h1>{t('b2b.title')}</h1>
      <p style={{ maxWidth: '800px', fontSize: '1.4rem', color: '#1a1a1a', marginBottom: '4rem', lineHeight: '1.4' }}>
        {t('b2b.subtitle')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#888' }}>
            {t('b2b.tailored')}
          </h3>
          <p style={{ fontSize: '1.1rem' }}>
            {t('b2b.tailored_desc')}
          </p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#888' }}>
            {t('b2b.full_service')}
          </h3>
          <p style={{ fontSize: '1.1rem' }}>
            {t('b2b.full_service_desc')}
          </p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#888' }}>
            {t('b2b.reliable')}
          </h3>
          <p style={{ fontSize: '1.1rem' }}>
            {t('b2b.reliable_desc')}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '6rem' }}>
        {portfolioImages.map((img, idx) => (
          <div 
            key={idx} 
            style={{ 
              border: '1px solid var(--border-color)', 
              aspectRatio: '1 / 1', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => setLightboxImg(img)}
          >
            <img src={img} alt={`B2B Portfolio Visual ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      <div id="contact-form" style={{ padding: '5rem 2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('b2b.get_in_touch')}</h2>
        <p style={{ opacity: 0.8, marginBottom: '3rem' }}>{t('b2b.contact_desc')}</p>
        
        {submitted ? (
          <div style={{ padding: '2rem', border: '1px solid var(--text-color)' }}>
            <h3>{t('b2b.inquiry_sent')}</h3>
            <p>{t('b2b.inquiry_sent_desc') || 'We will get back to you soon.'}</p>
          </div>
        ) : (
          <form 
            style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '500px', margin: '0 auto' }} 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              const target = e.target as any;
              const data = {
                type: 'b2b',
                businessName: target[0].value,
                contactPerson: target[1].value,
                customer: {
                    email: target[2].value,
                    phone: target[3].value,
                },
                message: target[4].value
              };
              
              setSubmitted(true);
              try {
                const apiUrl = window.location.hostname === 'localhost' 
                  ? 'http://localhost:8787/api/order' 
                  : 'https://vincent-flowers-backend.vincent-flowers-porto.workers.dev/api/order';
                
                await fetch(apiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })
              } catch (err) {
                console.error('B2B Inquiry failed:', err)
              }
            }}
          >
            <input type="text" placeholder={t('b2b.form_business')} required style={{ padding: '1rem' }} />
            <input type="text" placeholder={t('b2b.form_person')} required style={{ padding: '1rem' }} />
            <input type="email" placeholder={t('b2b.form_email')} required style={{ padding: '1rem' }} />
            <input type="tel" placeholder={t('b2b.form_phone')} required style={{ padding: '1rem' }} />
            <textarea placeholder={t('b2b.form_msg')} rows={5} required style={{ padding: '1rem' }}></textarea>
            <button 
              type="submit" 
              style={{ 
                padding: '1.2rem', 
                background: 'var(--text-color)', 
                color: 'white', 
                width: '100%', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginTop: '1rem',
                fontSize: '1rem'
              }}
            >
              {t('b2b.btn_send')}
            </button>
          </form>
        )}
      </div>

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
