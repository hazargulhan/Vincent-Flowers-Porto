import { describe, it, expect } from 'vitest'
import {
  isPtPath,
  getCleanPath,
  getLocalizedPath,
  getOppositeLanguageUrl
} from './locale'

describe('Locale routing helpers (locale.ts)', () => {
  describe('isPtPath', () => {
    it('identifies /pt and /pt/... paths correctly', () => {
      expect(isPtPath('/pt')).toBe(true)
      expect(isPtPath('/pt/')).toBe(true)
      expect(isPtPath('/pt/shop')).toBe(true)
      expect(isPtPath('/pt/builder?ref=123')).toBe(true)
      expect(isPtPath('/pt/faq#delivery')).toBe(true)
    })

    it('returns false for English or non-Portuguese paths', () => {
      expect(isPtPath('/')).toBe(false)
      expect(isPtPath('/shop')).toBe(false)
      expect(isPtPath('/events')).toBe(false)
      expect(isPtPath('/pto-something')).toBe(false)
      expect(isPtPath('')).toBe(false)
    })
  })

  describe('getCleanPath', () => {
    it('strips /pt prefix cleanly', () => {
      expect(getCleanPath('/pt')).toBe('/')
      expect(getCleanPath('/pt/')).toBe('/')
      expect(getCleanPath('/pt/shop')).toBe('/shop')
      expect(getCleanPath('/pt/events')).toBe('/events')
      expect(getCleanPath('/pt/faq#delivery')).toBe('/faq#delivery')
    })

    it('leaves standard paths untouched', () => {
      expect(getCleanPath('/')).toBe('/')
      expect(getCleanPath('/shop')).toBe('/shop')
      expect(getCleanPath('/builder')).toBe('/builder')
    })
  })

  describe('getLocalizedPath', () => {
    it('generates /pt paths when isPt is true', () => {
      expect(getLocalizedPath('/', true)).toBe('/pt')
      expect(getLocalizedPath('/shop', true)).toBe('/pt/shop')
      expect(getLocalizedPath('/events', true)).toBe('/pt/events')
      expect(getLocalizedPath('/faq#returns', true)).toBe('/pt/faq#returns')
      // If already prefixed with /pt, should not duplicate
      expect(getLocalizedPath('/pt/shop', true)).toBe('/pt/shop')
    })

    it('generates standard paths when isPt is false', () => {
      expect(getLocalizedPath('/pt', false)).toBe('/')
      expect(getLocalizedPath('/pt/shop', false)).toBe('/shop')
      expect(getLocalizedPath('/shop', false)).toBe('/shop')
      expect(getLocalizedPath('/', false)).toBe('/')
    })
  })

  describe('getOppositeLanguageUrl', () => {
    it('switches between English and Portuguese preserving deep route and anchor', () => {
      // From English to Portuguese
      expect(getOppositeLanguageUrl('/', false)).toBe('/pt')
      expect(getOppositeLanguageUrl('/shop', false)).toBe('/pt/shop')
      expect(getOppositeLanguageUrl('/faq#care', false)).toBe('/pt/faq#care')

      // From Portuguese to English
      expect(getOppositeLanguageUrl('/pt', true)).toBe('/')
      expect(getOppositeLanguageUrl('/pt/shop', true)).toBe('/shop')
      expect(getOppositeLanguageUrl('/pt/faq#care', true)).toBe('/faq#care')
    })
  })
})
