import { useState } from 'react'
import ImageModal from '../components/ImageModal'
import { useTranslation } from 'react-i18next'

export default function Events() {
  const { t } = useTranslation()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const portfolioImages = [
    '/images/events/Events - Flowers for People/Sub-1.webp',
    '/images/events/Events - Flowers for People/Sub-2.webp',
    '/images/events/Events - Flowers for People/Sub-4.webp',
    '/images/events/Events - Flowers for People/Sub-5.webp',
    '/images/events/Events - Flowers for People/Sub-6.webp',
    '/images/events/Events - Flowers for People/Sub-7.webp',
    '/images/events/Events - Flowers for People/Sub-8.webp',
    '/images/events/Events - Flowers for People/Sub-9.webp',
    '/images/events/Events - Flowers for People/Sub-10.webp',
    '/images/events/Events - Flowers for Spaces/Space-1.webp',
    '/images/events/Events - Flowers for Spaces/Space-2.webp',
    '/images/events/Events - Flowers for Spaces/Space-3.webp',
    '/images/events/Events - Flowers for Spaces/Space-4.webp',
    '/images/events/Events - Flowers for Spaces/Space-5.webp',
    '/images/events/Events - Flowers for Spaces/Space-6.webp',
    '/images/events/Events - Flowers for Spaces/Space-7.webp',
    '/images/events/Events - Flowers for Spaces/Space-8.webp',
    '/images/events/Events - Flowers for Spaces/Space-9.webp',
    '/images/events/Events - Flowers for Spaces/Space-10.webp',
    '/images/events/Events - Flowers for Spaces/Space-11.webp',
    '/images/events/Events - Flowers for Spaces/Space-12.webp',
    '/images/events/Events - Flowers for Spaces/Space-13.webp',
    '/images/events/Events - Flowers for Spaces/Space-14.webp'
  ];

  return (
    <div className="container page-section">
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{t('events.desc1')}</p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginTop: '1.5rem' }}>{t('events.desc2')}</p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', fontSize: '1.2rem' }}>
          <li>{t('events.list1')}</li>
          <li>{t('events.list2')}</li>
          <li>{t('events.list3')}</li>
          <li>{t('events.list4')}</li>
        </ul>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginTop: '2rem', fontWeight: 'bold' }}>{t('events.contact_call')}</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
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
            <img src={img} alt={`Portfolio Visual ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '4rem', padding: '3rem', border: '1px solid var(--text-color)', textAlign: 'center' }}>
        <h2>{t('events.consultation')}</h2>
        <p>{t('events.consultation_desc')}</p>
        
        {submitted ? (
          <div style={{ padding: '2rem', marginTop: '2rem' }}>
            <h3>{t('events.inquiry_sent') || 'Consultation Requested'}</h3>
            <p>{t('events.inquiry_sent_desc') || 'We will contact you shortly.'}</p>
          </div>
        ) : (
          <form 
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '2rem auto 0' }} 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              const target = e.target as any;
              const data = {
                type: 'events',
                customer: {
                  name: target[0].value,
                  email: target[1].value,
                  phone: target[2].value,
                },
                eventDate: target[3].value,
                location: target[4].value,
                message: 'Consultation request for event.'
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
                console.error('Event Inquiry failed:', err)
              }
            }}
          >
            <input type="text" placeholder={t('events.form_name')} required />
            <input type="email" placeholder={t('events.form_email')} required />
            <input type="tel" placeholder={t('events.form_phone')} required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.9rem', color: '#666' }}>{t('events.form_date')}</label>
              <input 
                type="date" 
                required 
                placeholder="dd/mm/yyyy"
                onClick={(e) => e.currentTarget.showPicker()}
                style={{ width: '100%' }}
              />
            </div>
            <input type="text" placeholder={t('events.form_location')} required />
            <button type="submit" style={{ padding: '1rem', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--text-color)' }}>
               {t('events.btn_send')}
            </button>
          </form>
        )}
      </div>

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
