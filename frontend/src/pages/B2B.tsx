import { useState } from 'react'
import ImageModal from '../components/ImageModal'
import PhoneInput from '../components/PhoneInput'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../lib/api'
import Seo from '../components/Seo'

export default function B2B() {
  const { t } = useTranslation()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ businessName: '', contactPerson: '', email: '', phoneDialCode: '+351', phoneNumber: '', message: '' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError('');
    setSubmitting(true);
    const data = {
      type: 'b2b',
      businessName: formData.businessName,
      contactPerson: formData.contactPerson,
      customer: {
          name: formData.contactPerson,
          email: formData.email,
          phone: `${formData.phoneDialCode} ${formData.phoneNumber}`.trim(),
      },
      message: formData.message
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
        setSubmitError(resData?.message || t('b2b.submit_error'))
      }
    } catch (err) {
      console.error('B2B Inquiry failed:', err)
      setSubmitError(t('b2b.submit_error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container page-section">
      <Seo
        title={t('seo.b2b_title')}
        description={t('seo.b2b_desc')}
        path="/b2b"
      />
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
            <p>{t('b2b.inquiry_sent_desc')}</p>
          </div>
        ) : (
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '500px', margin: '0 auto' }}
            onSubmit={handleSubmit}
          >
            <input type="text" placeholder={t('b2b.form_business')} required style={{ padding: '1rem' }} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
            <input type="text" placeholder={t('b2b.form_person')} required style={{ padding: '1rem' }} value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            <input type="email" placeholder={t('b2b.form_email')} required style={{ padding: '1rem' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <PhoneInput
              dialCode={formData.phoneDialCode}
              number={formData.phoneNumber}
              onDialCodeChange={dc => setFormData({...formData, phoneDialCode: dc})}
              onNumberChange={n => setFormData({...formData, phoneNumber: n})}
              placeholder={t('b2b.form_phone')}
            />
            <textarea placeholder={t('b2b.form_msg')} rows={5} required style={{ padding: '1rem' }} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
            {submitError && <div style={{ color: 'red' }}>{submitError}</div>}
            <button
              type="submit"
              disabled={submitting}
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
              {submitting ? t('common.sending') : t('b2b.btn_send')}
            </button>
          </form>
        )}
      </div>

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
