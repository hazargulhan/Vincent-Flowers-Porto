export interface ClosurePeriod {
  id: string
  startDate: string
  endDate: string
  messageEn: string
  messagePt: string
}

/** The person the flowers are delivered/handed to (payload key kept as "customer" for history). */
export interface RecipientInfo {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  pickupTime?: string
}

/** The person actually placing and paying for the order. */
export interface BuyerInfo {
  name: string
  email: string
  phone: string
}

export interface ConfigurationItem {
  name?: string
  title?: string
  color?: string
  price: number
  qty?: number
}

export interface OrderBody {
  type: 'make-your-own' | 'shop' | 'subscription' | 'events' | 'b2b' | 'footer'
  customer?: RecipientInfo
  buyer?: BuyerInfo
  total?: number
  configuration?: ConfigurationItem[]
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

export interface FlowerVariant {
  color: string
  hexColor: string
  basePrice: number
  qty: number
}

export interface FlowerGroup {
  name: string
  available: boolean
  image: string
  variants: FlowerVariant[]
}

export interface Bouquet {
  title: string
  price: number
  img: string
  available: boolean
}

export interface Catalog {
  makeYourOwn: FlowerGroup[]
  shopBouquets: Bouquet[]
}

export type OrderStatus = 'new' | 'handled' | 'archived'
export type OrderEmailStatus = 'pending' | 'sent' | 'failed'

/** Full record stored as the KV value under `order:<id>`. */
export interface StoredOrder extends OrderBody {
  id: string
  ref: string
  createdAt: number
  updatedAt?: number
  status: OrderStatus
  emailStatus: OrderEmailStatus
  emailError?: string
  /** Total recomputed from the catalog. Absent for types we cannot price server-side. */
  serverTotal?: number
}

/**
 * Per-key KV metadata, which is what the admin list is rendered from.
 * MUST serialise under 1024 bytes or the put() throws — see putOrder().
 */
export interface OrderSummary {
  id: string
  ref: string
  createdAt: number
  type: OrderBody['type']
  status: OrderStatus
  emailStatus: OrderEmailStatus
  name: string
  email: string
  total: number
  date: string
}
