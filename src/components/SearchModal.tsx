import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, CornerDownLeft, Clock } from 'lucide-react';
import { search, highlight } from '../lib/search';
import { type DocType } from '../data/searchIndex';
import { useT, useLang, useDir, localizePath } from '../i18n/LanguageContext';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const CREAM = '#F5F2EC';
const BORDER = '#E0DCD4';
const MUTED = '#6A6862';

const RECENT_KEY = 'spinz-recent-searches';
const MAX_RECENT = 5;

const TYPE_COLOR: Record<DocType, string> = {
  product: GOLD,
  page: '#8A8378',
  guide: '#7D9168',
  faq: '#9A8AA8',
};


function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, MAX_RECENT); }
  catch { return []; }
}

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlight(text, query).map((p, i) =>
        p.hit
          ? <mark key={i} style={{ backgroundColor: '#F2E3C4', color: DARK, borderRadius: '3px', padding: '0 1px' }}>{p.text}</mark>
          : <span key={i}>{p.text}</span>,
      )}
    </>
  );
}

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const lang = useLang();
  const dir = useDir();
  const SUGGESTED = t.search.suggested;
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => search(query, 8), [query]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setRecent(readRecent());
    // The panel animates in; focusing on the next frame keeps iOS from
    // scrolling the page under the overlay.
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); document.body.style.overflow = prev; };
  }, [open]);

  // Keep the highlighted row inside the scroll area during keyboard nav.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (to: string, term: string) => {
    const next = [term.trim(), ...readRecent().filter(r => r !== term.trim())]
      .filter(Boolean).slice(0, MAX_RECENT);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
    onClose();
    navigate(localizePath(to, lang));
    // A result must land at the top of its page, not wherever the reader
    // happened to be scrolled when they opened the search.
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % results.length); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => (a - 1 + results.length) % results.length); }
    if (e.key === 'Enter')     { e.preventDefault(); const r = results[active]; if (r) go(r.doc.to, query); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t.search.dialogAria}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: 'rgba(18,17,16,0.55)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: 'clamp(12px, 8vh, 96px) 16px 16px',
          }}
          dir={dir}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            onKeyDown={onKeyDown}
            style={{
              width: '100%', maxWidth: '620px',
              backgroundColor: CREAM,
              borderRadius: '16px',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              maxHeight: 'min(600px, 82vh)',
            }}
          >
            {/* Input row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderBottom: `1px solid ${BORDER}`,
              backgroundColor: '#FFFFFF', flexShrink: 0,
            }}>
              <Search size={19} color={MUTED} style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                aria-label={t.search.fieldAria}
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: "'Heebo', sans-serif", color: DARK,
                  minWidth: 0,
                }}
              />
              <button
                onClick={onClose}
                aria-label={t.search.closeAria}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: '#EFEBE3', color: '#5A5040', flexShrink: 0,
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Results / empty states */}
            <div ref={listRef} style={{ overflowY: 'auto', padding: '8px' }}>
              {query.trim() === '' ? (
                <div style={{ padding: '10px 10px 14px' }}>
                  {recent.length > 0 && (
                    <>
                      <p style={labelStyle}>{t.search.recent}</p>
                      <div style={chipRow}>
                        {recent.map(r => (
                          <button key={r} onClick={() => setQuery(r)} style={chipStyle}>
                            <Clock size={12} color={MUTED} />
                            {r}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <p style={{ ...labelStyle, marginTop: recent.length ? '18px' : 0 }}>{t.search.common}</p>
                  <div style={chipRow}>
                    {SUGGESTED.map(s => (
                      <button key={s} onClick={() => setQuery(s)} style={chipStyle}>{s}</button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15px', color: DARK, margin: '0 0 6px' }}>
                    {t.search.noResults(query)}
                  </p>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13.5px', color: MUTED, margin: '0 0 18px', lineHeight: 1.7 }}>
                    {t.search.noResultsHelp}
                  </p>
                  <button
                    onClick={() => go(localizePath('/contact', lang), query)}
                    style={{
                      backgroundColor: GOLD, color: DARK, borderRadius: '8px',
                      padding: '10px 22px', fontFamily: "'Heebo', sans-serif",
                      fontWeight: 700, fontSize: '13.5px',
                    }}
                  >
                    {t.search.toContact}
                  </button>
                </div>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.doc.id}
                    data-active={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.doc.to, query)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'right',
                      padding: '11px 13px', borderRadius: '10px',
                      backgroundColor: i === active ? '#FFFFFF' : 'transparent',
                      border: `1px solid ${i === active ? BORDER : 'transparent'}`,
                      transition: 'background-color 0.12s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{
                        fontFamily: "'Heebo', sans-serif", fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.06em', color: TYPE_COLOR[r.doc.type],
                        border: `1px solid ${TYPE_COLOR[r.doc.type]}55`, borderRadius: '4px',
                        padding: '1px 6px', flexShrink: 0,
                      }}>
                        {t.search.types[r.doc.type]}
                      </span>
                      <span style={{
                        fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', fontWeight: 700,
                        color: DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        <Highlighted text={r.doc.title} query={query} />
                      </span>
                      {i === active && <CornerDownLeft size={13} color={MUTED} style={{ marginRight: 'auto', flexShrink: 0 }} />}
                    </div>
                    <p style={{
                      fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: MUTED,
                      margin: 0, lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      <Highlighted text={r.snippet} query={query} />
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Footer hint – desktop only, the keys do not exist on touch */}
            <div className="hidden md:flex" style={{
              alignItems: 'center', gap: '16px', flexShrink: 0,
              padding: '9px 16px', borderTop: `1px solid ${BORDER}`,
              backgroundColor: '#FFFFFF',
              fontFamily: "'Heebo', sans-serif", fontSize: '11.5px', color: MUTED,
            }}>
              <span><kbd style={kbd}>↑</kbd><kbd style={kbd}>↓</kbd> {t.search.navigate}</span>
              <span><kbd style={kbd}>Enter</kbd> {t.search.open}</span>
              <span><kbd style={kbd}>Esc</kbd> {t.search.close}</span>
              {results.length > 0 && (
                <span style={{ marginRight: 'auto' }}>{t.search.resultCount(results.length)}</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Heebo', sans-serif", fontSize: '11px', fontWeight: 700,
  letterSpacing: '0.1em', color: MUTED, margin: '0 0 9px', textTransform: 'uppercase',
};

const chipRow: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '7px' };

const chipStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '999px',
  padding: '6px 13px', fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: DARK,
};

const kbd: React.CSSProperties = {
  display: 'inline-block', minWidth: '18px', textAlign: 'center',
  border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '1px 4px',
  marginLeft: '4px', backgroundColor: CREAM, fontSize: '10.5px',
};
