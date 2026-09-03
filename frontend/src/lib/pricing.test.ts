import { describe, it, expect } from 'vitest'
import {
  calculateBaseTotal,
  calculateCustomBouquetTotal,
  isMinimumOrderMet,
  remainingForMinOrder,
  formatEuro
} from './pricing'

describe('Pricing calculations (pricing.ts)', () => {
  describe('calculateBaseTotal', () => {
    it('calculates the correct subtotal for an array of flower stems', () => {
      const items = [
        { basePrice: 2.5, qty: 4 }, // 10.00
        { basePrice: 1.2, qty: 5 }, // 6.00
        { basePrice: 0.7, qty: 3 }  // 2.10
      ]
      expect(calculateBaseTotal(items)).toBe(18.10)
    })

    it('returns 0 when items array is empty or quantities are zero', () => {
      expect(calculateBaseTotal([])).toBe(0)
      expect(calculateBaseTotal([{ basePrice: 3.5, qty: 0 }])).toBe(0)
    })

    it('handles floating point precision properly', () => {
      const items = [
        { basePrice: 0.1, qty: 1 },
        { basePrice: 0.2, qty: 1 }
      ]
      expect(calculateBaseTotal(items)).toBe(0.30)
    })
  })

  describe('calculateCustomBouquetTotal', () => {
    it('returns baseTotal without assembly fee when mode is bunch', () => {
      const total = calculateCustomBouquetTotal(20, 'bunch', 25)
      expect(total).toBe(20)
    })

    it('applies standard 25% bouquet assembly fee when mode is bouquet', () => {
      // 20 * 1.25 = 25
      const total = calculateCustomBouquetTotal(20, 'bouquet', 25)
      expect(total).toBe(25)
    })

    it('respects custom assembly fee percentage from settings', () => {
      // 30 * 1.20 = 36 (20% fee)
      const total = calculateCustomBouquetTotal(30, 'bouquet', 20)
      expect(total).toBe(36)

      // 50 * 1.30 = 65 (30% fee)
      expect(calculateCustomBouquetTotal(50, 'bouquet', 30)).toBe(65)
    })

    it('returns 0 when mode is null or baseTotal is 0', () => {
      expect(calculateCustomBouquetTotal(0, 'bouquet', 25)).toBe(0)
      expect(calculateCustomBouquetTotal(25, null, 25)).toBe(0)
    })
  })

  describe('isMinimumOrderMet and remainingForMinOrder', () => {
    it('correctly evaluates against default minimum order of €15', () => {
      expect(isMinimumOrderMet(14.99)).toBe(false)
      expect(isMinimumOrderMet(15.00)).toBe(true)
      expect(isMinimumOrderMet(22.50)).toBe(true)
    })

    it('supports custom minimum order thresholds from settings', () => {
      expect(isMinimumOrderMet(19, 20)).toBe(false)
      expect(isMinimumOrderMet(20, 20)).toBe(true)
    })

    it('calculates remaining amount needed accurately', () => {
      expect(remainingForMinOrder(10, 15)).toBe(5.00)
      expect(remainingForMinOrder(14.30, 15)).toBe(0.70)
      expect(remainingForMinOrder(20, 15)).toBe(0)
    })
  })

  describe('formatEuro', () => {
    it('formats numbers to standard 2-decimal Euro string', () => {
      expect(formatEuro(15)).toBe('€15.00')
      expect(formatEuro(24.5)).toBe('€24.50')
      expect(formatEuro(0)).toBe('€0.00')
    })
  })
})
