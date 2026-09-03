import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import './App.css'

import Landing from './pages/Landing'
import Home from './pages/Home'
import Events from './pages/Events'
import Subscription from './pages/Subscription'
import Shop from './pages/Shop'
import About from './pages/About'
import FAQ from './pages/FAQ'
import B2B from './pages/B2B'
import NotFound from './pages/NotFound'
import CookieBanner from './components/CookieBanner'
import { apiUrl } from './lib/api'
import { isPtPath, getCleanPath, getLocalizedPath, getOppositeLanguageUrl } from './lib/locale'

// Code-split admin and privacy so initial bundle size stays minimal for shoppers
const Admin = lazy(() => import('./pages/Admin'))
const Privacy = lazy(() => import('./pages/Privacy'))

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isPt = isPtPath(location.pathname)

  // Synchronize language with current URL:
  // Visiting /pt or /pt/... sets 'pt'
  // Visiting / or /shop etc. sets 'en' (unless on /admin)
  useEffect(() => {
    if (isPtPath(location.pathname)) {
      if (!i18n.language.startsWith('pt')) {
        i18n.changeLanguage('pt')
      }
    } else if (location.pathname !== '/admin') {
      if (i18n.language.startsWith('pt')) {
        i18n.changeLanguage('en')
      }
    }
  }, [location.pathname, i18n])

  useEffect(() => {
    document.documentElement.lang = isPt ? 'pt' : 'en'
  }, [isPt])

  const toggleLanguage = () => {
    const nextUrl = getOppositeLanguageUrl(location.pathname, isPt)
    const nextLang = isPt ? 'en' : 'pt'
    i18n.changeLanguage(nextLang)
    navigate(nextUrl)
  }

  const l = (path: string) => getLocalizedPath(path, isPt)
  const currentCleanPath = getCleanPath(location.pathname)
  const isActive = (path: string) => currentCleanPath === path

  return (
    <div className="app-container">
      <header className="app-header">
          <div className="container nav-container" style={{ display: 'flex', alignItems: 'center' }}>
            <Link to={l('/')} className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }} onClick={() => setMobileMenuOpen(false)}>
              <img src="/images/logo.webp" alt={t('nav.logo_alt')} className="nav-logo" />
              <span className="logo-text">Vincent Flowers Porto</span>
            </Link>
            
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
              <button 
                onClick={toggleLanguage} 
                style={{ border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', margin: 'auto 0' }}
                title="Change Language"
              >
                {isPt ? 'PT' : 'EN'}
              </button>
              <Link to={l('/builder')} className={isActive('/builder') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.make')}</Link>
              <Link to={l('/shop')} className={isActive('/shop') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.shop')}</Link>
              <Link to={l('/subscription')} className={isActive('/subscription') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.sub')}</Link>
              <Link to={l('/events')} className={isActive('/events') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.events')}</Link>
              <Link to={l('/b2b')} className={isActive('/b2b') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>B2B</Link>
              <Link to={l('/about')} className={isActive('/about') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.about')}</Link>
            </nav>
          </div>
        </header>

        <main>
          <Routes>
            {/* Standard English Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/builder" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/events" element={<Events />} />
            <Route path="/b2b" element={<B2B />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route
              path="/privacy"
              element={
                <Suspense fallback={<div className="container page-section" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>}>
                  <Privacy />
                </Suspense>
              }
            />

            {/* Portuguese Routes for Google and Local SEO */}
            <Route path="/pt" element={<Landing />} />
            <Route path="/pt/builder" element={<Home />} />
            <Route path="/pt/shop" element={<Shop />} />
            <Route path="/pt/subscription" element={<Subscription />} />
            <Route path="/pt/events" element={<Events />} />
            <Route path="/pt/b2b" element={<B2B />} />
            <Route path="/pt/about" element={<About />} />
            <Route path="/pt/faq" element={<FAQ />} />
            <Route
              path="/pt/privacy"
              element={
                <Suspense fallback={<div className="container page-section" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>}>
                  <Privacy />
                </Suspense>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div className="container page-section" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>}>
                  <Admin />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="container footer-content">
            <div>
              <h3>{t('footer.contact_us')}</h3>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {t('footer.phone')}: <MessageCircle size={16} /> +351- 911-119 - 351
              </p>
              <p>Email: vincent.flowers.porto@gmail.com</p>
            </div>
            <div>
              <h3>{t('footer.faq')}</h3>
              <p><Link to={l('/faq') + '#delivery'}>Delivery Information</Link></p>
              <p><Link to={l('/faq') + '#care'}>Flower Care Guide</Link></p>
              <p><Link to={l('/faq') + '#returns'}>Returns Policy</Link></p>
              <p><Link to={l('/privacy')}>{t('footer.privacy_policy')}</Link></p>
            </div>
            <div>
              <h3>{t('footer.quick_msg')}</h3>
              <FooterForm t={t} />
            </div>
          </div>

          <div className="container" style={{ borderTop: '1px solid var(--border-color)', marginTop: '2.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#666' }}>
            <span>© {new Date().getFullYear()} Vincent Flowers Porto. {t('footer.rights_reserved')}</span>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to={l('/privacy')} style={{ color: 'inherit' }}>{t('footer.privacy_policy')}</Link>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('vfp_open_cookie_banner'))}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                {t('footer.cookie_preferences')}
              </button>
            </div>
          </div>
        </footer>

        <CookieBanner />
      </div>
  )
}

function FooterForm({ t }: { t: TFunction }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(apiUrl('/api/order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'footer',
          customer: { email },
          message
        })
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.success) {
        setSubmitted(true)
      } else {
        setError(t('footer.msg_error') || 'Message failed to send. Please try again.')
      }
    } catch (err) {
      console.error('Footer message failed:', err)
      setError(t('footer.msg_error') || 'Message failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <p style={{ color: 'var(--accent-color)' }}>{t('footer.msg_sent')}</p>

  return (
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
      <input 
        type="email" 
        placeholder="Email" 
        aria-label="Email"
        autoComplete="email"
        required 
        value={email}
        onChange={e => setEmail(e.target.value)} 
      />
      <textarea 
        placeholder="Message" 
        aria-label="Message"
        rows={3} 
        required 
        value={message}
        onChange={e => setMessage(e.target.value)}
      ></textarea>
      {error && <span style={{ color: 'red', fontSize: '0.85rem' }}>{error}</span>}
      <button type="submit" disabled={loading}>{loading ? t('common.sending') : t('footer.send')}</button>
    </form>
  )
}

export default App
