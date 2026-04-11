import { useState, useMemo } from 'react'
import ImageModal from '../components/ImageModal'
import { useTranslation } from 'react-i18next'

export default function Shop() {
  const { t } = useTranslation()
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('none')
  const [selectedBouquet, setSelectedBouquet] = useState<{title: string, price: number} | null>(null)
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', pickupTime: '', city: 'Porto' })
  const [submitted, setSubmitted] = useState(false)
  const [timeError, setTimeError] = useState('')
  
  const bouquets = [
    { title: 'Annette', price: 45, img: '/images/shop/Annette.webp' },
    { title: 'Blue iris', price: 50, img: '/images/shop/Blue iris.webp' },
    { title: 'Bright Spring', price: 60, img: '/images/shop/Bright Spring.webp' },
    { title: 'King Julian', price: 75, img: '/images/shop/King Julian.webp' },
    { title: 'Marshmallow', price: 55, img: '/images/shop/Marshmallow.webp' },
    { title: 'Martha', price: 45, img: '/images/shop/Martha.webp' },
    { title: 'Rose Basket', price: 85, img: '/images/shop/Rose Basket.webp' },
    { title: 'Salmon Rose', price: 55, img: '/images/shop/Salmon Rose.webp' },
    { title: 'Spring Flowers', price: 50, img: '/images/shop/Spring Flowers.webp' },
    { title: 'Tropical', price: 65, img: '/images/shop/Tropical.webp' },
    { title: 'Tulip basket', price: 60, img: '/images/shop/Tulip basket.webp' },
    { title: 'Venus', price: 70, img: '/images/shop/Venus.webp' },
    { title: 'Vera', price: 45, img: '/images/shop/Vera.webp' }
  ]

  const sortedBouquets = [...bouquets].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return 0
  })

  const minDatetime = useMemo(() => {
    const d = new Date()
    d.setHours(d.getHours() + 5)
    if (d.getHours() >= 18) {
      d.setDate(d.getDate() + 1)
      d.setHours(9, 0, 0, 0)
    }
    if (d.getHours() < 9) {
      d.setHours(9, 0, 0, 0)
    }
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }, [])

  const validateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const hours = d.getHours()
    if (hours < 9 || hours >= 18) return t('shop.time_err_bounds')
    const diff = (d.getTime() - new Date().getTime()) / 3600000
    if (diff < 5) return t('shop.time_err_notice')
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBouquet) return
    const error = validateTime(formData.pickupTime)
    if (error) { setTimeError(error); return }
    setTimeError('')
    setSubmitted(true)
    // mock api wait...
  }

  if (submitted) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>{t('shop.order_received')}</h2>
        <p>{t('shop.order_received_desc')}</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <h1>{t('shop.title')}</h1>
      <p>{t('shop.subtitle')}</p>

      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* STEP 1 */}
        <div className="step-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>{t('shop.step1')}</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label htmlFor="sort">{t('shop.sort_by')}</label>
              <select id="sort" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <option value="none">{t('shop.featured')}</option>
                <option value="price-asc">{t('shop.price_asc')}</option>
                <option value="price-desc">{t('shop.price_desc')}</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
            {sortedBouquets.map(b => {
              const isSelected = selectedBouquet?.title === b.title
              return (
                <div key={b.title} style={{ border: isSelected ? '2px solid var(--text-color)' : '1px solid var(--border-color)', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', height: '100%' }} onClick={() => setSelectedBouquet(b)}>
                    <div 
                       style={{ width: '100%', aspectRatio: '3 / 5', marginBottom: '1rem', overflow: 'hidden' }}
                       onClick={(e) => { e.stopPropagation(); setLightboxImg((b as any).img); }}
                    >
                      <img src={(b as any).img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', cursor: 'zoom-in' }} />
                    </div>
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{b.title}</h3>
                        <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>€{b.price.toFixed(2)}</p>
                      </div>
                      <button style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: 'var(--text-color)', border: isSelected ? '2px solid var(--text-color)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                        {isSelected ? t('shop.selected') : t('shop.select')}
                      </button>
                    </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* STEP 2 */}
        <div className={`step-section ${!selectedBouquet ? 'frozen-section' : ''}`}>
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>{t('shop.step2')}</h2>
          
          <div className="delivery-toggle mode-buttons" style={{ marginBottom: '1rem' }}>
            <button className={`toggle-btn ${deliveryMode === 'delivery' ? 'active' : ''}`} onClick={() => setDeliveryMode('delivery')}>{t('shop.tab_delivery')}</button>
            <button className={`toggle-btn ${deliveryMode === 'pickup' ? 'active' : ''}`} onClick={() => setDeliveryMode('pickup')}>{t('shop.tab_pickup')}</button>
          </div>
          <div style={{ minHeight: '60px', marginBottom: '1rem', transition: 'opacity 0.3s ease', opacity: 1, color: '#666', fontSize: '0.9rem' }}>
             {deliveryMode === 'delivery' && (
                <span style={{ animation: 'fadeIn 0.5s' }}>{t('shop.delivery_info')}</span>
             )}
             {deliveryMode === 'pickup' && (
                <span style={{ animation: 'fadeIn 0.5s' }}>{t('shop.pickup_info')}</span>
             )}
          </div>

          <form onSubmit={handleSubmit} className="delivery-form" style={{ maxWidth: '600px' }}>
            <input type="text" placeholder={t('shop.form_name')} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder={t('shop.form_email')} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="tel" placeholder={t('shop.form_phone')} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            
            {deliveryMode === 'delivery' && (
              <>
                <select required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                  <option value="Porto">Porto</option>
                  <option value="Gaia">Gaia</option>
                  <option value="Maia">Maia</option>
                  <option value="Matosinhos">Matosinhos</option>
                </select>
                <textarea placeholder={t('shop.form_address')} rows={3} required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </>
            )}
            
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{t('shop.preferred_time')}</h3>
            <small style={{ display: 'block', marginBottom: '1rem' }}>{t('shop.time_warning')}</small>
            <input 
              type="datetime-local" 
              min={minDatetime} 
              required 
              placeholder="dd/mm/yyyy --:--"
              value={formData.pickupTime} 
              onClick={(e) => e.currentTarget.showPicker()}
              onChange={e => { setFormData({...formData, pickupTime: e.target.value}); setTimeError(''); }} 
            />
            {timeError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{timeError}</div>}
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', textAlign: 'center' }}>
                <h3 style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t('shop.final_total')}: €{selectedBouquet?.price.toFixed(2) || '0.00'}</h3>
                <button type="submit" style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: 'transparent', color: 'var(--text-color)', fontWeight: 'bold', border: '1px solid var(--text-color)' }}>
                  {deliveryMode === 'delivery' ? t('shop.btn_delivery') : t('shop.btn_pickup')}
                </button>
            </div>
          </form>
        </div>

      </div>

      {lightboxImg && <ImageModal src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  )
}
