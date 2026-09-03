import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ImageDropzone from '../components/ImageDropzone'
import AdminOrders from '../components/AdminOrders'
import type { Catalog } from '../types/catalog'
import type { ClosurePeriod } from '../types/order'
import type { BusinessSettings } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'
import { apiUrl, mediaUrl } from '../lib/api'
import Seo from '../components/Seo'

export default function Admin() {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [saving, setSaving] = useState(false)
  const [closures, setClosures] = useState<ClosurePeriod[]>([])
  const [savingClosures, setSavingClosures] = useState(false)
  const [closureErrorMap, setClosureErrorMap] = useState<Record<string, string>>({})
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsFeedback, setSettingsFeedback] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        setToken(data.token)
        setAuthed(true)
        fetchCatalog()
        fetchClosures()
        fetchSettings()
      } else {
        alert('Invalid password')
      }
    } catch {
      alert('Network error')
    }
  }

  const fetchCatalog = async () => {
    try {
      const res = await fetch(apiUrl(`/api/catalog?t=${Date.now()}`), { cache: 'no-store' })
      const data = await res.json()
      setCatalog(data)
    } catch (err) {
      console.error('Failed to load catalog:', err)
    }
  }

  const fetchClosures = async () => {
    try {
      const res = await fetch(apiUrl(`/api/closures?t=${Date.now()}`), { cache: 'no-store' })
      const data = await res.json()
      setClosures(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load closures:', err)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(apiUrl(`/api/settings?t=${Date.now()}`), { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    setSettingsFeedback('')
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (data.success) {
        if (data.settings) setSettings(data.settings)
        setSettingsFeedback(t('admin.settings_saved'))
        setTimeout(() => setSettingsFeedback(''), 4000)
      } else {
        alert(data.message || t('admin.network_error'))
      }
    } catch {
      alert(t('admin.network_error'))
    } finally {
      setSavingSettings(false)
    }
  }

  const saveCatalog = async () => {
    if (!catalog || !catalog.makeYourOwn || !catalog.shopBouquets) {
        alert('Catalog structure is broken');
        return;
    }

    setSaving(true)
    try {
      const res = await fetch(apiUrl('/api/admin/catalog'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(catalog)
      })
      const data = await res.json()
      if(data.success) alert('Saved successfully!')
      else alert('Failed to save')
    } catch {
      alert('Network error')
    }
    setSaving(false)
  }

  /**
   * Returns a per-row error message for every closure that is not safely usable.
   *
   * This is a guard, not a nicety: a row saved with an empty startDate matches every
   * date (in JS `'2026-08-26' >= ''` is true) and silently closes the whole shop, while
   * a reversed range matches nothing so the shop stays open through the owner's holiday.
   * Neither is visible from this screen, so both are blocked before they can be saved.
   */
  const closureErrors = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    closures.forEach(c => {
      if (!c.startDate && !c.endDate) {
        errors[c.id] = 'Enter both a start and an end date, or delete this row.'
      } else if (!c.startDate) {
        errors[c.id] = 'Start date is missing.'
      } else if (!c.endDate) {
        errors[c.id] = 'End date is missing.'
      } else if (c.startDate > c.endDate) {
        errors[c.id] = 'The end date is before the start date.'
      } else if (!c.messageEn.trim() || !c.messagePt.trim()) {
        errors[c.id] = 'Both the English and Portuguese messages are required.'
      }
    })
    return errors
  }

  const saveClosures = async () => {
    const errors = closureErrors()
    if (Object.keys(errors).length > 0) {
      setClosureErrorMap(errors)
      return
    }
    setClosureErrorMap({})
    setSavingClosures(true)
    try {
      const res = await fetch(apiUrl('/api/admin/closures'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(closures)
      })
      const data = await res.json()
      if (data.success) alert('Closure periods saved!')
      else alert('Failed to save')
    } catch {
      alert('Network error')
    }
    setSavingClosures(false)
  }

  const addClosure = () => {
    setClosures([...closures, {
      id: crypto.randomUUID(),
      startDate: '',
      endDate: '',
      messageEn: 'We are currently closed for orders during this period.',
      messagePt: 'Estamos atualmente fechados para encomendas neste período.',
    }])
  }

  const updateClosure = (idx: number, field: keyof ClosurePeriod, value: string) => {
    const newClosures = [...closures]
    newClosures[idx] = { ...newClosures[idx], [field]: value }
    setClosures(newClosures)
    // Clear this row's error as soon as the owner starts correcting it.
    setClosureErrorMap(prev => {
      if (!prev[newClosures[idx].id]) return prev
      const next = { ...prev }
      delete next[newClosures[idx].id]
      return next
    })
  }

  const deleteClosure = (idx: number) => {
    if (window.confirm('Delete this closure period?')) {
      setClosures(closures.filter((_, i) => i !== idx))
    }
  }

  // Helper functions for CRUD
  const addFlowerGroup = () => {
      if (!catalog) return
      const newCat = { ...catalog };
      newCat.makeYourOwn.push({
          name: 'New Flower',
          available: true,
          image: '',
          variants: [{ color: 'Default', hexColor: '#cccccc', basePrice: 0, qty: 0 }]
      });
      setCatalog(newCat);
  }

  const deleteFlowerGroup = (idx: number) => {
      if (!catalog) return
      if (window.confirm('Are you sure you want to delete this flower type?')) {
          const newCat = { ...catalog };
          newCat.makeYourOwn.splice(idx, 1);
          setCatalog(newCat);
      }
  }

  const addVariant = (gIdx: number) => {
      if (!catalog) return
      const newCat = { ...catalog };
      newCat.makeYourOwn[gIdx].variants.push({ color: 'New Color', hexColor: '#cccccc', basePrice: 0, qty: 0 });
      setCatalog(newCat);
  }

  const deleteVariant = (gIdx: number, vIdx: number) => {
      if (!catalog) return
      const newCat = { ...catalog };
      newCat.makeYourOwn[gIdx].variants.splice(vIdx, 1);
      setCatalog(newCat);
  }

  const addBouquet = () => {
      if (!catalog) return
      const newCat = { ...catalog };
      newCat.shopBouquets.push({ title: 'New Bouquet', price: 0, img: '', available: true });
      setCatalog(newCat);
  }

  const deleteBouquet = (idx: number) => {
      if (!catalog) return
      if (window.confirm('Are you sure you want to delete this bouquet?')) {
          const newCat = { ...catalog };
          newCat.shopBouquets.splice(idx, 1);
          setCatalog(newCat);
      }
  }

  if (!authed) {
    return (
      <div className="container page-section" style={{ maxWidth: '400px', margin: 'auto' }}>
        <Seo
          title="Admin — Vincent Flowers Porto"
          description="Administration area."
          path="/admin"
          noindex
        />
        <h1 style={{ textAlign: 'center' }}>{t('admin.login_title')}</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder={t('admin.password_placeholder')}
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">{t('admin.btn_enter')}</button>
        </form>
      </div>
    )
  }

  if (!catalog) {
    return (
      <div className="container page-section">
        <Seo title="Admin — Vincent Flowers Porto" description="Administration area." path="/admin" noindex />
        <h1 style={{ marginBottom: '2rem' }}>{t('admin.dashboard_title')}</h1>
        <AdminOrders token={token} />
        <p style={{ color: '#888' }}>{t('admin.loading_inventory')}</p>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <Seo
        title="Admin — Vincent Flowers Porto"
        description="Administration area."
        path="/admin"
        noindex
      />

      <h1 style={{ marginBottom: '2rem' }}>{t('admin.dashboard_title')}</h1>

      <AdminOrders token={token} />

      <div style={{ marginBottom: '4rem' }}>
        <div className="admin-section-header">
            <h2 style={{ margin: 0 }}>{t('admin.closures_title')}</h2>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button onClick={addClosure} style={{ padding: '0.5rem 1rem' }}>{t('admin.btn_add_closure')}</button>
              <button onClick={saveClosures} disabled={savingClosures} style={{ background: 'var(--text-color)', color: '#fff', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
                {savingClosures ? t('admin.saving') : t('admin.btn_save_closures')}
              </button>
            </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
          {t('admin.closures_desc')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {closures.map((c, idx) => (
            <div key={c.id} style={{ border: `1px solid ${closureErrorMap[c.id] ? '#b00020' : 'var(--border-color)'}`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {closureErrorMap[c.id] && (
                <p role="alert" style={{ margin: 0, color: '#b00020', fontSize: '0.85rem' }}>
                  {closureErrorMap[c.id]}
                </p>
              )}
              <div className="admin-closure-inputs" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <label style={{ fontSize: '0.7rem' }}>{t('admin.start_date')}</label>
                  <input type="date" value={c.startDate} onChange={e => updateClosure(idx, 'startDate', e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <label style={{ fontSize: '0.7rem' }}>{t('admin.end_date')}</label>
                  <input type="date" value={c.endDate} onChange={e => updateClosure(idx, 'endDate', e.target.value)} />
                </div>
                <button onClick={() => deleteClosure(idx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', alignSelf: 'flex-end', padding: '0.4rem 0' }}>{t('admin.btn_delete')}</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.7rem' }}>{t('admin.message_en')}</label>
                <textarea rows={2} value={c.messageEn} onChange={e => updateClosure(idx, 'messageEn', e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.7rem' }}>{t('admin.message_pt')}</label>
                <textarea rows={2} value={c.messagePt} onChange={e => updateClosure(idx, 'messagePt', e.target.value)} />
              </div>
            </div>
          ))}
          {closures.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('admin.no_closures')}</p>}
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div className="admin-section-header">
          <h2 style={{ margin: 0 }}>{t('admin.settings_title')}</h2>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {settingsFeedback && (
              <span style={{ color: '#2e7d32', fontSize: '0.9rem', fontWeight: 600 }}>
                ✓ {settingsFeedback}
              </span>
            )}
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              style={{ background: 'var(--text-color)', color: '#fff', padding: '0.5rem 1.5rem', cursor: 'pointer' }}
            >
              {savingSettings ? t('admin.saving') : t('admin.btn_save_settings')}
            </button>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
          {t('admin.settings_desc')}
        </p>

        <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Group 1: Custom Bouquet Rules */}
          <div>
            <h4 style={{ margin: '0 0 0.8rem' }}>Make Your Own Rules</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t('admin.settings_min_order')}</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={settings.minOrderTotal}
                  onChange={e => setSettings({ ...settings, minOrderTotal: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t('admin.settings_bouquet_fee')}</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={settings.bouquetFeePercent}
                  onChange={e => setSettings({ ...settings, bouquetFeePercent: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Group 2: Subscription Monthly Tiers */}
          <div>
            <h4 style={{ margin: '0 0 0.8rem' }}>{t('admin.settings_sub_pricing')}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t('admin.settings_sub_small')}</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={settings.subscriptionPricing.small}
                  onChange={e => setSettings({
                    ...settings,
                    subscriptionPricing: { ...settings.subscriptionPricing, small: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t('admin.settings_sub_medium')}</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={settings.subscriptionPricing.medium}
                  onChange={e => setSettings({
                    ...settings,
                    subscriptionPricing: { ...settings.subscriptionPricing, medium: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t('admin.settings_sub_large')}</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={settings.subscriptionPricing.large}
                  onChange={e => setSettings({
                    ...settings,
                    subscriptionPricing: { ...settings.subscriptionPricing, large: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Group 3: Delivery Cities */}
          <div>
            <h4 style={{ margin: '0 0 0.8rem' }}>{t('admin.settings_delivery_cities')}</h4>
            <input
              type="text"
              value={settings.deliveryCities.join(', ')}
              placeholder="Porto, Gaia, Maia, Matosinhos"
              onChange={e => {
                const raw = e.target.value
                const cities = raw.split(',').map(s => s.trim())
                setSettings({ ...settings, deliveryCities: cities })
              }}
            />
            <small style={{ color: '#777', marginTop: '0.3rem', display: 'block' }}>
              Separate city names with commas. Customers can only select these cities when choosing Delivery.
            </small>
          </div>

          {/* Group 4: Operating Hours */}
          <div>
            <h4 style={{ margin: '0 0 0.8rem' }}>{t('admin.settings_hours')}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t('admin.settings_opening_time')}</label>
                <input
                  type="text"
                  placeholder="09:00"
                  value={settings.openingHours.start}
                  onChange={e => setSettings({
                    ...settings,
                    openingHours: { ...settings.openingHours, start: e.target.value }
                  })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t('admin.settings_closing_time')}</label>
                <input
                  type="text"
                  placeholder="18:00"
                  value={settings.openingHours.end}
                  onChange={e => setSettings({
                    ...settings,
                    openingHours: { ...settings.openingHours, end: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div className="admin-section-header">
            <h2 style={{ margin: 0 }}>{t('admin.catalog_title')}</h2>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button onClick={addFlowerGroup} style={{ padding: '0.5rem 1rem' }}>{t('admin.btn_add_flower')}</button>
              <button onClick={saveCatalog} disabled={saving} style={{ background: 'var(--text-color)', color: '#fff', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
                {saving ? t('admin.saving') : t('admin.btn_save_catalog')}
              </button>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {catalog.makeYourOwn.map((g, gIdx) => (
            <div key={gIdx} className="admin-flower-card" style={{ background: g.available ? 'transparent' : '#f0f0f0' }}>
              <div className="admin-flower-header">
                <div className="admin-flower-title-row">
                  <input
                    type="text"
                    value={g.name}
                    className="admin-flower-name-input"
                    style={{ fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent' }}
                    onChange={e => {
                      const newCat = {...catalog};
                      newCat.makeYourOwn[gIdx].name = e.target.value;
                      setCatalog(newCat);
                    }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={g.available}
                      onChange={e => {
                        const newCat = {...catalog};
                        newCat.makeYourOwn[gIdx].available = e.target.checked;
                        setCatalog(newCat);
                      }}
                    />
                    {g.available ? t('admin.active') : t('admin.hidden_frozen')}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => deleteFlowerGroup(gIdx)}
                  className="admin-flower-delete-btn"
                >
                  {t('admin.btn_delete_type')}
                </button>
              </div>

              <div className="admin-flower-image-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#666' }}>{t('admin.visualizer_image')}</label>
                  {g.image?.startsWith('/media/') ? (
                    <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 600 }}>☁️ {t('admin.stored_r2')}</span>
                  ) : g.image?.includes('github') ? (
                    <span style={{ fontSize: '0.72rem', color: '#d32f2f', fontWeight: 600 }}>⚠️ {t('admin.stored_github')}</span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {g.image && (
                    <img
                      src={mediaUrl(g.image)}
                      alt={g.name}
                      style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', padding: '2px', flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                  <input
                    type="text"
                    placeholder="/media/flowers/example.webp or /images/..."
                    value={g.image}
                    style={{ flex: 1, minWidth: 0, padding: '0.4rem' }}
                    onChange={e => {
                      const newCat = {...catalog};
                      newCat.makeYourOwn[gIdx].image = e.target.value;
                      setCatalog(newCat);
                    }}
                  />
                </div>
                <ImageDropzone
                  token={token}
                  onUploaded={(url) => {
                    const newCat = {...catalog};
                    newCat.makeYourOwn[gIdx].image = url;
                    setCatalog(newCat);
                  }}
                />
              </div>

              <div className="admin-flower-variants-container" style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>{t('admin.color_variants')}</h4>
                    <button onClick={() => addVariant(gIdx)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>{t('admin.btn_add_color')}</button>
                </div>
                {g.variants.map((v, vIdx) => (
                  <div key={vIdx} className="admin-variant-grid">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.7rem' }}>{t('admin.color_name')}</label>
                        <input
                            type="text"
                            value={v.color}
                            onChange={e => {
                                const newCat = {...catalog}
                                newCat.makeYourOwn[gIdx].variants[vIdx].color = e.target.value
                                setCatalog(newCat)
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.7rem' }}>{t('admin.hex_code')}</label>
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                            <div style={{ width: '22px', height: '22px', backgroundColor: v.hexColor, border: '1px solid #ccc', borderRadius: '3px', flexShrink: 0 }}></div>
                            <input
                                type="text"
                                value={v.hexColor}
                                style={{ width: '100%' }}
                                onChange={e => {
                                    const newCat = {...catalog}
                                    newCat.makeYourOwn[gIdx].variants[vIdx].hexColor = e.target.value
                                    setCatalog(newCat)
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.7rem' }}>{t('admin.price')}</label>
                        <input
                            type="number"
                            step="0.01"
                            value={v.basePrice}
                            onChange={e => {
                                const newCat = {...catalog}
                                newCat.makeYourOwn[gIdx].variants[vIdx].basePrice = parseFloat(e.target.value) || 0
                                setCatalog(newCat)
                            }}
                        />
                    </div>
                    <div className="admin-variant-delete-btn">
                      <button onClick={() => deleteVariant(gIdx, vIdx)} style={{ fontSize: '0.75rem', color: '#b00020', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.3rem 0' }}>{t('admin.btn_delete')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div className="admin-section-header">
            <h2 style={{ margin: 0 }}>{t('admin.shop_bouquets_title')}</h2>
            <button onClick={addBouquet} style={{ padding: '0.5rem 1rem' }}>{t('admin.btn_add_bouquet')}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {catalog.shopBouquets.map((b, bIdx) => (
             <div key={bIdx} className="admin-bouquet-card" style={{ background: b.available ? '#f9f9f9' : '#ececec' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                 <label style={{ fontSize: '0.8rem' }}>{t('admin.bouquet_title')}</label>
                 <input
                    type="text"
                    value={b.title}
                    onChange={e => {
                        const newCat = {...catalog}
                        newCat.shopBouquets[bIdx].title = e.target.value
                        setCatalog(newCat)
                    }}
                 />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                 <label style={{ fontSize: '0.8rem' }}>{t('admin.price')}</label>
                 <input
                    type="number"
                    step="0.01"
                    value={b.price}
                    onChange={e => {
                        const newCat = {...catalog}
                        newCat.shopBouquets[bIdx].price = parseFloat(e.target.value) || 0
                        setCatalog(newCat)
                    }}
                 />
               </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem' }}>{t('admin.image_url')}</label>
                    {b.img?.startsWith('/media/') ? (
                      <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 600 }}>☁️ {t('admin.stored_r2')}</span>
                    ) : b.img?.includes('github') ? (
                      <span style={{ fontSize: '0.72rem', color: '#d32f2f', fontWeight: 600 }}>⚠️ {t('admin.stored_github')}</span>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {b.img && (
                      <img
                        src={mediaUrl(b.img)}
                        alt={b.title}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', flexShrink: 0 }}
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    )}
                    <input
                       type="text"
                       value={b.img}
                       style={{ flex: 1, minWidth: 0 }}
                       onChange={e => {
                           const newCat = {...catalog}
                           newCat.shopBouquets[bIdx].img = e.target.value
                           setCatalog(newCat)
                       }}
                    />
                  </div>
                  <ImageDropzone
                    token={token}
                    onUploaded={(url) => {
                      const newCat = {...catalog};
                      newCat.shopBouquets[bIdx].img = url;
                      setCatalog(newCat);
                    }}
                  />
                </div>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={b.available}
                        onChange={e => {
                            const newCat = {...catalog}
                            newCat.shopBouquets[bIdx].available = e.target.checked
                            setCatalog(newCat)
                        }}
                    />
                    {b.available ? t('admin.active') : t('admin.hidden')}
               </label>
               <button onClick={() => deleteBouquet(bIdx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: '0.5rem', alignSelf: 'flex-end' }}>{t('admin.btn_delete')}</button>
             </div>
          ))}
        </div>
      </div>
    </div>
  )
}
