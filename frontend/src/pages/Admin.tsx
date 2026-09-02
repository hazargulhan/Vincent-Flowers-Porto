import { useState } from 'react'
import ImageDropzone from '../components/ImageDropzone'
import AdminOrders from '../components/AdminOrders'
import type { Catalog } from '../types/catalog'
import type { ClosurePeriod } from '../types/order'
import { apiUrl } from '../lib/api'
import Seo from '../components/Seo'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [saving, setSaving] = useState(false)
  const [closures, setClosures] = useState<ClosurePeriod[]>([])
  const [savingClosures, setSavingClosures] = useState(false)
  const [closureErrorMap, setClosureErrorMap] = useState<Record<string, string>>({})

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
      } else {
        alert('Invalid password')
      }
    } catch {
      alert('Network error')
    }
  }

  const fetchCatalog = async () => {
    const res = await fetch(apiUrl('/api/catalog'))
    const data = await res.json()
    setCatalog(data)
  }

  const fetchClosures = async () => {
    const res = await fetch(apiUrl('/api/closures'))
    const data = await res.json()
    setClosures(Array.isArray(data) ? data : [])
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
        <h1 style={{ textAlign: 'center' }}>Admin Access</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Enter</button>
        </form>
      </div>
    )
  }

  if (!catalog) {
    // Orders do not depend on the catalog, and gating the whole dashboard behind it
    // meant a failed catalog fetch also hid the order history.
    return (
      <div className="container page-section">
        <Seo title="Admin — Vincent Flowers Porto" description="Administration area." path="/admin" noindex />
        <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
        <AdminOrders token={token} />
        <p style={{ color: '#888' }}>Loading inventory...</p>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
      </div>

      <AdminOrders token={token} />

      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Closure Periods</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={addClosure} style={{ padding: '0.5rem 1rem' }}>+ Add Closure</button>
              <button onClick={saveClosures} disabled={savingClosures} style={{ background: 'var(--text-color)', color: '#fff', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
                {savingClosures ? 'Saving...' : 'Save Closures'}
              </button>
            </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
          Dates inside a closure period cannot be selected in Make Your Own / Shop, and Subscription sign-ups are hidden while a closure is active today. Customers will see the message you write below.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {closures.map((c, idx) => (
            <div key={c.id} style={{ border: `1px solid ${closureErrorMap[c.id] ? '#b00020' : 'var(--border-color)'}`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {closureErrorMap[c.id] && (
                <p role="alert" style={{ margin: 0, color: '#b00020', fontSize: '0.85rem' }}>
                  {closureErrorMap[c.id]}
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.7rem' }}>Start Date</label>
                  <input type="date" value={c.startDate} onChange={e => updateClosure(idx, 'startDate', e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.7rem' }}>End Date</label>
                  <input type="date" value={c.endDate} onChange={e => updateClosure(idx, 'endDate', e.target.value)} />
                </div>
                <button onClick={() => deleteClosure(idx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', alignSelf: 'flex-end' }}>Delete</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.7rem' }}>Message shown to customers (English)</label>
                <textarea rows={2} value={c.messageEn} onChange={e => updateClosure(idx, 'messageEn', e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.7rem' }}>Mensagem para clientes (Português)</label>
                <textarea rows={2} value={c.messagePt} onChange={e => updateClosure(idx, 'messagePt', e.target.value)} />
              </div>
            </div>
          ))}
          {closures.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>No closure periods defined.</p>}
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Make Your Own (Flowers)</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={addFlowerGroup} style={{ padding: '0.5rem 1rem' }}>+ Add Flower Type</button>
              <button onClick={saveCatalog} disabled={saving} style={{ background: 'var(--text-color)', color: '#fff', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {catalog.makeYourOwn.map((g, gIdx) => (
            <div key={gIdx} style={{ border: '1px solid var(--border-color)', padding: '1.5rem', background: g.available ? 'transparent' : '#f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={g.name}
                            style={{ fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent' }}
                            onChange={e => {
                                const newCat = {...catalog};
                                newCat.makeYourOwn[gIdx].name = e.target.value;
                                setCatalog(newCat);
                            }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={g.available}
                                onChange={e => {
                                    const newCat = {...catalog};
                                    newCat.makeYourOwn[gIdx].available = e.target.checked;
                                    setCatalog(newCat);
                                }}
                            />
                            {g.available ? 'Active' : 'Hidden (Frozen)'}
                        </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Visualizer Image Path/URL</label>
                        <input
                            type="text"
                            placeholder="/images/flowers/example.webp or https://..."
                            value={g.image}
                            style={{ width: '100%', padding: '0.4rem' }}
                            onChange={e => {
                                const newCat = {...catalog};
                                newCat.makeYourOwn[gIdx].image = e.target.value;
                                setCatalog(newCat);
                            }}
                        />
                        <ImageDropzone
                          token={token}
                          onUploaded={(url) => {
                            const newCat = {...catalog};
                            newCat.makeYourOwn[gIdx].image = url;
                            setCatalog(newCat);
                          }}
                        />
                    </div>
                </div>
                <button onClick={() => deleteFlowerGroup(gIdx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Delete Type</button>
              </div>

              <div style={{ paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Color Variants</h4>
                    <button onClick={() => addVariant(gIdx)} style={{ fontSize: '0.8rem' }}>+ Add Color</button>
                </div>
                {g.variants.map((v, vIdx) => (
                  <div key={vIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.7rem' }}>Color Name</label>
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
                        <label style={{ fontSize: '0.7rem' }}>Hex Code (#...)</label>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: v.hexColor, border: '1px solid #ccc' }}></div>
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
                        <label style={{ fontSize: '0.7rem' }}>Price (€)</label>
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
                    <button onClick={() => deleteVariant(gIdx, vIdx)} style={{ fontSize: '0.7rem', color: '#999', border: 'none', background: 'transparent' }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Shop (Ready Bouquets)</h2>
            <button onClick={addBouquet} style={{ padding: '0.5rem 1rem' }}>+ Add Bouquet</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {catalog.shopBouquets.map((b, bIdx) => (
             <div key={bIdx} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: b.available ? '#f9f9f9' : '#ececec', display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 100px 1fr 150px auto', gap: '1.5rem', alignItems: 'flex-end' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                 <label style={{ fontSize: '0.8rem' }}>Bouquet Title</label>
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
                 <label style={{ fontSize: '0.8rem' }}>Price (€)</label>
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
                 <label style={{ fontSize: '0.8rem' }}>Image URL/Path</label>
                 <input
                    type="text"
                    value={b.img}
                    onChange={e => {
                        const newCat = {...catalog}
                        newCat.shopBouquets[bIdx].img = e.target.value
                        setCatalog(newCat)
                    }}
                 />
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
                    {b.available ? 'Active' : 'Hidden'}
               </label>
               <button onClick={() => deleteBouquet(bIdx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: '0.5rem' }}>Delete</button>
             </div>
          ))}
        </div>
      </div>
    </div>
  )
}
