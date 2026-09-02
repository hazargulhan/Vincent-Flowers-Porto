import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'
import type { OrderStatus, OrderSummary, StoredOrder } from '../types/order'

const TYPE_LABELS: Record<string, string> = {
  'make-your-own': 'Custom',
  shop: 'Shop',
  subscription: 'Subscription',
  events: 'Event',
  b2b: 'B2B',
  footer: 'Message',
}

const FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'new', label: 'New only' },
  { value: 'handled', label: 'Handled' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
]

const ROW_GRID = 'auto 100px 110px 1fr 90px 100px auto'

const btn: React.CSSProperties = {
  padding: '0.35rem 0.8rem',
  border: '1px solid var(--border-color)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.75rem',
}

function formatWhen(ms: number): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

/**
 * The order history.
 *
 * Orders used to exist only as an email, so a Resend outage lost them outright and
 * there was nothing to reconcile against. They are now stored before the email is
 * sent; this is where the owner reads them.
 *
 * `token` arrives as a prop rather than being read from Admin's state: the parent
 * calls its fetchers immediately after setToken(), before that state has flushed.
 */
export default function AdminOrders({ token }: { token: string }) {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [listComplete, setListComplete] = useState(true)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, StoredOrder>>({})
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async (nextCursor?: string | null, replace = true) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ status: filter })
      if (nextCursor) params.set('cursor', nextCursor)
      const res = await fetch(apiUrl(`/api/admin/orders?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        setError(res.status === 401
          ? 'Your session has expired. Reload the page and log in again.'
          : (data?.message || 'Failed to load orders.'))
        return
      }
      setOrders(prev => (replace ? data.orders : [...prev, ...data.orders]))
      setCursor(data.cursor)
      setListComplete(data.listComplete)
    } catch {
      setError('Network error while loading orders.')
    } finally {
      setLoading(false)
    }
  }, [filter, token])

  // Refetches whenever the filter changes; pages are never merged across filters.
  useEffect(() => { load() }, [load])

  const toggle = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (details[id]) return
    try {
      const res = await fetch(apiUrl(`/api/admin/orders/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => null)
      if (data?.success) setDetails(prev => ({ ...prev, [id]: data.order }))
    } catch {
      // The summary row stays readable on its own; nothing useful to show here.
    }
  }

  const changeStatus = async (id: string, status: OrderStatus) => {
    if (status === 'archived' && !window.confirm('Archive this order? You can still find it under the Archived filter.')) {
      return
    }
    const before = orders
    // Optimistic: the row keeps its place and shows the new status rather than
    // vanishing mid-click, even when it no longer matches the current filter.
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)))
    try {
      const res = await fetch(apiUrl(`/api/admin/orders/${id}/status`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => null)
      if (!data?.success) {
        setOrders(before)
        alert(data?.message || 'Failed to update order')
      }
    } catch {
      setOrders(before)
      alert('Network error')
    }
  }

  const query = search.trim().toLowerCase()
  const visible = query
    ? orders.filter(o => `${o.ref} ${o.name} ${o.email}`.toLowerCase().includes(query))
    : orders

  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Orders</h2>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search ref, name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.4rem' }}>
            {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button onClick={() => load()} disabled={loading} style={{ ...btn, padding: '0.5rem 1.2rem' }}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Every order is stored here for two years and then deleted automatically. A red
        <strong> email failed </strong> badge means the customer never received a confirmation
        and the notification never reached your inbox either — those orders exist only on this
        screen, so contact the customer directly. Search covers the orders already loaded;
        use Load more to reach further back.
      </p>

      {error && <p role="alert" style={{ color: '#b00020', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visible.map(o => (
          <div key={o.id} style={{ border: '1px solid var(--border-color)' }}>
            <div
              onClick={() => toggle(o.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: ROW_GRID,
                gap: '0.8rem',
                alignItems: 'center',
                padding: '0.8rem 1rem',
                cursor: 'pointer',
                background: o.status === 'new' ? '#f9f9f9' : o.status === 'archived' ? '#ececec' : 'transparent',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{formatWhen(o.createdAt)}</span>
              <strong style={{ fontSize: '0.8rem' }}>{o.ref}</strong>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{TYPE_LABELS[o.type] || o.type}</span>
              <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {o.name || o.email || '—'}
                {o.emailStatus === 'failed' && (
                  <span style={{ color: '#b00020', fontSize: '0.7rem', marginLeft: '0.6rem', whiteSpace: 'nowrap' }}>
                    email failed
                  </span>
                )}
              </span>
              <span style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                {o.total ? `€${o.total.toFixed(2)}` : '—'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>{o.status}</span>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>{expandedId === o.id ? '▲' : '▼'}</span>
            </div>

            {expandedId === o.id && (
              <div style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', fontSize: '0.85rem' }}>
                {details[o.id] ? <OrderDetail order={details[o.id]} /> : <p style={{ color: '#888' }}>Loading order...</p>}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  {o.status !== 'handled' && (
                    <button style={btn} onClick={() => changeStatus(o.id, 'handled')}>Mark handled</button>
                  )}
                  {o.status !== 'new' && (
                    <button style={btn} onClick={() => changeStatus(o.id, 'new')}>Reopen</button>
                  )}
                  {o.status !== 'archived' && (
                    <button
                      style={{ ...btn, color: '#b00020', border: 'none' }}
                      onClick={() => changeStatus(o.id, 'archived')}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {visible.length === 0 && !loading && (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            {query ? 'No loaded orders match that search.' : 'No orders yet.'}
          </p>
        )}
      </div>

      {!listComplete && (
        <button
          onClick={() => load(cursor, false)}
          disabled={loading}
          style={{ ...btn, marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <p style={{ margin: '0 0 0.3rem' }}>
      <strong>{label}:</strong> {value}
    </p>
  )
}

function OrderDetail({ order }: { order: StoredOrder }) {
  const phoneDigits = (order.buyer?.phone || order.customer?.phone || '').replace(/[^\d]/g, '')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
      <div>
        <h4 style={{ margin: '0 0 0.6rem' }}>Buyer</h4>
        <Row label="Name" value={order.buyer?.name || order.contactPerson} />
        <Row
          label="Email"
          value={order.buyer?.email && <a href={`mailto:${order.buyer.email}`}>{order.buyer.email}</a>}
        />
        <Row label="Phone" value={order.buyer?.phone} />
        <Row label="Business" value={order.businessName} />
        {phoneDigits && (
          <p style={{ margin: '0.6rem 0 0' }}>
            <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">Open in WhatsApp</a>
          </p>
        )}

        <h4 style={{ margin: '1.5rem 0 0.6rem' }}>Recipient</h4>
        <Row label="Name" value={order.customer?.name} />
        <Row
          label="Email"
          value={order.customer?.email && <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>}
        />
        <Row label="Phone" value={order.customer?.phone} />
        <Row
          label="Address"
          value={[order.customer?.address, order.customer?.city].filter(Boolean).join(', ')}
        />
      </div>

      <div>
        <h4 style={{ margin: '0 0 0.6rem' }}>Order</h4>
        <Row label="Assembly" value={order.mode} />
        <Row label="Fulfilment" value={order.deliveryMode} />
        <Row label="Delivery date" value={order.deliveryDate} />
        <Row label="Time" value={order.customer?.pickupTime} />
        <Row label="Event date" value={order.eventDate} />
        <Row label="Location" value={order.location} />
        <Row label="Size" value={order.sizeLabel} />
        <Row label="Deliveries per month" value={order.frequency ? String(order.frequency) : ''} />
        <Row
          label="Total"
          value={order.serverTotal !== undefined ? `€${order.serverTotal.toFixed(2)}` : ''}
        />

        {!!order.configuration?.length && (
          <ul style={{ margin: '0.8rem 0 0', paddingLeft: '1.2rem' }}>
            {order.configuration.map((item, i) => (
              <li key={i}>
                {item.title || `${item.name}${item.color ? ` (${item.color})` : ''}`}
                {item.qty ? ` — ${item.qty}x` : ''}
              </li>
            ))}
          </ul>
        )}

        {order.message && (
          <>
            <h4 style={{ margin: '1.5rem 0 0.6rem' }}>Message</h4>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, background: '#f4f4f4', padding: '0.8rem' }}>
              {order.message}
            </p>
          </>
        )}

        {order.emailStatus === 'failed' && (
          <p role="alert" style={{ color: '#b00020', marginTop: '1.5rem' }}>
            The confirmation email was rejected{order.emailError ? `: ${order.emailError}` : ''}. Neither
            you nor the customer received it — reach out directly.
          </p>
        )}
      </div>
    </div>
  )
}
