import { useState } from 'react'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:8787/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        setAuthed(true)
      } else {
        alert('Invalid password')
      }
    } catch {
      alert('Network error')
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

  return (
    <div className="container page-section">
      <h1>Dashboard</h1>
      <div className="grid">
        <div style={{ border: '1px solid var(--border-color)', padding: '2rem' }}>
          <h3>Inventory Management</h3>
          <p>Update stock levels and base prices for builder items.</p>
          <button>Sync with Database</button>
        </div>
        <div style={{ border: '1px solid var(--border-color)', padding: '2rem' }}>
          <h3>Order Queue</h3>
          <p>Recent configuration orders and subscription requests.</p>
          <ul>
            <li>Order #1001 - Modern Bouquet ($25.00)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
