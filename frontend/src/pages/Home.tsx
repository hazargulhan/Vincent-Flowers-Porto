import { useState, useMemo } from 'react'
import { Info, MessageCircle, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Map generic flower names to their images for the visualizer
const FLOWER_IMAGES: Record<string, string> = {
  'Rose': '/images/Rose-White.webp',
  'Matthiola': '/images/Matthiola-Purple.webp',
  'Flor da Serra': '/images/Flor-da-Serra.webp2.webp',
}

interface FlowerVariant {
  color: string
  hexColor: string
  basePrice: number
  qty: number
}

interface FlowerGroup {
  name: string
  available: boolean
  variants: FlowerVariant[]
}

const INITIAL_GROUPS: FlowerGroup[] = [
  {
    name: 'Rose',
    available: true,
    variants: [
      { color: 'White', hexColor: '#f8f9fa', basePrice: 3, qty: 0 },
      { color: 'Red', hexColor: '#d90429', basePrice: 3.25, qty: 0 },
    ]
  },
  {
    name: 'Matthiola',
    available: true,
    variants: [
      { color: 'Purple', hexColor: '#e0b0ff', basePrice: 2.5, qty: 0 }
    ]
  },
  {
    name: 'Flor da Serra',
    available: true,
    variants: [
      { color: 'Pink', hexColor: '#ffb6c1', basePrice: 4, qty: 0 }
    ]
  }
]

export default function Home() {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<FlowerGroup[]>(INITIAL_GROUPS.filter(g => g.available))
  
  const [activeVariants, setActiveVariants] = useState<Record<string, number>>(() => {
    const defaultActive: Record<string, number> = {}
    INITIAL_GROUPS.filter(g => g.available).forEach(g => {
      defaultActive[g.name] = 0 
    })
    return defaultActive
  })

  const [mode, setMode] = useState<'bouquet' | 'bunch' | null>(null)
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', pickupTime: '', city: 'Porto' })
  const [submitted, setSubmitted] = useState(false)
  const [timeError, setTimeError] = useState('')
  const [showInfo, setShowInfo] = useState<'bouquet' | 'bunch' | 'pickup' | null>(null)

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

  const handleQtyChange = (groupName: string, delta: number) => {
    const newGroups = [...groups]
    const gIndex = newGroups.findIndex(g => g.name === groupName)
    const activeVarIndex = activeVariants[groupName] || 0
    newGroups[gIndex].variants[activeVarIndex].qty = Math.max(0, newGroups[gIndex].variants[activeVarIndex].qty + delta)
    setGroups(newGroups)
  }

  const baseTotal = groups.reduce((acc, g) => acc + g.variants.reduce((accV, v) => accV + v.basePrice * v.qty, 0), 0)
  const priceModifier = mode === 'bouquet' ? 1.2 : 1.0 
  const currentTotal = baseTotal * priceModifier

  const validateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const hours = d.getHours()
    if (hours < 9 || hours >= 18) {
      return "Delivery/Pickup is only available between 09:00 and 18:00."
    }
    const diff = (d.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    if (diff < 5) {
      return "Minimum 5 working hours required before delivery/pickup."
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (baseTotal < 15 || !mode) return;
    
    const error = validateTime(formData.pickupTime)
    if (error) {
      setTimeError(error)
      return
    }
    setTimeError('')
    setSubmitted(true)
    try {
      const apiHost = window.location.hostname
      
      const flatConfig = groups.flatMap(g => 
        g.variants.filter(v => v.qty > 0).map(v => ({ name: g.name, color: v.color, price: v.basePrice, qty: v.qty }))
      )

      await fetch(`http://${apiHost}:8787/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuration: flatConfig, mode, deliveryMode, customer: formData, total: currentTotal })
      })
    } catch (err) {
      console.error(err)
    }
  }

  const compositeStems = useMemo(() => {
    const stems: {name: string, variant: FlowerVariant}[] = []
    groups.forEach(g => {
      g.variants.forEach(v => {
        for (let i = 0; i < v.qty; i++) {
          stems.push({name: g.name, variant: v})
        }
      })
    })
    return stems
  }, [groups])

  const IS_STEP_1_COMPLETE = baseTotal >= 15
  const IS_STEP_2_COMPLETE = IS_STEP_1_COMPLETE && mode !== null

  if (submitted) {
    return (
      <div className="container page-section">
        <div style={{ padding: '2rem', border: '1px solid var(--text-color)', textAlign: 'center' }}>
          <h2>Order Received</h2>
          <p>Thank you, {formData.name}. We have sent an auto-reply to {formData.email}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>

      <div className="builder-container" style={{ marginTop: '3rem' }}>
        
        {/* Visualizer (Sticky on Mobile, Fixed Right on Desktop) */}
        <div className={`interactive-preview ${mode ? 'unstick' : ''}`} style={mode ? { position: 'static' } : {}}>
           <div className="composite-container" style={{ position: 'relative' }}>
             {compositeStems.length > 0 ? (
               compositeStems.map((stem, i) => {
                 const ROW_SIZE = 6;
                 const row = Math.floor(i / ROW_SIZE);
                 const indexInRow = i % ROW_SIZE;
                 const itemsInThisRow = Math.min(ROW_SIZE, compositeStems.length - row * ROW_SIZE);
                 
                 const idx = indexInRow - (itemsInThisRow - 1) / 2;
                 const angle = idx * 10; 
                 const tx = idx * 25; 
                 const ty = Math.abs(idx) * 8 + (row * 60); 
                 
                 return (
                   <img 
                      key={`${stem.name}-${stem.variant.color}-${i}`} 
                      src={FLOWER_IMAGES[stem.name]} 
                      alt=""
                      className="composite-layer"
                      style={{ 
                        transform: `translateX(${tx}px) translateY(${ty}px) rotate(${angle}deg)`, 
                        zIndex: i,
                        height: `${75 + (i % 3) * 5}%`, 
                        position: 'absolute',
                        bottom: '5%', // Modest lift for desktop, overridden for mobile in index.css
                        left: '50%',
                        marginLeft: '-25%', // Center it manually
                        width: '50%',
                        objectFit: 'contain'
                      }} 
                    />
                 )
               })
             ) : (
                <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%' }}>
                   {t('home.empty_cart')}
                </div>
             )}
           </div>
           {deliveryMode === 'pickup' && (
             <div style={{ marginTop: '1rem', textAlign: 'center', padding: '1rem', borderTop: '1px dashed var(--border-color)', animation: 'fadeInUp 0.5s ease', position: 'absolute', bottom: 0, width: '100%', left: 0 }}>
               <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{t('home.wrapping_inc')}</p>
             </div>
           )}
        </div>

        {/* Controls Column (Scrolling Sections) */}
        <div className="controls" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          
          {/* SECTION 1 */}
          <div className="step-section">
            <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{t('home.step1')}</h2>
            <div className="flower-list">
              {groups.map((group) => {
                 const activeIndex = activeVariants[group.name] || 0;
                 const activeVariant = group.variants[activeIndex];
                 
                 return (
                  <div key={group.name} className="flower-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', borderRight: '1px solid #ccc', paddingRight: '1rem' }}>
                           {group.variants.map((v, i) => (
                              <button 
                                key={v.color}
                                className={`color-swatch-btn ${i === activeIndex ? 'active' : ''}`}
                                style={{ 
                                   backgroundColor: v.hexColor, 
                                   width: '24px', 
                                   height: '24px', 
                                   borderRadius: '50%',
                                   border: i === activeIndex ? '2px solid var(--text-color)' : '1px solid #ccc',
                                   cursor: 'pointer',
                                   padding: 0
                                }}
                                onClick={() => setActiveVariants({...activeVariants, [group.name]: i})}
                                aria-label={`Select ${v.color} variant of ${group.name}`}
                              />
                           ))}
                        </div>
                        <strong>{group.name}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div className="flower-price" style={{ fontSize: '0.9rem', color: '#666' }}>€{activeVariant.basePrice.toFixed(2)} {t('home.price_per_stem')}</div>
                        <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                          <button style={{ border: 'none', borderRight: '1px solid var(--border-color)', padding: '0.2rem 0.8rem' }} onClick={() => handleQtyChange(group.name, -1)}>-</button>
                          <span style={{ width: '40px', textAlign: 'center', display: 'inline-block' }}>{activeVariant.qty}</span>
                          <button style={{ border: 'none', borderLeft: '1px solid var(--border-color)', padding: '0.2rem 0.8rem' }} onClick={() => handleQtyChange(group.name, 1)}>+</button>
                        </div>
                      </div>
                    </div>

                  </div>
                 )
              })}
            </div>

            <div style={{ background: '#fafafa', padding: '1rem', border: '1px dashed #ccc' }}>
                <h3 style={{ margin: 0 }}>{t('home.base_selection')}: €{baseTotal.toFixed(2)}</h3>
                {!IS_STEP_1_COMPLETE ? (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>{t('home.min_order_note').replace('{{amount}}', (15 - baseTotal).toFixed(2))}</p>
                ) : (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#5cb85c', fontSize: '0.9rem' }}>{t('home.min_reached')}</p>
                )}
            </div>
          </div>

          {/* SECTION 2 */}
          <div className={`step-section ${!IS_STEP_1_COMPLETE ? 'frozen-section' : ''}`}>
             <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{t('home.step2')}</h2>
             <p style={{ color: '#666', marginBottom: '1.5rem' }}>{t('home.step2_subtitle')}</p>
             
             <div className="mode-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="mode-option" style={{ padding: '1rem', border: `1px solid ${mode === 'bouquet' ? 'var(--text-color)' : 'var(--border-color)'}`, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{t('home.bouquet_title')}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{t('home.bouquet_desc')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="info-icon" onClick={() => setShowInfo('bouquet')}><Info size={16} /></button>
                    <button className={`toggle-btn ${mode === 'bouquet' ? 'active' : ''}`} onClick={() => setMode('bouquet')}>{t('home.select')}</button>
                  </div>
                </div>

                <div className="mode-option" style={{ padding: '1rem', border: `1px solid ${mode === 'bunch' ? 'var(--text-color)' : 'var(--border-color)'}`, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{t('home.bunch_title')}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{t('home.bunch_desc')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="info-icon" onClick={() => setShowInfo('bunch')}><Info size={16} /></button>
                    <button className={`toggle-btn ${mode === 'bunch' ? 'active' : ''}`} onClick={() => setMode('bunch')}>{t('home.select')}</button>
                  </div>
                </div>
             </div>
          </div>

          {/* SECTION 3 */}
          <div className={`step-section ${!IS_STEP_2_COMPLETE ? 'frozen-section' : ''}`}>
              <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{t('home.step3')}</h2>
              
              <div className="delivery-toggle mode-buttons" style={{ marginBottom: '1rem' }}>
                <button className={`toggle-btn ${deliveryMode === 'delivery' ? 'active' : ''}`} onClick={() => setDeliveryMode('delivery')}>{t('home.tab_delivery')}</button>
                <button className={`toggle-btn ${deliveryMode === 'pickup' ? 'active' : ''}`} onClick={() => setDeliveryMode('pickup')}>{t('home.tab_pickup')}</button>
              </div>
              <div style={{ minHeight: '60px', marginBottom: '1rem', transition: 'opacity 0.3s ease', opacity: 1, color: '#666', fontSize: '0.9rem' }}>
                 {deliveryMode === 'delivery' && (
                    <span style={{ animation: 'fadeIn 0.5s' }}>{t('home.delivery_info')}</span>
                 )}
                 {deliveryMode === 'pickup' && (
                    <span style={{ animation: 'fadeIn 0.5s' }}>{t('home.pickup_info')}</span>
                 )}
              </div>

              <form onSubmit={handleSubmit} className="delivery-form">
                <input type="text" placeholder={t('home.form_name')} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder={t('home.form_email')} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="tel" placeholder={t('home.form_phone')} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                
                {deliveryMode === 'delivery' && (
                  <>
                    <select required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                      <option value="Porto">Porto</option>
                      <option value="Gaia">Gaia</option>
                      <option value="Maia">Maia</option>
                      <option value="Matosinhos">Matosinhos</option>
                    </select>
                    <textarea placeholder={t('home.form_address')} rows={3} required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                  </>
                )}
                
                <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{deliveryMode === 'delivery' ? t('home.delivery_time') : t('home.pickup_time')}</h3>
                <small style={{ display: 'block', marginBottom: '1rem' }}>{t('home.time_warning')}</small>
                <input 
                  type="datetime-local" 
                  min={minDatetime} 
                  required 
                  placeholder="dd/mm/yyyy --:--"
                  value={formData.pickupTime} 
                  onClick={(e) => e.currentTarget.showPicker()}
                  onChange={e => {
                     setFormData({...formData, pickupTime: e.target.value});
                     setTimeError('');
                  }} 
                />
                {timeError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{timeError}</div>}
                
                <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t('home.final_total')}: €{currentTotal.toFixed(2)}</h3>
                    <button type="submit" style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: 'transparent', color: 'var(--text-color)', fontWeight: 'bold', border: '1px solid var(--text-color)' }}>
                      {deliveryMode === 'delivery' ? t('home.btn_delivery') : t('home.btn_pickup')}
                    </button>
                </div>
              </form>

              <div className="contact-methods" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <h3>{t('home.fast_contact')}</h3>
                <p>{t('home.get_in_touch')}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <a href="https://wa.me/351911119351" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: '#25D366', color: '#fff' }}>
                    <MessageCircle size={20} />
                  </a>
                  <a href="https://t.me/+351911119351" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: '#0088cc', color: '#fff' }}>
                    <Send size={20} />
                  </a>
                </div>
              </div>
          </div>

        </div>
      </div>

      {/* Info Modals */}
      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowInfo(null)}>×</button>
            {showInfo === 'bouquet' && (
              <>
                <h3>{t('home.info_bouquet_title')}</h3>
                <p>{t('home.info_bouquet_desc')}</p>
              </>
            )}
            {showInfo === 'bunch' && (
              <>
                <h3>{t('home.info_bunch_title')}</h3>
                <p>{t('home.info_bunch_desc')}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
