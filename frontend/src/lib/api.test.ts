import { describe, it, expect } from 'vitest'
import { apiUrl, mediaUrl } from './api'

describe('API and Media URL resolution (api.ts)', () => {
  it('apiUrl formats paths consistently with or without leading slash', () => {
    const withSlash = apiUrl('/api/catalog')
    const withoutSlash = apiUrl('api/catalog')
    expect(withSlash).toBe(withoutSlash)
    expect(withSlash).toContain('/api/catalog')
  })

  it('mediaUrl preserves external http and https URLs', () => {
    const external = 'https://example.com/flower.jpg'
    expect(mediaUrl(external)).toBe(external)

    const httpUrl = 'http://cdn.com/asset.png'
    expect(mediaUrl(httpUrl)).toBe(httpUrl)
  })

  it('mediaUrl preserves local /images/ paths untouched', () => {
    const localImg = '/images/logo.webp'
    expect(mediaUrl(localImg)).toBe(localImg)
  })

  it('mediaUrl maps relative /media/ paths to the backend API', () => {
    const r2Path = '/media/flowers/rose.webp'
    const resolved = mediaUrl(r2Path)
    expect(resolved).toContain('/media/flowers/rose.webp')
  })

  it('mediaUrl handles empty or falsy strings gracefully', () => {
    expect(mediaUrl('')).toBe('')
  })
})
