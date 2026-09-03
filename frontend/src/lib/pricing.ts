export interface FlowerItemPrice {
  basePrice: number
  qty: number
}

/**
 * Calculates the base subtotal for stem items before any assembly fee.
 */
export function calculateBaseTotal(items: FlowerItemPrice[]): number {
  const sum = items.reduce((acc, item) => acc + (item.basePrice || 0) * (item.qty || 0), 0)
  return Number(sum.toFixed(2))
}

/**
 * Calculates the total order amount for custom flowers.
 * In 'bunch' mode: baseTotal (no assembly fee).
 * In 'bouquet' mode: baseTotal + (baseTotal * bouquetFeePercent / 100).
 */
export function calculateCustomBouquetTotal(
  baseTotal: number,
  mode: 'bunch' | 'bouquet' | null,
  bouquetFeePercent = 25
): number {
  if (!mode || baseTotal <= 0) return 0
  if (mode === 'bunch') return Number(baseTotal.toFixed(2))
  const multiplier = 1 + bouquetFeePercent / 100
  return Number((baseTotal * multiplier).toFixed(2))
}

/**
 * Verifies whether the order meets the required minimum order amount.
 */
export function isMinimumOrderMet(baseTotal: number, minOrderTotal = 15): boolean {
  return baseTotal >= minOrderTotal
}

/**
 * Calculates the remaining amount needed to reach minimum order.
 */
export function remainingForMinOrder(baseTotal: number, minOrderTotal = 15): number {
  return Math.max(0, Number((minOrderTotal - baseTotal).toFixed(2)))
}

/**
 * Formats a number as Euro currency (e.g. €15.00).
 */
export function formatEuro(amount: number): string {
  return `€${Number(amount || 0).toFixed(2)}`
}
