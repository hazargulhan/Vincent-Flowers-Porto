import { useState, useMemo, useEffect } from 'react'
import { Info, MessageCircle, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import PhoneInput from '../components/PhoneInput'
import DeliveryDatePicker from '../components/DeliveryDatePicker'
import ClosureNotice from '../components/ClosureNotice'
import { useClosures } from '../hooks/useClosures'
import { minDeliveryDate, toIsoDate } from '../lib/dates'
import type { FlowerGroup, FlowerVariant } from '../types/catalog'
import { apiUrl, mediaUrl } from '../lib/api'
import Seo from '../components/Seo'

export default function Home() {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<FlowerGroup[]>([])
  const [activeVariants, setActiveVariants] = useState<Record<string, number>>({})

  const [mode, setMode] = useState<'bouquet' | 'bunch' | null>(null)
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery')
  const [recipient, setRecipient] = useState({ name: '', email: '', phoneDialCode: '+351', phoneNumber: '', address: '', pickupDate: '', pickupSlot: 'Morning (10:00 - 13:00)', city: 'Porto' })
  const [buyer, setBuyer] = useState({ name: '', email: '', phoneDialCode: '+351', phoneNumber: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [timeError, setTimeError] = useState('')
  const [showInfo, setShowInfo] = useState<'bouquet' | 'bunch' | 'pickup' | null>(null)

  const { closures, closureForDate, closureMessage, loading: closuresLoading } = useClosures()

  const minDateObj = useMemo(() => minDeliveryDate(), [])

  useEffect(() => {
    fetch(apiUrl('/api/catalog'))
      .then(res => res.json())
      .then(data => {
        if (data && data.makeYourOwn) {
          const fetchedGroups = data.makeYourOwn.filter((g: FlowerGroup) => g.available)
          setGroups(fetchedGroups)
          const defaultActive: Record<string, number> = {}
          fetchedGroups.forEach((g: FlowerGroup) => {
            defaultActive[g.name] = 0
          })
          setActiveVariants(defaultActive)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])


  const handleQtyChange = (groupName: string, delta: number) => {
    const newGroups = [...groups]
    const gIndex = newGroups.findIndex(g => g.name === groupName)
    const activeVarIndex = activeVariants[groupName] || 0
    newGroups[gIndex].variants[activeVarIndex].qty = Math.max(0, newGroups[gIndex].variants[activeVarIndex].qty + delta)
    setGroups(newGroups)
  }

  const baseTotal = groups.reduce((acc, g) => acc + g.variants.reduce((accV, v) => accV + v.basePrice * v.qty, 0), 0)
  const priceModifier = mode === 'bouquet' ? 1.25 : 1.0
  const currentTotal = baseTotal * priceModifier

  const validateTime = (dateStr: string) => {
    if (!dateStr) return t('home.time_err_required')
    const minIso = toIsoDate(minDateObj)
    if (dateStr < minIso) {
      return t('home.time_err_notice')
    }
    const closure = closureForDate(dateStr)
    if (closure) {
      return closureMessage(closure, i18n.language)
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (baseTotal < 15 || !mode) return;

    const error = validateTime(recipient.pickupDate)
    if (error) {
      setTimeError(error)
      return
    }
    setTimeError('')
    setSubmitError('')
    setSubmitting(true)

    try {
      const flatConfig = groups.flatMap(g =>
        g.variants.filter(v => v.qty > 0).map(v => ({ name: g.name, color: v.color, price: v.basePrice, qty: v.qty }))
      )

      const recipientPayload = {
        name: recipient.name,
        email: recipient.email,
        phone: `${recipient.phoneDialCode} ${recipient.phoneNumber}`.trim(),
        address: recipient.address,
        city: recipient.city,
        pickupTime: recipient.pickupDate ? `${recipient.pickupDate} - ${recipient.pickupSlot}` : ''
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
          type: 'make-your-own',
          configuration: flatConfig,
          mode,
          deliveryMode,
          customer: recipientPayload,
          buyer: buyerPayload,
          deliveryDate: recipient.pickupDate,
          total: currentTotal
        })
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.success) {
        setSubmitted(true)
      } else {
        setSubmitError(data?.message || t('home.submit_error'))
      }
    } catch (err) {
      console.error(err)
      setSubmitError(t('home.submit_error'))
    } finally {
      setSubmitting(false)
    }
  }

  const compositeStems = useMemo(() => {
    const stems: {name: string, variant: FlowerVariant, image: string}[] = []
    groups.forEach(g => {
      g.variants.forEach(v => {
        for (let i = 0; i < v.qty; i++) {
          stems.push({name: g.name, variant: v, image: g.image})
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
          <h2>{t('home.order_received')}</h2>
          <p>{t('home.order_received_desc').replace('{{name}}', recipient.name).replace('{{email}}', buyer.email || recipient.email)}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>{t('home.loading')}</h2>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <Seo
        title={t('seo.home_title')}
        description={t('seo.home_desc')}
        path="/builder"
      />
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>

      <ClosureNotice closures={closures} closureMessage={closureMessage} />

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
                      src={mediaUrl(stem.image)}
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
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{t('home.buyer_section_title')}</h3>
                <small style={{ display: 'block', marginBottom: '0.8rem', color: '#666' }}>{t('home.buyer_section_note')}</small>
                <input type="text" placeholder={t('home.buyer_form_name')} required value={buyer.name} onChange={e => setBuyer({...buyer, name: e.target.value})} />
                <input type="email" placeholder={t('home.buyer_form_email')} required value={buyer.email} onChange={e => setBuyer({...buyer, email: e.target.value})} />
                <PhoneInput
                  dialCode={buyer.phoneDialCode}
                  number={buyer.phoneNumber}
                  onDialCodeChange={dc => setBuyer({...buyer, phoneDialCode: dc})}
                  onNumberChange={n => setBuyer({...buyer, phoneNumber: n})}
                  placeholder={t('home.buyer_form_phone')}
                />

                <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>{t('home.recipient_section_title')}</h3>
                <input type="text" placeholder={t('home.form_name')} required value={recipient.name} onChange={e => setRecipient({...recipient, name: e.target.value})} />
                <input type="email" placeholder={t('home.form_email')} required value={recipient.email} onChange={e => setRecipient({...recipient, email: e.target.value})} />
                <PhoneInput
                  dialCode={recipient.phoneDialCode}
                  number={recipient.phoneNumber}
                  onDialCodeChange={dc => setRecipient({...recipient, phoneDialCode: dc})}
                  onNumberChange={n => setRecipient({...recipient, phoneNumber: n})}
                  placeholder={t('home.form_phone')}
                />

                {deliveryMode === 'delivery' && (
                  <>
                    <select required value={recipient.city} onChange={e => setRecipient({...recipient, city: e.target.value})}>
                      <option value="Porto">Porto</option>
                      <option value="Gaia">Gaia</option>
                      <option value="Maia">Maia</option>
                      <option value="Matosinhos">Matosinhos</option>
                    </select>
                    <textarea placeholder={t('home.form_address')} rows={3} required value={recipient.address} onChange={e => setRecipient({...recipient, address: e.target.value})}></textarea>
                  </>
                )}

                <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{deliveryMode === 'delivery' ? t('home.delivery_time') : t('home.pickup_time')}</h3>
                <small style={{ display: 'block', marginBottom: '1rem' }}>{t('home.time_warning')}</small>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <DeliveryDatePicker
                    value={recipient.pickupDate}
                    onChange={(value) => { setRecipient({...recipient, pickupDate: value}); setTimeError(''); }}
                    minDate={minDateObj}
                    closures={closures}
                    closureMessage={closureMessage}
                    loading={closuresLoading}
                  />
                  <select
                    required
                    value={recipient.pickupSlot}
                    onChange={e => setRecipient({...recipient, pickupSlot: e.target.value})}
                  >
                    <option value="Morning (10:00 - 13:00)">Morning (10:00 - 13:00)</option>
                    <option value="Afternoon (14:00 - 20:00)">Afternoon (14:00 - 20:00)</option>
                  </select>
                </div>
                {timeError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{timeError}</div>}
                {submitError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{submitError}</div>}

                <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t('home.final_total')}: €{currentTotal.toFixed(2)}</h3>
                    <button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: 'transparent', color: 'var(--text-color)', fontWeight: 'bold', border: '1px solid var(--text-color)' }}>
                      {submitting
                        ? t('common.sending')
                        : deliveryMode === 'delivery' ? t('home.btn_delivery') : t('home.btn_pickup')}
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
