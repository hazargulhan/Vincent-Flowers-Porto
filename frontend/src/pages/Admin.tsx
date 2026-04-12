import { useState } from 'react'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [catalog, setCatalog] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8787' 
      : 'https://vincent-flowers-backend.vincent-flowers-porto.workers.dev';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        setToken(data.token)
        setAuthed(true)
        fetchCatalog()
      } else {
        alert('Invalid password')
      }
    } catch {
      alert('Network error')
    }
  }

  const fetchCatalog = async () => {
    const res = await fetch(`${apiUrl}/api/catalog`)
    const data = await res.json()
    setCatalog(data)
  }

  const saveCatalog = async () => {
    // Basic verification
    if (!catalog.makeYourOwn || !catalog.shopBouquets) {
        alert('Catalog structure is broken');
        return;
    }

    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/api/admin/catalog`, {
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
    } catch(e) {
      alert('Network error')
    }
    setSaving(false)
  }

  // Helper functions for CRUD
  const addFlowerGroup = () => {
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
      if (window.confirm('Are you sure you want to delete this flower type?')) {
          const newCat = { ...catalog };
          newCat.makeYourOwn.splice(idx, 1);
          setCatalog(newCat);
      }
  }

  const addVariant = (gIdx: number) => {
      const newCat = { ...catalog };
      newCat.makeYourOwn[gIdx].variants.push({ color: 'New Color', hexColor: '#cccccc', basePrice: 0, qty: 0 });
      setCatalog(newCat);
  }

  const deleteVariant = (gIdx: number, vIdx: number) => {
      const newCat = { ...catalog };
      newCat.makeYourOwn[gIdx].variants.splice(vIdx, 1);
      setCatalog(newCat);
  }

  const addBouquet = () => {
      const newCat = { ...catalog };
      newCat.shopBouquets.push({ title: 'New Bouquet', price: 0, img: '', available: true });
      setCatalog(newCat);
  }

  const deleteBouquet = (idx: number) => {
      if (window.confirm('Are you sure you want to delete this bouquet?')) {
          const newCat = { ...catalog };
          newCat.shopBouquets.splice(idx, 1);
          setCatalog(newCat);
      }
  }

  if (!authed) {
    return (
      <div className="container page-section" style={{ maxWidth: '400px', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center' }}>Admin Access</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Enter</button>
        </form>
      </div>
    )
  }

  if (!catalog) {
    return <div className="container page-section"><h2>Loading Inventory...</h2></div>
  }

  return (
    <div className="container page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={saveCatalog} disabled={saving} style={{ background: 'var(--text-color)', color: '#fff', padding: '0.8rem 2rem', cursor: 'pointer' }}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Make Your Own (Flowers)</h2>
            <button onClick={addFlowerGroup} style={{ padding: '0.5rem 1rem' }}>+ Add Flower Type</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {catalog.makeYourOwn.map((g: any, gIdx: number) => (
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
                    </div>
                </div>
                <button onClick={() => deleteFlowerGroup(gIdx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Delete Type</button>
              </div>

              <div style={{ paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Color Variants</h4>
                    <button onClick={() => addVariant(gIdx)} style={{ fontSize: '0.8rem' }}>+ Add Color</button>
                </div>
                {g.variants.map((v: any, vIdx: number) => (
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
          {catalog.shopBouquets.map((b: any, bIdx: number) => (
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

