import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Resend } from 'resend'
import type {
  Catalog,
  ClosurePeriod,
  ConfigurationItem,
  OrderBody,
  OrderSummary,
  StoredOrder,
} from './types'

type Env = {
  RESEND_API_KEY: string
  VINCENT_INVENTORY: KVNamespace
  VINCENT_MEDIA?: R2Bucket
  ADMIN_PASSWORD?: string
  ADMIN_TOKEN_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()

const ALLOWED_ORIGINS = [
  'https://vincentflowersporto.com',
  'https://www.vincentflowersporto.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

/** Cloudflare Pages production alias and per-branch preview deployments. */
const PAGES_PREVIEW = /^https:\/\/[a-z0-9-]+\.vincent-flowers-porto\.pages\.dev$/

function isAllowedOrigin(origin: string | undefined | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin) || PAGES_PREVIEW.test(origin)
}

app.use('/*', cors({ origin: (origin) => (isAllowedOrigin(origin) ? origin : null) }))

app.onError((err, c) => {
  // Log the detail server-side; never return err.message/err.stack to the client,
  // which would leak file paths, bundled internals and library versions.
  console.error('Unhandled error:', err)
  return c.json({ success: false, message: 'Something went wrong. Please try again.' }, 500)
})

app.get('/', (c) => {
  return c.text('Vincent Flowers API')
})

// --- Admin token: HMAC-signed, expiring token instead of a hardcoded string ---

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return [...new Uint8Array(sigBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const ADMIN_SESSION_MS = 1000 * 60 * 60 * 8 // 8 hours

async function signAdminToken(secret: string): Promise<string> {
  const payload = `admin:${Date.now() + ADMIN_SESSION_MS}`
  const sig = await hmacHex(secret, payload)
  return `${payload}.${sig}`
}

async function verifyAdminToken(secret: string, token: string): Promise<boolean> {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const [, expiresAtStr] = payload.split(':')
  const expiresAt = Number(expiresAtStr)
  if (!expiresAt || Date.now() > expiresAt) return false
  const expectedSig = await hmacHex(secret, payload)
  return timingSafeEqual(expectedSig, sig)
}

async function requireAdmin(c: { req: { header: (name: string) => string | undefined }; env: Env }): Promise<boolean> {
  const secret = c.env.ADMIN_TOKEN_SECRET || c.env.ADMIN_PASSWORD
  if (!secret) return false
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return false
  return verifyAdminToken(secret, token)
}

// --- Closures helpers ---

async function getClosures(env: Env): Promise<ClosurePeriod[]> {
  try {
    const data = await env.VINCENT_INVENTORY.get('closures', 'json')
    return Array.isArray(data) ? (data as ClosurePeriod[]) : []
  } catch {
    return []
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * A closure is only usable if both ends are real dates in the right order.
 * Without this guard an empty startDate matches every date (`'2026-08-26' >= ''`
 * is true) and shuts the shop permanently, while a reversed range matches nothing
 * and silently lets orders through during the owner's holiday.
 */
export function isValidClosure(cl: ClosurePeriod): boolean {
  return (
    !!cl &&
    ISO_DATE.test(cl.startDate || '') &&
    ISO_DATE.test(cl.endDate || '') &&
    cl.startDate <= cl.endDate
  )
}

function findClosure(dateStr: string, closures: ClosurePeriod[]): ClosurePeriod | undefined {
  if (!ISO_DATE.test(dateStr || '')) return undefined
  return closures.find((cl) => isValidClosure(cl) && dateStr >= cl.startDate && dateStr <= cl.endDate)
}

/**
 * Today in the shop's own timezone. Plain toISOString() is UTC, which in Portuguese
 * summer (UTC+1) reports "yesterday" between midnight and 01:00 local — so the server
 * and the browser would disagree about whether the shop is closed.
 */
function todayIso(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

// --- Outbound email safety ---

/**
 * Every customer-supplied field below is interpolated into an email that goes to the
 * shop AND back to the buyer, sent from our own verified domain. Interpolated raw, a
 * crafted "message" renders as markup: a phishing mail carrying our own From:.
 */
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Subjects are not HTML, but a newline in one lets a caller forge extra headers. */
function safeSubject(value: unknown): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120)
}

// --- Pricing ---
//
// The browser sends `total` and per-item prices, and they used to be echoed straight
// into the email, so a hand-rolled POST could claim any figure it liked. These mirror
// the frontend's rules; here they are the authority.

const PRICING = {
  /** Assembling loose stems into a bouquet costs 25% on top of the stem total. */
  BOUQUET_MULTIPLIER: 1.25,
  /** Minimum stem subtotal for a custom order, before the bouquet fee. */
  MIN_STEM_TOTAL: 15,
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

type PricedOrder = { stemTotal: number; total: number }

/**
 * Recomputes the money from the stored catalog. A flower or bouquet we cannot match
 * prices at 0 rather than at whatever the client claimed. Returns null for the types
 * we hold no server-side prices for (subscription/events/b2b/footer).
 */
function priceOrder(
  type: OrderBody['type'],
  configuration: ConfigurationItem[] | undefined,
  mode: string | undefined,
  catalog: Catalog
): PricedOrder | null {
  if (type === 'make-your-own') {
    const stemTotal = (configuration || []).reduce((sum, item) => {
      const group = (catalog.makeYourOwn || []).find((g) => g.name === item.name)
      const variant = group?.variants?.find((v) => v.color === item.color)
      return sum + num(variant?.basePrice) * Math.max(0, Math.floor(num(item.qty)))
    }, 0)
    const total = mode === 'bouquet' ? stemTotal * PRICING.BOUQUET_MULTIPLIER : stemTotal
    return { stemTotal: round2(stemTotal), total: round2(total) }
  }

  if (type === 'shop') {
    const title = configuration?.[0]?.title
    const bouquet = (catalog.shopBouquets || []).find((b) => b.title === title && b.available)
    if (!bouquet) return null
    return { stemTotal: num(bouquet.price), total: round2(num(bouquet.price)) }
  }

  return null
}

// --- Order persistence ---
//
// An order used to exist only as an email: if Resend rejected the send it was gone,
// with no history and nothing to reconcile. Orders are now written to KV *before* the
// email goes out, so the email is only a notification about a record that exists.

const ORDER_TYPES: OrderBody['type'][] = [
  'make-your-own',
  'shop',
  'subscription',
  'events',
  'b2b',
  'footer',
]

/** Automatic erasure at two years: no cron, no cleanup endpoint, no owner action. */
const ORDER_RETENTION_DAYS = 730

/** I, O, 0 and 1 are left out: references get read out over the phone. */
const REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

const ORDER_ID = /^\d{13}-[0-9A-Z]{6}$/

const FIELD_MAX = 200
const MESSAGE_MAX = 4000
const CONFIG_MAX_ITEMS = 100

function clip(value: unknown, max: number): string {
  return String(value ?? '').slice(0, max)
}

function randomRef(): string {
  // 256 / 32 is exact, so the modulo introduces no bias.
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return [...bytes].map((b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('')
}

/**
 * KV lists keys in lexicographic order, so counting the timestamp *down* makes
 * list({ prefix: 'order:' }) return newest-first with no sorting and no index.
 */
function makeOrderIds(createdAt: number): { id: string; ref: string } {
  const rand = randomRef()
  return {
    id: `${String(9_999_999_999_999 - createdAt).padStart(13, '0')}-${rand}`,
    ref: `VF-${rand}`,
  }
}

/** Caps every string so a hostile 32 KB body cannot bloat the stored record. */
function sanitizeOrderBody(body: OrderBody): OrderBody {
  return {
    type: body.type,
    customer: body.customer && {
      name: clip(body.customer.name, FIELD_MAX),
      email: clip(body.customer.email, FIELD_MAX),
      phone: clip(body.customer.phone, FIELD_MAX),
      address: clip(body.customer.address, FIELD_MAX),
      city: clip(body.customer.city, FIELD_MAX),
      pickupTime: clip(body.customer.pickupTime, FIELD_MAX),
    },
    buyer: body.buyer && {
      name: clip(body.buyer.name, FIELD_MAX),
      email: clip(body.buyer.email, FIELD_MAX),
      phone: clip(body.buyer.phone, FIELD_MAX),
    },
    total: num(body.total),
    configuration: (body.configuration || []).slice(0, CONFIG_MAX_ITEMS).map((item) => ({
      name: clip(item.name, FIELD_MAX),
      title: clip(item.title, FIELD_MAX),
      color: clip(item.color, FIELD_MAX),
      price: num(item.price),
      qty: Math.max(0, Math.floor(num(item.qty))),
    })),
    // Left undefined when absent: the email decides whether to print an address by
    // testing this, so defaulting it to 'delivery' would add a blank address line.
    deliveryMode:
      body.deliveryMode === 'delivery' || body.deliveryMode === 'pickup' ? body.deliveryMode : undefined,
    mode: clip(body.mode, FIELD_MAX),
    deliveryDate: clip(body.deliveryDate, FIELD_MAX),
    message: clip(body.message, MESSAGE_MAX),
    businessName: clip(body.businessName, FIELD_MAX),
    contactPerson: clip(body.contactPerson, FIELD_MAX),
    eventDate: clip(body.eventDate, FIELD_MAX),
    location: clip(body.location, FIELD_MAX),
    sizeLabel: clip(body.sizeLabel, FIELD_MAX),
    frequency: num(body.frequency),
  }
}

/** The admin list renders entirely from this, so listing a page costs one KV call. */
function summarize(record: StoredOrder): OrderSummary {
  return {
    id: record.id,
    ref: record.ref,
    createdAt: record.createdAt,
    type: record.type,
    status: record.status,
    emailStatus: record.emailStatus,
    name: clip(record.buyer?.name || record.customer?.name || record.businessName, 60),
    email: clip(record.buyer?.email || record.customer?.email, 80),
    total: record.serverTotal ?? record.total ?? 0,
    date: clip(record.deliveryDate || record.eventDate, 10),
  }
}

/**
 * Writes the record plus its list metadata. Never throws: a storage failure must not
 * become a 500 for a customer whose order we may still be able to email.
 */
async function putOrder(env: Env, record: StoredOrder): Promise<boolean> {
  try {
    let metadata = summarize(record)
    // KV rejects the whole put above 1024 bytes of metadata.
    if (JSON.stringify(metadata).length > 1000) {
      metadata = { ...metadata, name: metadata.name.slice(0, 20), email: metadata.email.slice(0, 20) }
    }
    await env.VINCENT_INVENTORY.put(`order:${record.id}`, JSON.stringify(record), {
      metadata,
      // Absolute, derived from createdAt. Marking an order handled rewrites the key,
      // and expirationTtl would restart the two-year clock on every such update.
      expiration: Math.floor(record.createdAt / 1000) + ORDER_RETENTION_DAYS * 24 * 3600,
    })
    return true
  } catch (err) {
    console.error('Failed to persist order:', err, '| ref:', record.ref)
    return false
  }
}

// --- Abuse protection for the public order endpoint ---
//
// /api/order is unauthenticated and sends an email on every call, so without a limit
// a single script can exhaust the Resend quota (real orders then stop arriving) and
// get the sending domain blacklisted. CORS does not help here: it is a browser policy
// and does nothing against curl.

const ORDER_MAX_BODY_BYTES = 32 * 1024
const ORDER_WINDOW_SECONDS = 10 * 60
const ORDER_MAX_PER_WINDOW = 5
const ORDER_MAX_PER_DAY = 20

/** Read-modify-write counter. Racy under heavy concurrency, but adequate as a coarse guard. */
async function bumpCounter(env: Env, key: string, ttlSeconds: number, max: number): Promise<number> {
  const current = Number((await env.VINCENT_INVENTORY.get(key)) || '0')
  const safe = Number.isFinite(current) ? current : 0
  // Once the caller is already over the ceiling there is nothing left to count, and
  // writing anyway let a bot burn the daily KV write quota that order persistence
  // now depends on as well.
  if (safe > max) return safe
  const next = safe + 1
  await env.VINCENT_INVENTORY.put(key, String(next), { expirationTtl: ttlSeconds })
  return next
}

async function isOrderRateLimited(env: Env, ip: string): Promise<boolean> {
  const now = Date.now()
  const windowBucket = Math.floor(now / (ORDER_WINDOW_SECONDS * 1000))
  const dayBucket = Math.floor(now / 86_400_000)

  const [windowCount, dayCount] = await Promise.all([
    bumpCounter(env, `rl:order:${ip}:w${windowBucket}`, ORDER_WINDOW_SECONDS, ORDER_MAX_PER_WINDOW),
    bumpCounter(env, `rl:order:${ip}:d${dayBucket}`, 86_400, ORDER_MAX_PER_DAY),
  ])

  return windowCount > ORDER_MAX_PER_WINDOW || dayCount > ORDER_MAX_PER_DAY
}

// --- Orders ---

app.post('/api/order', async (c) => {
  // 1. Require a browser Origin from a site we own. Trivially spoofable on its own,
  //    but it removes drive-by bots before anything expensive happens.
  if (!isAllowedOrigin(c.req.header('Origin'))) {
    return c.json({ success: false, message: 'Forbidden.' }, 403)
  }

  // 2. Cap the body so a huge payload cannot be buffered or pasted into an email.
  const declaredLength = Number(c.req.header('Content-Length') || '0')
  if (declaredLength > ORDER_MAX_BODY_BYTES) {
    return c.json({ success: false, message: 'Request too large.' }, 413)
  }

  // 3. Per-IP rate limit.
  const ip = c.req.header('CF-Connecting-IP') || 'unknown'
  if (await isOrderRateLimited(c.env, ip)) {
    return c.json(
      { success: false, message: 'Too many orders from this connection. Please try again later.' },
      429
    )
  }

  let body: OrderBody
  try {
    body = (await c.req.json()) as OrderBody
  } catch {
    return c.json({ success: false, message: 'Invalid request body.' }, 400)
  }

  // An unrecognised type used to fall through every branch below and produce an email
  // with a subject and an empty body, which reads as a broken shop rather than a bad
  // request.
  if (!ORDER_TYPES.includes(body.type)) {
    return c.json({ success: false, message: 'Unknown order type.' }, 400)
  }
  if (!body.customer || !body.customer.email) {
    return c.json({ success: false, message: 'Missing customer information.' }, 400)
  }

  // Reject orders that fall on a closed date/period, even if the request bypasses the UI.
  const closures = await getClosures(c.env)
  if (body.type === 'make-your-own' || body.type === 'shop') {
    // Required, not optional. This check used to be skipped entirely when the field was
    // absent, so a direct POST could book a delivery inside a closure.
    if (!ISO_DATE.test(body.deliveryDate || '')) {
      return c.json({ success: false, message: 'A delivery date is required.' }, 400)
    }
    const closure = findClosure(body.deliveryDate as string, closures)
    if (closure) {
      return c.json({ success: false, message: closure.messageEn, messagePt: closure.messagePt, closed: true }, 400)
    }
  } else if (body.type === 'subscription') {
    const closure = findClosure(todayIso(), closures)
    if (closure) {
      return c.json({ success: false, message: closure.messageEn, messagePt: closure.messagePt, closed: true }, 400)
    }
  }

  const catalog = await getCatalog(c.env)
  const priced = priceOrder(body.type, body.configuration, body.mode, catalog)

  if (body.type === 'make-your-own') {
    if (body.mode !== 'bouquet' && body.mode !== 'bunch') {
      return c.json({ success: false, message: 'Choose a bouquet or a bunch.' }, 400)
    }
    if (!priced || priced.stemTotal < PRICING.MIN_STEM_TOTAL) {
      return c.json({ success: false, message: `The minimum order is €${PRICING.MIN_STEM_TOTAL}.` }, 400)
    }
  }
  if (body.type === 'shop' && !priced) {
    return c.json({ success: false, message: 'That bouquet is no longer available.' }, 400)
  }

  const createdAt = Date.now()
  const { id, ref } = makeOrderIds(createdAt)
  const record: StoredOrder = {
    ...sanitizeOrderBody(body),
    id,
    ref,
    createdAt,
    status: 'new',
    emailStatus: 'pending',
    serverTotal: priced?.total,
  }

  // Persist before sending: the stored record is the durable artefact and the email
  // only announces it. Never throws, so a KV failure cannot cost us the email too.
  const persisted = await putOrder(c.env, record)

  const { customer, buyer, configuration, deliveryMode, mode, type } = record
  const displayTotal = priced ? priced.total : record.total || 0
  const claimedTotal = record.total || 0
  // Worth showing rather than silently swallowing: it means either a stale price in
  // the browser or someone editing the payload on the way out.
  const totalMismatch = priced !== null && Math.abs(claimedTotal - priced.total) > 0.01

  // 1. Build dynamic email content based on type
  let subject = 'New Inquiry - Vincent Flowers Porto'
  let detailsHtml = ''

  if (type === 'make-your-own') {
    subject = `New Custom Order / Novo Pedido Customizado - ${safeSubject(customer?.name)} [${ref}]`
    const orderDetails = (configuration || [])
      .map((item) => {
        const group = (catalog.makeYourOwn || []).find((g) => g.name === item.name)
        const variant = group?.variants?.find((v) => v.color === item.color)
        const unit = variant ? num(variant.basePrice) : num(item.price)
        return `- ${escapeHtml(item.name)} (${escapeHtml(item.color)}) - ${num(item.qty)}x: €${(
          unit * num(item.qty)
        ).toFixed(2)}`
      })
      .join('\n')
    detailsHtml = `
      <h3>Order Summary / Resumo do Pedido</h3>
      <p><strong>Type:</strong> ${escapeHtml(mode)} | <strong>Option:</strong> ${escapeHtml(deliveryMode)}</p>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${orderDetails}</pre>
      <p><strong>Total: €${displayTotal.toFixed(2)}</strong></p>
    `
  } else if (type === 'shop') {
    subject = `Shop Order / Pedido da Loja - ${safeSubject(customer?.name)} [${ref}]`
    const item = configuration?.[0] || ({} as { title?: string })
    detailsHtml = `
      <h3>Shop Selection / Seleção da Loja</h3>
      <p><strong>Item:</strong> ${escapeHtml(item.title)}</p>
      <p><strong>Option:</strong> ${escapeHtml(deliveryMode)}</p>
      <p><strong>Total: €${displayTotal.toFixed(2)}</strong></p>
    `
  } else if (type === 'subscription') {
    subject = `New Subscription Inquiry / Nova Inscrição - ${safeSubject(customer?.name)} [${ref}]`
    detailsHtml = `
      <h3>Subscription Details / Detalhes da Assinatura</h3>
      <p><strong>Size:</strong> ${escapeHtml(record.sizeLabel)}</p>
      <p><strong>Frequency:</strong> ${num(record.frequency)}x per month</p>
      <p><strong>Estimated Monthly Total: €${displayTotal.toFixed(2)}</strong></p>
    `
  } else if (type === 'events' || type === 'b2b') {
    const label = type === 'events' ? 'Event Inquiry' : 'B2B Inquiry'
    subject = `${label} - ${safeSubject(customer?.name || record.businessName)} [${ref}]`
    detailsHtml = `
      <h3>${label} Details / Detalhes</h3>
      ${record.businessName ? `<p><strong>Business:</strong> ${escapeHtml(record.businessName)}</p>` : ''}
      ${record.eventDate ? `<p><strong>Event Date:</strong> ${escapeHtml(record.eventDate)}</p>` : ''}
      ${record.location ? `<p><strong>Location:</strong> ${escapeHtml(record.location)}</p>` : ''}
      <p><strong>Message:</strong></p>
      <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${
        escapeHtml(record.message) || 'No message provided.'
      }</div>
    `
  } else if (type === 'footer') {
    subject = `Quick Message from Website - ${safeSubject(customer?.email)} [${ref}]`
    detailsHtml = `
      <h3>Quick Contact / Mensagem Rápida</h3>
      <p><strong>Customer Email:</strong> ${escapeHtml(customer?.email)}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${
        escapeHtml(record.message) || 'No message.'
      }</div>
    `
  }

  const mismatchHtml = totalMismatch
    ? `<p style="color: #b00020;"><strong>Note:</strong> the browser reported €${claimedTotal.toFixed(
        2
      )} for this order. The total above was recalculated from the current catalogue.</p>`
    : ''

  const buyerHtml = buyer
    ? `
      <h3>Buyer Details / Detalhes do Comprador</h3>
      <p>
        <strong>Name:</strong> ${escapeHtml(buyer.name) || 'N/A'}<br />
        <strong>Email:</strong> ${escapeHtml(buyer.email) || 'N/A'}<br />
        <strong>Phone:</strong> ${escapeHtml(buyer.phone) || 'N/A'}
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    `
    : ''

  const emailHtml = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d44c8c;">Vincent Flowers Porto</h2>
      <p style="font-size: 0.9em; color: #777;">Reference / Referência: <strong>${escapeHtml(ref)}</strong></p>
      <p><strong>English:</strong> Thank you for your order! It is now being processed by our team.<br/><br/>We will reach out to you shortly via WhatsApp or email to confirm the details.<br/><br/>Regarding payment, please note that we accept bank transfers or credit cards.<br/><br/>Best wishes,<br/>Vincent Flowers Porto</p>
      <p><strong>Português:</strong> Obrigado pela sua encomenda! Está agora a ser processada pela nossa equipa.<br/><br/>Entraremos em contacto em breve via WhatsApp ou email para confirmar os detalhes.<br/><br/>Relativamente ao pagamento, por favor note que aceitamos transferências bancárias ou cartões de crédito.<br/><br/>Com os melhores cumprimentos,<br/>Vincent Flowers Porto</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

      ${detailsHtml}
      ${mismatchHtml}

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

      ${buyerHtml}

      <h3>Recipient Details / Detalhes do Destinatário</h3>
      <p>
        <strong>Name:</strong> ${escapeHtml(customer?.name || record.contactPerson) || 'N/A'}<br />
        <strong>Email:</strong> ${escapeHtml(customer?.email)}<br />
        <strong>Phone:</strong> ${escapeHtml(customer?.phone) || 'N/A'}<br />
        ${
          deliveryMode === 'delivery' || customer?.address
            ? `<strong>Address:</strong> ${escapeHtml(customer?.address)}${
                customer?.city ? `, ${escapeHtml(customer.city)}` : ''
              }<br />`
            : ''
        }
        ${customer?.pickupTime ? `<strong>Time:</strong> ${escapeHtml(customer.pickupTime)}` : ''}
      </p>

      <footer style="margin-top: 30px; font-size: 0.8em; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
        <strong>Vincent Flowers Porto</strong><br />
        Porto, Portugal<br />
        <a href="https://vincentflowersporto.com" style="color: #d44c8c;">vincentflowersporto.com</a>
      </footer>
    </div>
  `

  let emailSent = false
  let emailError = ''
  try {
    const recipients = ['vincent.flowers.porto@gmail.com']
    // The confirmation should go to whoever is actually paying: the buyer if we
    // collected one (Home/Shop/Subscription), otherwise the recipient (Events/B2B/footer).
    const primaryContactEmail = buyer?.email || customer?.email || ''
    if (primaryContactEmail.includes('@')) {
      recipients.push(primaryContactEmail)
    }

    // Resend does not always throw: on a rejected send it commonly resolves with
    // { data: null, error: {...} }.
    const resend = new Resend(c.env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from: 'Vincent Flowers <noreply@vincentflowersporto.com>',
      to: recipients,
      subject: subject,
      html: emailHtml,
    })

    if (result?.error) {
      emailError = String(result.error.message || result.error)
      console.error('Email rejected by Resend:', result.error, '| ref:', ref)
    } else {
      emailSent = true
    }
  } catch (error) {
    emailError = error instanceof Error ? error.message : String(error)
    console.error('Email error:', error, '| ref:', ref)
  }

  if (persisted) {
    record.emailStatus = emailSent ? 'sent' : 'failed'
    record.updatedAt = Date.now()
    if (emailError) record.emailError = emailError.slice(0, 300)
    await putOrder(c.env, record)

    // The order is stored, so telling the customer to retry would only produce a
    // duplicate for the owner to reconcile. The admin Orders list shows a red
    // "email failed" badge for these, which is the only place the failure surfaces.
    return c.json({
      success: true,
      orderRef: ref,
      emailSent,
      message: emailSent
        ? 'Notification sent successfully.'
        : `Order received (ref ${ref}). We could not send the confirmation email, but your order has reached us and we will be in touch shortly.`,
    })
  }

  if (emailSent) {
    // Nothing stored, but the shop has the email in its inbox: still a real order.
    console.error('Order emailed but NOT persisted | ref:', ref)
    return c.json({ success: true, orderRef: ref, emailSent: true, message: 'Notification sent successfully.' })
  }

  // Nothing recorded anywhere, so "please try again" is now the correct advice.
  return c.json({ success: false, message: 'Notification failed.' }, 502)
})

// --- Admin auth ---

const LOGIN_WINDOW_SECONDS = 15 * 60
const LOGIN_MAX_ATTEMPTS = 5

app.post('/api/admin/login', async (c) => {
  const correctPassword = c.env.ADMIN_PASSWORD
  if (!correctPassword) {
    return c.json({ success: false, message: 'Admin login is not configured.' }, 500)
  }

  let body: { password?: string }
  try {
    body = (await c.req.json()) as { password?: string }
  } catch {
    return c.json({ success: false, message: 'Invalid request body.' }, 400)
  }

  // The public order endpoint has always been rate limited; this one was not, which
  // left a single human-chosen password open to unlimited guessing.
  const ip = c.req.header('CF-Connecting-IP') || 'unknown'
  const bucket = Math.floor(Date.now() / (LOGIN_WINDOW_SECONDS * 1000))
  const rlKey = `rl:login:${ip}:w${bucket}`
  const attempts = Number((await c.env.VINCENT_INVENTORY.get(rlKey)) || '0')
  if (Number.isFinite(attempts) && attempts >= LOGIN_MAX_ATTEMPTS) {
    return c.json({ success: false, message: 'Too many attempts. Please try again later.' }, 429)
  }

  if (!timingSafeEqual(String(body.password ?? ''), correctPassword)) {
    // Only failures count, so a working session never walks anyone towards the limit.
    await bumpCounter(c.env, rlKey, LOGIN_WINDOW_SECONDS, LOGIN_MAX_ATTEMPTS)
    return c.json({ success: false, message: 'Invalid password' }, 401)
  }

  if (!c.env.ADMIN_TOKEN_SECRET) {
    console.warn('ADMIN_TOKEN_SECRET is not set; signing admin tokens with ADMIN_PASSWORD instead.')
  }
  const secret = c.env.ADMIN_TOKEN_SECRET || correctPassword
  const token = await signAdminToken(secret)
  return c.json({ success: true, token })
})

// --- Catalog ---

const DEFAULT_CATALOG: Catalog = {
  makeYourOwn: [
    {
      name: 'Rose',
      available: true,
      image: '/images/Rose-White.webp',
      variants: [
        { color: 'White', hexColor: '#f8f9fa', basePrice: 3, qty: 0 },
        { color: 'Red', hexColor: '#d90429', basePrice: 3.25, qty: 0 },
      ],
    },
    {
      name: 'Matthiola',
      available: true,
      image: '/images/Matthiola-Purple.webp',
      variants: [{ color: 'Purple', hexColor: '#e0b0ff', basePrice: 2.5, qty: 0 }],
    },
    {
      name: 'Flor da Serra',
      available: true,
      image: '/images/Flor-da-Serra.webp2.webp',
      variants: [{ color: 'Pink', hexColor: '#ffb6c1', basePrice: 4, qty: 0 }],
    },
  ],
  shopBouquets: [
    { title: 'Annette', price: 45, img: '/images/shop/Annette.webp', available: true },
    { title: 'Blue iris', price: 50, img: '/images/shop/Blue iris.webp', available: true },
    { title: 'Bright Spring', price: 60, img: '/images/shop/Bright Spring.webp', available: true },
    { title: 'King Julian', price: 75, img: '/images/shop/King Julian.webp', available: true },
    { title: 'Marshmallow', price: 55, img: '/images/shop/Marshmallow.webp', available: true },
    { title: 'Martha', price: 45, img: '/images/shop/Martha.webp', available: true },
    { title: 'Rose Basket', price: 85, img: '/images/shop/Rose Basket.webp', available: true },
    { title: 'Salmon Rose', price: 55, img: '/images/shop/Salmon Rose.webp', available: true },
    { title: 'Spring Flowers', price: 50, img: '/images/shop/Spring Flowers.webp', available: true },
    { title: 'Tropical', price: 65, img: '/images/shop/Tropical.webp', available: true },
    { title: 'Tulip basket', price: 60, img: '/images/shop/Tulip basket.webp', available: true },
    { title: 'Venus', price: 70, img: '/images/shop/Venus.webp', available: true },
    { title: 'Vera', price: 45, img: '/images/shop/Vera.webp', available: true },
  ],
}

/** The catalog as the server sees it. Also the price authority for /api/order. */
async function getCatalog(env: Env): Promise<Catalog> {
  try {
    const data = await env.VINCENT_INVENTORY.get('catalog', 'json')
    if (data && typeof data === 'object') return data as Catalog
  } catch {
    // Fall through to the built-in catalog rather than failing the request.
  }
  return DEFAULT_CATALOG
}

app.get('/api/catalog', async (c) => {
  return c.json(await getCatalog(c.env))
})

app.post('/api/admin/catalog', async (c) => {
  if (!(await requireAdmin(c))) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  try {
    const body = (await c.req.json()) as Catalog
    if (!Array.isArray(body?.makeYourOwn) || !Array.isArray(body?.shopBouquets)) {
      return c.json({ success: false, message: 'Invalid catalog payload' }, 400)
    }
    await c.env.VINCENT_INVENTORY.put('catalog', JSON.stringify(body))
    return c.json({ success: true })
  } catch (err) {
    return c.json({ success: false, message: 'Failed to update' }, 500)
  }
})

// --- Closures (admin-managed closed date ranges) ---

app.get('/api/closures', async (c) => {
  const closures = await getClosures(c.env)
  return c.json(closures)
})

app.post('/api/admin/closures', async (c) => {
  if (!(await requireAdmin(c))) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, message: 'Invalid request body.' }, 400)
  }

  if (!Array.isArray(body)) {
    return c.json({ success: false, message: 'Invalid payload' }, 400)
  }

  // Reject the whole batch rather than silently storing a closure that would either
  // shut the shop forever (empty startDate) or never fire at all (reversed range).
  const invalid = body.findIndex((cl) => !isValidClosure(cl as ClosurePeriod))
  if (invalid !== -1) {
    return c.json(
      {
        success: false,
        message: `Closure ${invalid + 1} is invalid: both dates are required as YYYY-MM-DD and the start must not be after the end.`,
      },
      400
    )
  }

  const sanitised: ClosurePeriod[] = (body as ClosurePeriod[]).map((cl) => ({
    id: String(cl.id || crypto.randomUUID()),
    startDate: cl.startDate,
    endDate: cl.endDate,
    messageEn: String(cl.messageEn ?? '').slice(0, 500),
    messagePt: String(cl.messagePt ?? '').slice(0, 500),
  }))

  try {
    await c.env.VINCENT_INVENTORY.put('closures', JSON.stringify(sanitised))
    return c.json({ success: true })
  } catch {
    return c.json({ success: false, message: 'Failed to update' }, 500)
  }
})

// --- Orders (admin) ---

/** Rendered when a key somehow has no metadata; the row can still be expanded. */
function stubSummary(keyName: string): OrderSummary {
  return {
    id: keyName.replace(/^order:/, ''),
    ref: '?',
    createdAt: 0,
    type: 'footer',
    status: 'new',
    emailStatus: 'pending',
    name: '',
    email: '',
    total: 0,
    date: '',
  }
}

app.get('/api/admin/orders', async (c) => {
  if (!(await requireAdmin(c))) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 25))
  const cursor = c.req.query('cursor') || undefined
  const status = c.req.query('status') || 'active'

  try {
    // One call per page: the summary lives in each key's metadata, so listing never
    // has to read the order bodies.
    const result = await c.env.VINCENT_INVENTORY.list<OrderSummary>({ prefix: 'order:', limit, cursor })
    const orders = result.keys
      .map((k) => k.metadata ?? stubSummary(k.name))
      .filter((o) => {
        if (status === 'all') return true
        if (status === 'active') return o.status !== 'archived'
        return o.status === status
      })

    return c.json({
      success: true,
      orders,
      // Filtering happens after the list, so a page can hold fewer rows than `limit`.
      // The client must decide on listComplete, not on how many rows came back.
      cursor: result.list_complete ? null : result.cursor,
      listComplete: result.list_complete,
    })
  } catch (err) {
    console.error('Failed to list orders:', err)
    return c.json({ success: false, message: 'Failed to load orders.' }, 500)
  }
})

app.get('/api/admin/orders/:id', async (c) => {
  if (!(await requireAdmin(c))) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }
  const id = c.req.param('id')
  // Validated so a crafted id cannot address `catalog`, `closures` or a counter key.
  if (!ORDER_ID.test(id)) {
    return c.json({ success: false, message: 'Invalid order id.' }, 400)
  }

  const order = await c.env.VINCENT_INVENTORY.get(`order:${id}`, 'json')
  if (!order) {
    return c.json({ success: false, message: 'Order not found.' }, 404)
  }
  return c.json({ success: true, order })
})

app.post('/api/admin/orders/:id/status', async (c) => {
  if (!(await requireAdmin(c))) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }
  const id = c.req.param('id')
  if (!ORDER_ID.test(id)) {
    return c.json({ success: false, message: 'Invalid order id.' }, 400)
  }

  let body: { status?: string }
  try {
    body = (await c.req.json()) as { status?: string }
  } catch {
    return c.json({ success: false, message: 'Invalid request body.' }, 400)
  }

  const status = body.status
  if (status !== 'new' && status !== 'handled' && status !== 'archived') {
    return c.json({ success: false, message: 'Invalid status.' }, 400)
  }

  const existing = (await c.env.VINCENT_INVENTORY.get(`order:${id}`, 'json')) as StoredOrder | null
  if (!existing) {
    return c.json({ success: false, message: 'Order not found.' }, 404)
  }

  // putOrder recomputes the expiry from createdAt, so updating never extends the
  // two-year retention window.
  const updated: StoredOrder = { ...existing, status, updatedAt: Date.now() }
  if (!(await putOrder(c.env, updated))) {
    return c.json({ success: false, message: 'Failed to update order.' }, 500)
  }
  return c.json({ success: true, order: updated })
})

// --- Media uploads (Cloudflare R2) ---

app.post('/api/admin/upload', async (c) => {
  if (!(await requireAdmin(c))) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }
  if (!c.env.VINCENT_MEDIA) {
    return c.json({ success: false, message: 'Media storage is not configured.' }, 500)
  }

  try {
    const body = await c.req.parseBody()
    const file = body['file']
    if (!(file instanceof File)) {
      return c.json({ success: false, message: 'No file provided.' }, 400)
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const key = `flowers/${Date.now()}-${safeName}`
    await c.env.VINCENT_MEDIA.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    })
    return c.json({ success: true, url: `/media/${key}` })
  } catch (err) {
    console.error('Upload error:', err)
    return c.json({ success: false, message: 'Upload failed.' }, 500)
  }
})

app.get('/media/*', async (c) => {
  if (!c.env.VINCENT_MEDIA) return c.notFound()
  const key = c.req.path.replace(/^\/media\//, '')
  const object = await c.env.VINCENT_MEDIA.get(key)
  if (!object) return c.notFound()

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
})

export default app
