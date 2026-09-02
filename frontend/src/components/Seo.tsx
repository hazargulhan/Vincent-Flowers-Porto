import { Helmet } from 'react-helmet-async'

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
 * Per-page canonical, OpenGraph and Twitter tags.
 *
 * index.html ships a canonical link and an og:url pointing at the homepage. Those are
 * correct for "/" but every route inherited them, so search engines saw /shop, /events
 * and the rest all canonicalising to "/" — which drops them from the index — and every
 * shared link previewed as the homepage. Helmet overrides the static tags by matching
 * on rel/property/name, so these win wherever a page renders this component.
 *
 * Every tag is rendered unconditionally: Helmet expects real elements as children, and
 * conditional children are a reliable way to break it.
 */
export default function Seo({ title, description, path, image, noindex }: SeoProps) {
  const url = `${SITE_URL}${path}`
  const ogImage = image ? (/^https?:\/\//i.test(image) ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
