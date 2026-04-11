import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
  return c.text('Vincent Flowers API')
})

app.post('/api/order', async (c) => {
  const body = await c.req.json()
  console.log('Sending mock email for order:', body)
  return c.json({ success: true, message: 'Order received. Notification sent.' })
})

app.post('/api/admin/login', async (c) => {
  const body = await c.req.json()
  if (body.password === '362633') {
    return c.json({ success: true, token: 'mock-admin-token' })
  }
  return c.json({ success: false, message: 'Invalid password' }, 401)
})

const catalog = [
  { id: 1, name: 'Roses', price: 3, qty: 100, color: 'Red' },
  { id: 2, name: 'Tulips', price: 2, qty: 150, color: 'Yellow' },
  { id: 3, name: 'Lilies', price: 4, qty: 50, color: 'White' },
  { id: 4, name: 'Peonies', price: 5, qty: 30, color: 'Pink' }
]

app.get('/api/inventory', (c) => {
  return c.json(catalog)
})

export default app
