export interface BusinessSettings {
  minOrderTotal: number
  bouquetFeePercent: number
  subscriptionPricing: {
    small: number
    medium: number
    large: number
  }
  deliveryCities: string[]
  openingHours: {
    start: string
    end: string
  }
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  minOrderTotal: 15,
  bouquetFeePercent: 25,
  subscriptionPricing: {
    small: 30,
    medium: 55,
    large: 75,
  },
  deliveryCities: ['Porto', 'Gaia', 'Maia', 'Matosinhos'],
  openingHours: {
    start: '09:00',
    end: '18:00',
  },
}
