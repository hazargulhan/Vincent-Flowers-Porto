import { useEffect, useState } from 'react'
import type { BusinessSettings } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'
import { apiUrl } from '../lib/api'

export function useSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(apiUrl(`/api/settings?t=${Date.now()}`), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        if (data && typeof data === 'object') {
          setSettings(data)
        }
      })
      .catch(err => {
        console.error('Failed to load settings:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { settings, loading }
}
