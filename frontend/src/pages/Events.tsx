import { useState } from 'react'
import ImageModal from '../components/ImageModal'
import PhoneInput from '../components/PhoneInput'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../lib/api'
import Seo from '../components/Seo'

export default function Events() {
  const { t } = useTranslation()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phoneDialCode: '+351', phoneNumber: '', eventDate: '', location: '' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError('');
    setSubmitting(true);
    const data = {
      type: 'events',
      customer: {
        name: formData.name,
        email: formData.email,
        phone: `${formData.phoneDialCode} ${formData.phoneNumber}`.trim(),
      },
      eventDate: formData.eventDate,
      location: formData.location,
      message: 'Consultation request for event.'
    };

    try {
      const res = await fetch(apiUrl('/api/order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const resData = await res.json().catch(() => null)
      if (res.ok && resData?.success) {
        setSubmitted(true)
      } else {
        setSubmitError(resData?.message || t('events.submit_error'))
      }
    } catch (err) {
      console.error('Event Inquiry failed:', err)
      setSubmitError(t('events.submit_error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container page-section">
      <Seo
        title={t('seo.events_title')}
        description={t('seo.events_desc')}
        path="/events"
      />
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
            <h3>{t('events.inquiry_sent')}</h3>
            <p>{t('events.inquiry_sent_desc')}</p>
          </div>
        ) : (
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '2rem auto 0' }}
            onSubmit={handleSubmit}
          >
            <input type="text" placeholder={t('events.form_name')} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder={t('events.form_email')} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <PhoneInput
              dialCode={formData.phoneDialCode}
              number={formData.phoneNumber}
              onDialCodeChange={dc => setFormData({...formData, phoneDialCode: dc})}
              onNumberChange={n => setFormData({...formData, phoneNumber: n})}
              placeholder={t('events.form_phone')}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.9rem', color: '#666' }}>{t('events.form_date')}</label>
              <input
                type="date"
                required
                placeholder="dd/mm/yyyy"
                value={formData.eventDate}
                onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                onChange={e => setFormData({...formData, eventDate: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
            <input type="text" placeholder={t('events.form_location')} required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            {submitError && <div style={{ color: 'red' }}>{submitError}</div>}
            <button type="submit" disabled={submitting} style={{ padding: '1rem', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--text-color)' }}>
               {submitting ? t('common.sending') : t('events.btn_send')}
            </button>
          </form>
        )}
      </div>

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
