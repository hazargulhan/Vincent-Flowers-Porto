import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../lib/api'
import type { OrderStatus, OrderSummary, StoredOrder } from '../types/order'

const btn: React.CSSProperties = {
  padding: '0.35rem 0.8rem',
  border: '1px solid var(--border-color)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.75rem',
}

function formatWhen(ms: number, lng: string): string {
  if (!ms) return '—'
  const locale = lng === 'pt' ? 'pt-PT' : 'en-GB'
  return new Date(ms).toLocaleString(locale, {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrders({ token }: { token: string }) {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [listComplete, setListComplete] = useState(true)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, StoredOrder>>({})
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const filters = [
    { value: 'active', label: t('admin.filter_active') },
    { value: 'new', label: t('admin.filter_new') },
    { value: 'handled', label: t('admin.filter_handled') },
    { value: 'archived', label: t('admin.filter_archived') },
    { value: 'all', label: t('admin.filter_all') },
  ]

  const typeLabels: Record<string, string> = {
    'make-your-own': t('admin.order_type_custom'),
    shop: t('admin.order_type_shop'),
    subscription: t('admin.order_type_subscription'),
    events: t('admin.order_type_events'),
    b2b: t('admin.order_type_b2b'),
    footer: t('admin.order_type_footer'),
  }

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
        setError(data?.message || 'Failed to load orders')
        return
      }
      setOrders(prev => (replace ? data.orders : [...prev, ...data.orders]))
      setCursor(data.nextCursor || null)
      setListComplete(!data.nextCursor)
    } catch {
      setError(t('admin.network_error'))
    } finally {
      setLoading(false)
    }
  }, [filter, token, t])

  useEffect(() => {
    load(null, true)
  }, [load])

  const toggle = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!details[id]) {
      try {
        const res = await fetch(apiUrl(`/api/admin/orders/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => null)
        if (data?.order) {
          setDetails(prev => ({ ...prev, [id]: data.order }))
        }
      } catch {
        // Fall back to showing the loading failure message.
      }
    }
  }

  const changeStatus = async (id: string, next: OrderStatus) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/orders/${id}/status`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        alert(data?.message || 'Status update failed')
        return
      }
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: next } : o)))
      if (details[id]) {
        setDetails(prev => ({ ...prev, [id]: { ...prev[id], status: next } }))
      }
    } catch {
      alert(t('admin.network_error'))
    }
  }

  const query = search.trim().toLowerCase()
  const visible = query
    ? orders.filter(o => `${o.ref} ${o.name} ${o.email}`.toLowerCase().includes(query))
    : orders

  return (
    <div style={{ marginBottom: '4rem' }}>
      <div className="admin-section-header">
        <h2 style={{ margin: 0 }}>{t('admin.orders_title')}</h2>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder={t('admin.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', minWidth: '180px' }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.4rem' }}>
            {filters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button onClick={() => load()} disabled={loading} style={{ ...btn, padding: '0.5rem 1.2rem' }}>
            {loading ? t('admin.saving') : t('admin.btn_refresh')}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        {t('admin.orders_desc')}
      </p>

      {error && <p role="alert" style={{ color: '#b00020', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {visible.map(o => (
          <div key={o.id} style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              onClick={() => toggle(o.id)}
              className="admin-order-row"
              style={{
                background: o.status === 'new' ? '#f9f9f9' : o.status === 'archived' ? '#ececec' : 'transparent',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{formatWhen(o.createdAt, i18n.language)}</span>
              <strong style={{ fontSize: '0.8rem' }}>{o.ref}</strong>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{typeLabels[o.type] || o.type}</span>
              <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {o.name || o.email || '—'}
                {o.emailStatus === 'failed' && (
                  <span style={{ color: '#b00020', fontSize: '0.7rem', marginLeft: '0.6rem', whiteSpace: 'nowrap' }}>
                    {t('admin.email_failed')}
                  </span>
                )}
              </span>
              <span style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                {o.total ? `€${o.total.toFixed(2)}` : '—'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'capitalize' }}>
                {t(`admin.status_${o.status}`) || o.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>{expandedId === o.id ? '▲' : '▼'}</span>
            </div>

            <div
              onClick={() => toggle(o.id)}
              className="admin-order-mobile-card"
              style={{
                background: o.status === 'new' ? '#fbf8f3' : o.status === 'archived' ? '#f0f0f0' : '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{o.ref}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '3px' }}>
                    {typeLabels[o.type] || o.type}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '3px',
                    textTransform: 'capitalize',
                    background: o.status === 'new' ? '#e3f2fd' : o.status === 'handled' ? '#e8f5e9' : '#e0e0e0',
                    color: o.status === 'new' ? '#1565c0' : o.status === 'handled' ? '#2e7d32' : '#616161'
                  }}>
                    {t(`admin.status_${o.status}`) || o.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>{expandedId === o.id ? '▲' : '▼'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {o.name || o.email || '—'}
                  {o.emailStatus === 'failed' && (
                    <span style={{ color: '#b00020', fontSize: '0.7rem', marginLeft: '0.4rem' }}>
                      ({t('admin.email_failed')})
                    </span>
                  )}
                </span>
                <strong style={{ fontSize: '0.9rem' }}>
                  {o.total ? `€${o.total.toFixed(2)}` : '—'}
                </strong>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                {formatWhen(o.createdAt, i18n.language)}
              </div>
            </div>

            {expandedId === o.id && (
              <div style={{ borderTop: '1px solid var(--border-color)', padding: '1.2rem', fontSize: '0.85rem' }}>
                {details[o.id] ? <OrderDetail order={details[o.id]} /> : <p style={{ color: '#888' }}>{t('admin.loading_order')}</p>}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                  {o.status !== 'handled' && (
                    <button style={btn} onClick={() => changeStatus(o.id, 'handled')}>{t('admin.btn_mark_handled')}</button>
                  )}
                  {o.status !== 'new' && (
                    <button style={btn} onClick={() => changeStatus(o.id, 'new')}>{t('admin.btn_reopen')}</button>
                  )}
                  {o.status !== 'archived' && (
                    <button
                      style={{ ...btn, color: '#b00020', border: 'none' }}
                      onClick={() => changeStatus(o.id, 'archived')}
                    >
                      {t('admin.btn_archive')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {visible.length === 0 && !loading && (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            {query ? t('admin.no_orders_match') : t('admin.no_orders_yet')}
          </p>
        )}
      </div>

      {!listComplete && (
        <button
          onClick={() => load(cursor, false)}
          disabled={loading}
          style={{ ...btn, marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          {loading ? t('admin.saving') : t('admin.btn_load_more')}
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
  const { t } = useTranslation()
  const phoneDigits = (order.buyer?.phone || order.customer?.phone || '').replace(/[^\d]/g, '')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
      <div>
        <h4 style={{ margin: '0 0 0.6rem' }}>{t('admin.detail_customer')}</h4>
        <Row label="Name" value={order.buyer?.name || order.contactPerson} />
        <Row
          label="Email"
          value={order.buyer?.email && <a href={`mailto:${order.buyer.email}`}>{order.buyer.email}</a>}
        />
        <Row label={t('admin.detail_phone')} value={order.buyer?.phone} />
        <Row label="Business" value={order.businessName} />
        {phoneDigits && (
          <p style={{ margin: '0.6rem 0 0' }}>
            <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">Open in WhatsApp</a>
          </p>
        )}

        <h4 style={{ margin: '1.5rem 0 0.6rem' }}>{t('admin.detail_recipient')}</h4>
        <Row label="Name" value={order.customer?.name} />
        <Row
          label="Email"
          value={order.customer?.email && <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>}
        />
        <Row label={t('admin.detail_phone')} value={order.customer?.phone} />
        <Row
          label={t('admin.detail_address')}
          value={[order.customer?.address, order.customer?.city].filter(Boolean).join(', ')}
        />
      </div>

      <div>
        <h4 style={{ margin: '0 0 0.6rem' }}>{t('admin.detail_type')}</h4>
        <Row label="Assembly" value={order.mode} />
        <Row label="Fulfilment" value={order.deliveryMode} />
        <Row label={t('admin.detail_time')} value={[order.deliveryDate, order.customer?.pickupTime].filter(Boolean).join(' ')} />
        <Row label="Event date" value={order.eventDate} />
        <Row label="Location" value={order.location} />
        <Row label="Size" value={order.sizeLabel} />
        <Row label="Deliveries per month" value={order.frequency ? String(order.frequency) : ''} />
        <Row
          label={t('admin.detail_total')}
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
