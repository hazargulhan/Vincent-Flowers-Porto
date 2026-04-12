import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Resend } from 'resend'

type Env = {
  RESEND_API_KEY: string
  VINCENT_INVENTORY: KVNamespace
  ADMIN_PASSWORD?: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors())

app.get('/', (c) => {
  return c.text('Vincent Flowers API')
})

app.post('/api/order', async (c) => {
  const body = await c.req.json()
  const resend = new Resend(c.env.RESEND_API_KEY)

  const { type, customer, total, configuration, deliveryMode, mode, ...extras } = body
  const customerEmail = customer?.email

  // 1. Build dynamic email content based on type
  let subject = `New Inquiry - Vincent Flowers Porto`
  let detailsHtml = ''

  if (type === 'make-your-own') {
    subject = `New Custom Order / Novo Pedido Customizado - ${customer.name}`
    const orderDetails = (configuration || []).map((item: any) => 
      `- ${item.name} (${item.color}) - ${item.qty}x: €${(item.price * item.qty).toFixed(2)}`
    ).join('\n')
    detailsHtml = `
      <h3>Order Summary / Resumo do Pedido</h3>
      <p><strong>Type:</strong> ${mode} | <strong>Option:</strong> ${deliveryMode}</p>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${orderDetails}</pre>
      <p><strong>Total: €${total.toFixed(2)}</strong></p>
    `
  } else if (type === 'shop') {
    subject = `Shop Order / Pedido da Loja - ${customer.name}`
    const item = configuration?.[0] || {}
    detailsHtml = `
      <h3>Shop Selection / Seleção da Loja</h3>
      <p><strong>Item:</strong> ${item.title}</p>
      <p><strong>Option:</strong> ${deliveryMode}</p>
      <p><strong>Total: €${total.toFixed(2)}</strong></p>
    `
  } else if (type === 'subscription') {
    subject = `New Subscription Inquiry / Nova Inscrição - ${customer.name}`
    detailsHtml = `
      <h3>Subscription Details / Detalhes da Assinatura</h3>
      <p><strong>Size:</strong> ${extras.sizeLabel}</p>
      <p><strong>Frequency:</strong> ${extras.frequency}x per month</p>
      <p><strong>Estimated Monthly Total: €${total.toFixed(2)}</strong></p>
    `
  } else if (type === 'events' || type === 'b2b') {
    const label = type === 'events' ? 'Event Inquiry' : 'B2B Inquiry'
    subject = `${label} / Pedido de Orçamento - ${customer.name || extras.businessName}`
    detailsHtml = `
      <h3>${label} Details / Detalhes</h3>
      ${extras.businessName ? `<p><strong>Business:</strong> ${extras.businessName}</p>` : ''}
      ${extras.eventDate ? `<p><strong>Event Date:</strong> ${extras.eventDate}</p>` : ''}
      ${extras.location ? `<p><strong>Location:</strong> ${extras.location}</p>` : ''}
      <p><strong>Message:</strong></p>
      <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${extras.message || 'No message provided.'}</div>
    `
  }

  const emailHtml = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d44c8c;">Vincent Flowers Porto</h2>
      <p><strong>English:</strong> We have received your inquiry/order. We will contact you soon!</p>
      <p><strong>Português:</strong> Recebemos a sua solicitação. Entraremos em contacto em breve!</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      
      ${detailsHtml}
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      
      <h3>Customer Details / Detalhes do Cliente</h3>
      <p>
        <strong>Name:</strong> ${customer.name || extras.contactPerson || 'N/A'}<br />
        <strong>Email:</strong> ${customer.email}<br />
        <strong>Phone:</strong> ${customer.phone}<br />
        ${deliveryMode === 'delivery' || customer.address ? `<strong>Address:</strong> ${customer.address}${customer.city ? `, ${customer.city}` : ''}<br />` : ''}
        ${customer.pickupTime ? `<strong>Time:</strong> ${new Date(customer.pickupTime).toLocaleString()}` : ''}
      </p>
      
      <footer style="margin-top: 30px; font-size: 0.8em; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
        <strong>Vincent Flowers Porto</strong><br />
        Porto, Portugal<br />
        <a href="https://vincentflowersporto.com" style="color: #d44c8c;">vincentflowersporto.com</a>
      </footer>
    </div>
  `

  try {
    const recipients = ['vincent.flowers.porto@gmail.com']
    if (customerEmail) {
      recipients.push(customerEmail)
    }

    await resend.emails.send({
      from: 'Vincent Flowers <orders@vincentflowersporto.com>',
      to: recipients,
      subject: subject,
      html: emailHtml,
    })

    return c.json({ success: true, message: 'Notification sent successfully.' })
  } catch (error) {
    console.error('Email error:', error)
    return c.json({ success: false, message: 'Notification failed.' }, 500)
  }
})

app.post('/api/admin/login', async (c) => {
  const body = await c.req.json()
  const correctPassword = c.env.ADMIN_PASSWORD || '362633'
  
  if (body.password === correctPassword) {
    return c.json({ success: true, token: 'mock-admin-token' })
  }
  return c.json({ success: false, message: 'Invalid password' }, 401)
})

const DEFAULT_CATALOG = {
  makeYourOwn: [
    {
      name: 'Rose',
      available: true,
      image: '/images/Rose-White.webp',
      variants: [
        { color: 'White', hexColor: '#f8f9fa', basePrice: 3, qty: 0 },
        { color: 'Red', hexColor: '#d90429', basePrice: 3.25, qty: 0 },
      ]
    },
    {
      name: 'Matthiola',
      available: true,
      image: '/images/Matthiola-Purple.webp',
      variants: [
        { color: 'Purple', hexColor: '#e0b0ff', basePrice: 2.5, qty: 0 }
      ]
    },
    {
      name: 'Flor da Serra',
      available: true,
      image: '/images/Flor-da-Serra.webp2.webp',
      variants: [
        { color: 'Pink', hexColor: '#ffb6c1', basePrice: 4, qty: 0 }
      ]
    }
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
    { title: 'Vera', price: 45, img: '/images/shop/Vera.webp', available: true }
  ]
}

app.get('/api/catalog', async (c) => {
  try {
    const data = await c.env.VINCENT_INVENTORY.get('catalog', 'json')
    if (data) {
      return c.json(data)
    }
    return c.json(DEFAULT_CATALOG)
  } catch (err) {
    return c.json(DEFAULT_CATALOG)
  }
})

app.post('/api/admin/catalog', async (c) => {
  const token = c.req.header('Authorization')
  if (token !== 'Bearer mock-admin-token') {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }
  
  try {
    const body = await c.req.json()
    await c.env.VINCENT_INVENTORY.put('catalog', JSON.stringify(body))
    return c.json({ success: true })
  } catch (err) {
    return c.json({ success: false, message: 'Failed to update' }, 500)
  }
})

export default app
