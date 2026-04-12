import { useState, useRef, useEffect } from 'react'
import ImageModal from '../components/ImageModal'
import { useTranslation } from 'react-i18next'

export default function Subscription() {
  const { t } = useTranslation()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(null) // 1: Small, 2: Medium, 3: Large
  const [freq, setFreq] = useState<number | null>(null) 
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })
  const [submitted, setSubmitted] = useState(false)
  const portfolioRef = useRef<HTMLDivElement>(null)

  const [portfolioTab, setPortfolioTab] = useState<number | null>(null)

  useEffect(() => {
    if (size !== null) {
       setPortfolioTab(size)
    }
  }, [size])

  const sizePricing: Record<number, {label: string, price: number, img: string}> = {
    1: {label: 'Small', price: 25, img: '/images/Subscription-small.webp'},
    2: {label: 'Medium', price: 50, img: '/images/Subscription-Medium.webp'},
    3: {label: 'Large', price: 75, img: '/images/Subscription-Large.webp'}
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

  // Initialize freq if it's out of bounds when size changes
  useEffect(() => {
     if (size !== null) {
        if (freq === null) {
           setFreq(minFreq)
        } else if (freq < minFreq) {
           setFreq(minFreq)
        }
     }
  }, [size, minFreq, freq])

  const isStep1Complete = size !== null;
  const isStep2Complete = isStep1Complete && freq !== null;
  const totalMonthly = (size ? sizePricing[size].price : 0) * (freq ? freq : 0);

  if (submitted) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Subscription Requested</h2>
        <p>We will contact you shortly to finalize billing details.</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
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
                   <img src={sizePricing[n].img} alt={sizePricing[n].label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                setSubmitted(true);
                try {
                  const apiUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8787/api/order' 
                    : 'https://vincent-flowers-backend.vincent-flowers-porto.workers.dev/api/order';
                  
                  await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      type: 'subscription',
                      customer: formData, 
                      total: totalMonthly,
                      sizeLabel: size ? sizePricing[size].label : 'Unknown',
                      frequency: freq
                    })
                  })
                } catch (err) {
                  console.error('Subscription Inquiry failed:', err)
                }
            }} 
            className="delivery-form"
          >
            <input type="text" placeholder={t('sub.form_name')} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder={t('sub.form_email')} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="tel" placeholder={t('sub.form_phone')} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <textarea placeholder={t('sub.form_address')} rows={3} required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', textAlign: 'center' }}>
               <h3 style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t('sub.estimated_cost')}: €{totalMonthly.toFixed(2)} {t('sub.per_month')}</h3>
               <button type="submit" style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: 'transparent', color: 'var(--text-color)', fontWeight: 'bold', border: '1px solid var(--text-color)' }}>{t('sub.btn_subscribe')}</button>
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
                 <img src={img} alt={`${sizePricing[portfolioTab].label} Visual ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
