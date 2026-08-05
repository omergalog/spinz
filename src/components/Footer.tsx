import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang, useT, useDir, localizePath } from '../i18n/LanguageContext';

const BG = '#1C1C1C';
const BORDER = '#2A2A2A';
const GOLD = '#C9A870';
const WHATSAPP_NUMBER = '+972527565262';

function NewsletterForm() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) { setStatus('error'); return; }
    setStatus('loading');
    const { error } = await supabase.from('newsletter').insert({ email: clean });
    if (error) {
      // Table may not exist yet – keep the address in leads so nothing is lost
      await supabase.from('leads').insert({ name: t.footer.newsletterAria, email: clean, phone: null });
    }
    setStatus('done');
    setEmail('');
  };

  if (status === 'done') {
    return (
      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: GOLD, margin: 0, padding: '12px 0' }}>
        {t.footer.subscribed}
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <label htmlFor="newsletter-email" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {t.footer.emailLabel}
      </label>
      <input
        id="newsletter-email"
        type="email"
        dir="ltr"
        value={email}
        onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
        placeholder="your@email.com"
        style={{
          flex: '1 1 200px',
          minWidth: 0,
          padding: '13px 16px',
          borderRadius: '8px',
          border: `1px solid ${status === 'error' ? '#C17A56' : '#3A3A3A'}`,
          backgroundColor: '#242424',
          color: '#EDEBE6',
          fontFamily: "'Heebo', sans-serif",
          fontSize: '16px',
          outline: 'none',
          textAlign: 'left',
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '13px 26px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: GOLD,
          color: '#1C1C1C',
          fontFamily: "'Heebo', sans-serif",
          fontSize: '14px', fontWeight: 700,
          cursor: status === 'loading' ? 'wait' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1,
          transition: 'filter 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
      >
        {status === 'loading' ? t.footer.sending : t.footer.subscribe}
      </button>
      {status === 'error' && (
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#C17A56', margin: 0, width: '100%' }}>
          {t.footer.badEmail}
        </p>
      )}
    </form>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const lang = useLang();
  const dir = useDir();
  const t = useT();
  const L = (to: string) => localizePath(to, lang);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(t.footer.whatsappText)}`;

  return (
    <>
      <footer className="relative overflow-hidden" style={{ backgroundColor: BG }} dir={dir}>

        <div className="mx-auto max-w-7xl px-6 lg:px-16">

          {/* Newsletter band */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center py-6 md:py-12"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <div>
              <h4 style={{
                fontFamily: "'Heebo', sans-serif", fontWeight: 800,
                fontSize: 'clamp(20px, 2.5vw, 26px)', color: '#EDEBE6',
                letterSpacing: '-0.01em', margin: '0 0 6px',
              }}>
                {t.footer.stayTitle}
              </h4>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.6 }}>
                {t.footer.stayBody}
              </p>
            </div>
            <NewsletterForm />
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-7 py-6 md:py-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <img
                src="/assets/logo.png"
                alt="SPINZ"
                style={{ height: '36px', width: 'auto', filter: 'invert(1) brightness(2)', opacity: 0.9, marginBottom: '14px' }}
              />
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#888', lineHeight: 1.7, maxWidth: '220px' }}>
                {t.footer.tagline}
              </p>
              <div style={{ display: 'flex', gap: '14px', marginTop: '18px' }}>
                <a href="https://www.instagram.com/spinz.bikes" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  style={{ color: '#888', transition: 'color 0.2s', padding: '12px', margin: '-12px', display: 'inline-flex' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A870'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#888'; }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                  style={{ color: '#888', transition: 'color 0.2s', padding: '12px', margin: '-12px', display: 'inline-flex' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A870'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#888'; }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>

            {[
              { title: t.footer.cols.bikes, links: [
                { label: t.nav.links.models, to: '/bikes' },
                { label: t.nav.links.specs, to: '/specs' },
                { label: t.nav.links.sizes, to: '/sizes' },
              ]},
              { title: t.footer.cols.info, links: [
                { label: t.nav.links.faq, to: '/faq' },
                { label: t.nav.links.guides, to: '/guides' },
                { label: t.footer.links.regulations, to: '/regulations' },
                { label: t.footer.links.presaleTerms, to: '/presale-terms' },
                { label: t.footer.links.cancelOrder, to: '/cancel-order' },
                { label: t.nav.contact, to: '/contact' },
              ]},
              { title: t.footer.cols.brand, links: [
                { label: t.nav.links.story, to: '/story' },
                { label: t.nav.links.gallery, to: '/gallery' },
                { label: t.nav.links.community, to: '/community' },
                { label: t.nav.links.reviews, to: '/reviews' },
              ]},
            ].map(col => (
              <div key={col.title}>
                <h4 style={{
                  fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#C9A870', margin: '0 0 16px',
                }}>
                  {col.title}
                </h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {col.links.map(l => (
                    <li key={l.to}>
                      <Link
                        to={L(l.to)}
                        style={{
                          fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                          color: '#B5B2AC', textDecoration: 'none', transition: 'color 0.2s',
                          display: 'inline-block', padding: '11px 0',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#EDEBE6'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#B5B2AC'; }}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-2 py-6 md:flex-row" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p className="text-xs" style={{ color: '#FFFFFF', fontFamily: "'Heebo', sans-serif" }}>
              {t.footer.rights}
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/regulations')}
                style={{
                  fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                  color: '#888', background: 'none', border: 'none',
                  cursor: 'pointer', textDecoration: 'underline',
                  textUnderlineOffset: '3px', transition: 'color 0.2s',
                  padding: '10px 0',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C9A870'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
              >
                {t.footer.links.regulations}
              </button>
              <button
                onClick={() => navigate('/terms')}
                style={{
                  fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                  color: '#888', background: 'none', border: 'none',
                  cursor: 'pointer', textDecoration: 'underline',
                  textUnderlineOffset: '3px', transition: 'color 0.2s',
                  padding: '10px 0',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C9A870'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
              >
                {t.footer.links.terms}
              </button>
              <Link
                to="/accessibility"
                style={{
                  fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                  color: '#888', textDecoration: 'underline',
                  textUnderlineOffset: '3px', transition: 'color 0.2s',
                  display: 'inline-block', padding: '10px 0',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A870'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#888'; }}
              >
                {t.footer.links.accessibility}
              </Link>
            </div>
            <p className="text-xs" style={{ color: '#FFFFFF', fontFamily: "'Heebo', sans-serif" }}>
              Designed in Tel Aviv
            </p>
          </div>
        </div>
      </footer>

    </>
  );
}
