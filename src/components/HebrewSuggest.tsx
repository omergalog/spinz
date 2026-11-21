/**
 * באתר האנגלי: הצעה לעבור לעברית למי שהדפדפן שלו מוגדר גם לעברית (21.11.2026).
 *
 * רקע: לקוחות דוברי עברית הגיעו ל-/en (למשל מתוצאת חיפוש), וכרום תרגם להם
 * את העמוד אוטומטית. התרגום שבר את עדכון המחיר (נשאר ₪1,299 במקום ₪1,099).
 * מאז האתר חוסם תרגום אוטומטי (meta google notranslate), ובמקומו מוצעת כאן
 * הגרסה העברית שכבר קיימת. סגירה נזכרת בדפדפן.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { stripLangPrefix, useLang } from '../i18n/LanguageContext';

const KEY = 'spinz-he-suggest-dismissed';

function prefersHebrew(): boolean {
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    return langs.some(l => /^(he|iw)\b/i.test(l || ''));
  } catch { return false; }
}

export default function HebrewSuggest() {
  const lang = useLang();
  const { pathname, search, hash } = useLocation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (lang !== 'en' || !prefersHebrew()) { setShow(false); return; }
    let dismissed = false;
    try { dismissed = localStorage.getItem(KEY) === '1'; } catch { /* אחסון חסום */ }
    setShow(!dismissed);
  }, [lang]);
  if (!show) return null;
  const close = () => { setShow(false); try { localStorage.setItem(KEY, '1'); } catch { /* אחסון חסום */ } };
  return (
    <div role="region" aria-label="גרסה בעברית" dir="rtl" lang="he"
      style={{
        position: 'fixed', zIndex: 9000, left: '50%', transform: 'translateX(-50%)', top: '76px', // מתחת לתפריט, הרחק מהכפתורים הצפים ומבאנר העוגיות למטה
        width: 'calc(100% - 32px)', maxWidth: '360px', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px 10px 10px',
        backgroundColor: '#1C1C1C', color: '#FFFFFF', borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)', fontFamily: "'Heebo', sans-serif",
      }}>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>האתר זמין גם בעברית</span>
      <Link to={`${stripLangPrefix(pathname)}${search}${hash}`} onClick={() => setShow(false)}
        style={{ backgroundColor: '#C9A870', color: '#1C1C1C', borderRadius: '8px', padding: '8px 14px',
                 fontSize: '14px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
        לעברית
      </Link>
      <button type="button" onClick={close} aria-label="סגירה"
        style={{ background: 'none', border: 'none', color: '#BDB8AF', fontSize: '20px', lineHeight: 1,
                 cursor: 'pointer', padding: '4px 6px' }}>
        ×
      </button>
    </div>
  );
}
