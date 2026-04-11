import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function FAQ() {
  const { t } = useTranslation()
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="container page-section" style={{ maxWidth: '800px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '4rem' }}>{t('faq.title')}</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        <section id="delivery">
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{t('faq.delivery')}</h2>
          <p>
            {t('faq.delivery_desc1')}
          </p>
          <p>
            {t('faq.delivery_desc2')}
          </p>
        </section>

        <section id="care">
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{t('faq.care')}</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            {t('faq.care_desc1')}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong>1. {t('faq.care_1')}:</strong> {t('faq.care_1_desc')}
            </li>
            <li>
              <strong>2. {t('faq.care_2')}:</strong> {t('faq.care_2_desc')}
            </li>
            <li>
              <strong>3. {t('faq.care_3')}:</strong> {t('faq.care_3_desc')}
            </li>
            <li>
              <strong>4. {t('faq.care_4')}:</strong> {t('faq.care_4_desc')}
            </li>
            <li>
              <strong>5. {t('faq.care_5')}</strong> 🌸
            </li>
          </ul>
        </section>

        <section id="returns">
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{t('faq.returns')}</h2>
          <p>
            {t('faq.returns_hello')}
          </p>
          <p>
            {t('faq.returns_1')}
          </p>
          <p>
            {t('faq.returns_2')}
          </p>
          <p>
            {t('faq.returns_3')}
          </p>
          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#666' }}>
            {t('faq.returns_note')}
          </p>
        </section>

        <section id="general">
          <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{t('faq.general')}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('faq.q1')}</h3>
              <p>{t('faq.a1')}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('faq.q2')}</h3>
              <p>{t('faq.a2')}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('faq.q3')}</h3>
              <p>{t('faq.a3')}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('faq.q4')}</h3>
              <p>{t('faq.a4')}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('faq.q5')}</h3>
              <p>{t('faq.a5')}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('faq.q6')}</h3>
              <p>{t('faq.a6')}</p>
            </div>
            
            <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
              {t('faq.general_note')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
