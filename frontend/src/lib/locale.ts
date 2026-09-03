/**
 * URL and Language Routing Utilities for Vincent Flowers Porto.
 *
 * Implements clean language prefixes (/pt/...) for Google SEO & multilingual routing.
 */

/**
 * Checks whether the given pathname is under the Portuguese route hierarchy (/pt or /pt/...).
 */
export function isPtPath(pathname: string): boolean {
  if (!pathname) return false
  const clean = pathname.split('?')[0].split('#')[0]
  return clean === '/pt' || clean.startsWith('/pt/')
}

/**
 * Strips the /pt prefix from a path to return the base canonical path.
 * Examples:
 *   /pt -> /
 *   /pt/shop -> /shop
 *   /shop -> /shop
 *   / -> /
 */
export function getCleanPath(pathname: string): string {
  if (!pathname) return '/'
  const [pathOnly, searchAndHash] = pathname.split(/(?=[?#])/)
  const suffix = searchAndHash || ''

  if (pathOnly === '/pt' || pathOnly === '/pt/') {
    return `/${suffix}`
  }
  if (pathOnly.startsWith('/pt/')) {
    return `${pathOnly.slice(3)}${suffix}`
  }
  return pathname
}

/**
 * Returns the localized path based on whether Portuguese mode is active.
 * Examples:
 *   ('/', true) -> '/pt'
 *   ('/shop', true) -> '/pt/shop'
 *   ('/faq#care', true) -> '/pt/faq#care'
 *   ('/pt/shop', false) -> '/shop'
 *   ('/', false) -> '/'
 */
export function getLocalizedPath(path: string, isPt: boolean): string {
  const clean = getCleanPath(path)
  if (!isPt) return clean

  // We want Portuguese:
  if (clean === '/' || clean === '') return '/pt'
  return `/pt${clean.startsWith('/') ? clean : `/${clean}`}`
}

/**
 * Calculates the destination URL when the user toggles the EN/PT button.
 * Preserves query params and hash anchors.
 */
export function getOppositeLanguageUrl(currentPath: string, isCurrentlyPt: boolean): string {
  return getLocalizedPath(currentPath, !isCurrentlyPt)
}
