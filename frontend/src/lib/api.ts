/**
 * The one place the backend address lives.
 *
 * This used to be a `window.location.hostname === 'localhost'` ternary copied into ten
 * files, each hardcoding one Cloudflare account's workers.dev subdomain. Two things
 * went wrong with that: moving the account silently broke every form on the site, and
 * a dev server reached over 127.0.0.1 or the LAN posted *real* orders to production
 * because the hostname was not literally "localhost".
 */

const configured = import.meta.env.VITE_API_BASE

if (import.meta.env.PROD && !configured) {
  // Loud on purpose. Without this the failure surfaces as an unexplained network
  // error on every order form rather than as a missing build variable.
  console.error('VITE_API_BASE is not set. Falling back to the local dev address.')
}

// Derived from the current host rather than hardcoded to "localhost", so that
// `npm run dev:network` (testing from a phone on the same Wi-Fi) reaches the worker.
const devFallback = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:8787`
  : 'http://localhost:8787'

/** No trailing slash, so apiUrl() never produces a double slash. */
export const API_BASE = (configured || devFallback).replace(/\/+$/, '')

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Resolves an image path from the catalog.
 *
 * Uploaded media is stored as a relative `/media/...` key so the saved catalog does
 * not pin itself to whichever API host was in use at upload time. Built-in artwork
 * (`/images/...`) is served by the site itself and passes through untouched.
 */
export function mediaUrl(url: string): string {
  if (!url) return url
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  return url.startsWith('/media/') ? apiUrl(url) : url
}
