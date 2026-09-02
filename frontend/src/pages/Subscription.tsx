import { useState, useRef } from 'react'
import ImageModal from '../components/ImageModal'
import PhoneInput from '../components/PhoneInput'
import { useClosures } from '../hooks/useClosures'
import { formatDate } from '../lib/dates'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../lib/api'
import Seo from '../components/Seo'
import { useSettings } from '../hooks/useSettings'

export default function Subscription() {
  const { t, i18n } = useTranslation()
  const { settings } = useSettings()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(null) // 1: Small, 2: Medium, 3: Large
  const [freq, setFreq] = useState<number | null>(null)
  const [recipient, setRecipient] = useState({ name: '', email: '', phoneDialCode: '+351', phoneNumber: '', address: '' })
  const [buyer, setBuyer] = useState({ name: '', email: '', phoneDialCode: '+351', phoneNumber: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const portfolioRef = useRef<HTMLDivElement>(null)

  const [portfolioTab, setPortfolioTab] = useState<number | null>(null)
  const [syncedSize, setSyncedSize] = useState<number | null>(null)

  const { activeClosure, closureMessage, loading: closuresLoading } = useClosures()

  const sizePricing: Record<number, {label: string, price: number, img: string}> = {
    1: {label: 'Small', price: settings.subscriptionPricing.small, img: '/images/Subscription-small.webp'},
    2: {label: 'Medium', price: settings.subscriptionPricing.medium, img: '/images/Subscription-Medium.webp'},
    3: {label: 'Large', price: settings.subscriptionPricing.large, img: '/images/Subscription-Large.webp'}
  }

  const portfolioImages: Record<number, string[]> = {
    1: [
      '/images/subscription/small/DSC04374.webp',
      '/images/subscription/small/DSC05058.webp',
      '/images/subscription/small/DSC06334-2.webp',
      '/images/subscription/small/DSC_0205.webp',
      '/images/subscription/small/IMG_1210.webp',
      '/images/subscription/small/IMG_9415.webp'
    ],
    2: [
      '/images/subscription/medium/DSC05009.webp',
      '/images/subscription/medium/DSC05430-2.webp',
      '/images/subscription/medium/DSC06650.webp',
      '/images/subscription/medium/Document.webp',
      '/images/subscription/medium/IMG_1198.webp',
      '/images/subscription/medium/IMG_1199.webp',
      '/images/subscription/medium/IMG_1902.webp',
      '/images/subscription/medium/IMG_2230.webp'
    ],
    3: [
      '/images/subscription/large/DSC06570.webp',
      '/images/subscription/large/DSC_2459.webp',
      '/images/subscription/large/IMG_1200.webp',
      '/images/subscription/large/IMG_3833.webp',
      '/images/subscription/large/IMG_4546-2.webp'
    ]
  }

  const minFreq = size === 1 ? 3 : 2;

  // Keep portfolioTab and freq in sync with size, adjusted during render (React's
  // recommended alternative to a setState-in-effect) so it only runs when size actually changes.
  if (size !== syncedSize) {
    setSyncedSize(size)
    if (size !== null) {
      setPortfolioTab(size)
      if (freq === null || freq < minFreq) {
        setFreq(minFreq)
      }
    }
  }

  const isStep1Complete = size !== null;
  const isStep2Complete = isStep1Complete && freq !== null;
  const totalMonthly = (size ? sizePricing[size].price : 0) * (freq ? freq : 0);

  // Wait for closure data before choosing between the form and the closed notice,
  // otherwise the signup form flashes on screen during an actual closure.
  if (closuresLoading) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Seo title={t('seo.sub_title')} description={t('seo.sub_desc')} path="/subscription" />
        <h2>{t('sub.loading')}</h2>
      </div>
    )
  }

  if (activeClosure) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Seo title={t('seo.sub_title')} description={t('seo.sub_desc')} path="/subscription" />
        <h2>{t('sub.closed_title')}</h2>
        <p>{closureMessage(activeClosure, i18n.language)}</p>
        <p style={{ fontSize: '0.85rem', color: '#666' }}>
          {t('common.closure_notice_dates', {
            start: formatDate(activeClosure.startDate, i18n.language),
            end: formatDate(activeClosure.endDate, i18n.language),
          })}
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Seo title={t('seo.sub_title')} description={t('seo.sub_desc')} path="/subscription" />
        <h2>{t('sub.requested_title')}</h2>
        <p>{t('sub.requested_desc')}</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <Seo title={t('seo.sub_title')} description={t('seo.sub_desc')} path="/subscription" />
      <h1>{t('sub.title')}</h1>
      <p>{t('sub.subtitle')}</p>

      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '4rem', maxWidth: '600px' }}>

        {/* STEP 1 */}
        <div className="step-section">
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{t('sub.step1')}</span>
          </h2>
          <div className="subscription-sizes">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setSize(n)}
                style={{
                  padding: '1.5rem 1rem',
                  border: size === n ? '2px solid var(--text-color)' : '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-color)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                   <img src={sizePricing[n].img} alt={sizePricing[n].label} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                   <strong>{sizePricing[n].label}</strong>
                   <br/>
                   <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>€{sizePricing[n].price}/ea</span>
                </div>
              </button>
            ))}
          </div>
          {size !== null && (
             <div style={{ textAlign: 'center', marginTop: '2rem' }}>
               <button
                  onClick={() => portfolioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', textDecoration: 'underline', padding: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
               >
                  {t('sub.view_examples')}
               </button>
             </div>
          )}
        </div>

        {/* STEP 2 */}
        <div className={`step-section ${!isStep1Complete ? 'frozen-section' : ''}`}>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>{t('sub.step2')}</h2>
          <div style={{ padding: '2rem 1rem', border: '1px solid var(--border-color)' }}>
             <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <strong>{freq}</strong> {t('sub.deliveries_per_month')}
             </p>
             <input
                type="range"
                min={minFreq}
                max={4}
                step={1}
                value={freq || minFreq}
                onChange={e => setFreq(parseInt(e.target.value))}
                className="custom-range"
                style={{ '--fill': `${(((freq || minFreq) - minFreq) / (4 - minFreq)) * 100}%` } as React.CSSProperties}
             />
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                <span>{minFreq}x</span>
                <span>4x</span>
             </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className={`step-section ${!isStep2Complete ? 'frozen-section' : ''}`}>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>{t('sub.step3')}</h2>
          <form
            onSubmit={async (e) => {
                e.preventDefault();
                if (submitting) return;
                setSubmitError('');
                setSubmitting(true);
                try {
                  const recipientPayload = {
                    name: recipient.name,
                    email: recipient.email,
                    phone: `${recipient.phoneDialCode} ${recipient.phoneNumber}`.trim(),
                    address: recipient.address,
                  }
                  const buyerPayload = {
                    name: buyer.name,
                    email: buyer.email,
                    phone: `${buyer.phoneDialCode} ${buyer.phoneNumber}`.trim(),
                  }

                  const res = await fetch(apiUrl('/api/order'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'subscription',
                      customer: recipientPayload,
                      buyer: buyerPayload,
                      total: totalMonthly,
                      sizeLabel: size ? sizePricing[size].label : 'Unknown',
                      frequency: freq
                    })
                  })
                  const data = await res.json().catch(() => null)
                  if (res.ok && data?.success) {
                    setSubmitted(true)
                  } else {
                    setSubmitError(data?.message || t('sub.submit_error'))
                  }
                } catch (err) {
                  console.error('Subscription Inquiry failed:', err)
                  setSubmitError(t('sub.submit_error'))
                } finally {
                  setSubmitting(false)
                }
            }}
            className="delivery-form"
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{t('sub.buyer_section_title')}</h3>
            <small style={{ display: 'block', marginBottom: '0.8rem', color: '#666' }}>{t('sub.buyer_section_note')}</small>
            <input type="text" placeholder={t('sub.buyer_form_name')} required value={buyer.name} onChange={e => setBuyer({...buyer, name: e.target.value})} />
            <input type="email" placeholder={t('sub.buyer_form_email')} required value={buyer.email} onChange={e => setBuyer({...buyer, email: e.target.value})} />
            <PhoneInput
              dialCode={buyer.phoneDialCode}
              number={buyer.phoneNumber}
              onDialCodeChange={dc => setBuyer({...buyer, phoneDialCode: dc})}
              onNumberChange={n => setBuyer({...buyer, phoneNumber: n})}
              placeholder={t('sub.buyer_form_phone')}
            />

            <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>{t('sub.recipient_section_title')}</h3>
            <input type="text" placeholder={t('sub.form_name')} required value={recipient.name} onChange={e => setRecipient({...recipient, name: e.target.value})} />
            <input type="email" placeholder={t('sub.form_email')} required value={recipient.email} onChange={e => setRecipient({...recipient, email: e.target.value})} />
            <PhoneInput
              dialCode={recipient.phoneDialCode}
              number={recipient.phoneNumber}
              onDialCodeChange={dc => setRecipient({...recipient, phoneDialCode: dc})}
              onNumberChange={n => setRecipient({...recipient, phoneNumber: n})}
              placeholder={t('sub.form_phone')}
            />
            <textarea placeholder={t('sub.form_address')} rows={3} required value={recipient.address} onChange={e => setRecipient({...recipient, address: e.target.value})}></textarea>

            {submitError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{submitError}</div>}

            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', textAlign: 'center' }}>
               <h3 style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t('sub.estimated_cost')}: €{totalMonthly.toFixed(2)} {t('sub.per_month')}</h3>
               <button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: 'transparent', color: 'var(--text-color)', fontWeight: 'bold', border: '1px solid var(--text-color)' }}>{submitting ? t('common.sending') : t('sub.btn_subscribe')}</button>
            </div>
          </form>
        </div>

      </div>

      {size !== null && (
        <div ref={portfolioRef} style={{ marginTop: '6rem', paddingTop: '4rem', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('sub.past_arrangements')}</h2>

          <div className="portfolio-tabs">
             {[1, 2, 3].map(n => (
                <button
                   key={n}
                   onClick={() => setPortfolioTab(n)}
                   style={{
                      border: 'none',
                      background: 'transparent',
                      borderBottom: portfolioTab === n ? '2px solid var(--text-color)' : '2px solid transparent',
                      padding: '0.5rem 1rem',
                      fontWeight: portfolioTab === n ? 'bold' : 'normal',
                      borderRadius: 0,
                      color: 'var(--text-color)'
                   }}
                >
                   {sizePricing[n].label}
                </button>
             ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {portfolioTab && portfolioImages[portfolioTab].map((img, idx) => (
              <div
                 key={idx}
                 style={{ height: '350px', background: '#f5f5f5', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
                 onClick={() => setLightboxImg(img)}
              >
                  <img
                    src={img}
                    alt={`${sizePricing[portfolioTab].label} Visual ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
              </div>
            ))}
          </div>
        </div>
      )}

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
