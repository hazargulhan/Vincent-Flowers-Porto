import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { isPtPath, getCleanPath } from '../lib/locale'

const SITE_URL = 'https://vincentflowersporto.com'
const DEFAULT_IMAGE = `${SITE_URL}/images/logo.webp`

interface SeoProps {
  title: string
  description: string
  /** Route this page is canonical for, e.g. "/shop". */
  path: string
  /** Absolute URL, or a site-relative path such as "/images/logo.webp". */
  image?: string
  noindex?: boolean
}

/**
 * Per-page canonical, OpenGraph, Twitter, and hreflang multilingual alternate tags.
 */
export default function Seo({ title, description, path, image, noindex }: SeoProps) {
  const location = useLocation()
  const isPt = isPtPath(location.pathname) || isPtPath(path)
  const cleanPath = getCleanPath(path)

  const enPath = cleanPath === '/' ? '' : cleanPath
  const ptPath = `/pt${enPath}`

  const enUrl = `${SITE_URL}${enPath || '/'}`
  const ptUrl = `${SITE_URL}${ptPath}`
  const currentUrl = isPt ? ptUrl : enUrl
  const ogImage = image ? (/^https?:\/\//i.test(image) ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE

  return (
    <Helmet>
      <html lang={isPt ? 'pt' : 'en'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Multilingual alternates for Google SEO (RFC 5988 / Webmaster Guidelines) */}
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="pt" href={ptUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />

      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={isPt ? 'pt_PT' : 'en_GB'} />
      <meta property="og:locale:alternate" content={isPt ? 'en_GB' : 'pt_PT'} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
