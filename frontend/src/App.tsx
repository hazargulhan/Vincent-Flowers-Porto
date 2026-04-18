import { useState } from 'react'
// Version 1.0.1 - Triggering auto-deploy
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './App.css'

import Landing from './pages/Landing'
import Home from './pages/Home'
import Events from './pages/Events'
import Subscription from './pages/Subscription'
import Shop from './pages/Shop'
import About from './pages/About'
import Admin from './pages/Admin'
import FAQ from './pages/FAQ'
import B2B from './pages/B2B'

function App() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="container nav-container" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }} onClick={() => setMobileMenuOpen(false)}>
            <img src="/images/logo.webp" alt="Logo" className="nav-logo" />
            <span className="logo-text">Vincent Flowers Porto</span>
          </Link>
          
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <button 
              onClick={toggleLanguage} 
              style={{ border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', margin: 'auto 0' }}
              title="Change Language"
            >
              {(i18n.language || '').startsWith('pt') ? 'PT' : 'EN'}
            </button>
            <Link to="/builder" className={location.pathname === '/builder' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.make')}</Link>
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.shop')}</Link>
            <Link to="/subscription" className={location.pathname === '/subscription' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.sub')}</Link>
            <Link to="/events" className={location.pathname === '/events' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.events')}</Link>
            <Link to="/b2b" className={location.pathname === '/b2b' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>B2B</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{t('nav.about')}</Link>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/builder" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/events" element={<Events />} />
          <Route path="/b2b" element={<B2B />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="container footer-content">
          <div>
            <h3>{t('footer.contact_us')}</h3>
            <p>Rua de Tanger 1544, 4150-722 Porto</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {t('footer.phone')}: <MessageCircle size={16} /> +351- 911-119 - 351
            </p>
            <p>Email: vincent.flowers.porto@gmail.com</p>
          </div>
          <div>
            <h3>{t('footer.faq')}</h3>
            <p><Link to="/faq#delivery">Delivery Information</Link></p>
            <p><Link to="/faq#care">Flower Care Guide</Link></p>
            <p><Link to="/faq#returns">Returns Policy</Link></p>
          </div>
          <div>
            <h3>{t('footer.quick_msg')}</h3>
            <FooterForm t={t} />
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterForm({ t }: { t: any }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8787/api/order' 
        : 'https://vincent-flowers-backend.vincent-flowers-porto.workers.dev/api/order';
      
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'footer',
          customer: { email },
          message
        })
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Footer message failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <p style={{ color: 'var(--accent-color)' }}>{t('footer.msg_sent') || 'Message sent!'}</p>

  return (
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
      <input 
        type="email" 
        placeholder="Email" 
        required 
        value={email}
        onChange={e => setEmail(e.target.value)} 
      />
      <textarea 
        placeholder="Message" 
        rows={3} 
        required 
        value={message}
        onChange={e => setMessage(e.target.value)}
      ></textarea>
      <button type="submit" disabled={loading}>{loading ? t('footer.sending') || 'Sending...' : t('footer.send')}</button>
    </form>
  )
}

export default App
