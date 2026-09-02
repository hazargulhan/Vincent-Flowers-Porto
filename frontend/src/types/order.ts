/** The person the flowers are delivered/handed to. Historically called "customer" in the
 *  order payload and backend email template, kept for that reason. */
export interface RecipientInfo {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  pickupDate?: string
  pickupSlot?: string
  pickupTime?: string
}

/** The person actually placing and paying for the order. */
export interface BuyerInfo {
  name: string
  email: string
  phone: string
}

export interface ClosurePeriod {
  id: string
  startDate: string
  endDate: string
  messageEn: string
  messagePt: string
}

export type OrderStatus = 'new' | 'handled' | 'archived'
export type OrderEmailStatus = 'pending' | 'sent' | 'failed'
export type OrderType = 'make-your-own' | 'shop' | 'subscription' | 'events' | 'b2b' | 'footer'

export interface OrderConfigurationItem {
  name?: string
  title?: string
  color?: string
  price: number
  qty?: number
}

/** Mirrors the record the Worker stores in KV under `order:<id>`. */
export interface StoredOrder {
  id: string
  ref: string
  createdAt: number
  updatedAt?: number
  status: OrderStatus
  emailStatus: OrderEmailStatus
  emailError?: string
  /** Total recomputed from the catalog. Absent for types with no server-side prices. */
  serverTotal?: number
  type: OrderType
  customer?: RecipientInfo
  buyer?: BuyerInfo
  total?: number
  configuration?: OrderConfigurationItem[]
  deliveryMode?: 'delivery' | 'pickup'
  mode?: string
  deliveryDate?: string
  message?: string
  businessName?: string
  contactPerson?: string
  eventDate?: string
  location?: string
  sizeLabel?: string
  frequency?: number
}

/** One row of the admin list. Comes from the KV key metadata, not the record body. */
export interface OrderSummary {
  id: string
  ref: string
  createdAt: number
  type: OrderType
  status: OrderStatus
  emailStatus: OrderEmailStatus
  name: string
  email: string
  total: number
  date: string
}
