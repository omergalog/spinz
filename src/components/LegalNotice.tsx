import { useLang } from '../i18n/LanguageContext';

/**
 * מוצג רק באנגלית, בראש כל מסמך משפטי.
 * המסמכים מנוסחים לפי הדין הישראלי, ולכן הנוסח העברי הוא המחייב —
 * האנגלית היא תרגום נוחות בלבד. בלי ההבהרה הזו, ניסוח אנגלי לא מדויק
 * עלול להתפרש כהתחייבות שונה מזו שבעברית.
 */
export default function LegalNotice() {
  const lang = useLang();
  if (lang !== 'en') return null;

  return (
    <div
      dir="ltr"
      style={{
        backgroundColor: '#FBF3E4',
        border: '1px solid #E6D4AC',
        borderRadius: '10px',
        padding: '14px 18px',
        margin: '0 0 28px',
        fontFamily: "'Heebo', sans-serif",
        fontSize: '13px',
        lineHeight: 1.7,
        color: '#6A5A38',
      }}
    >
      <strong style={{ color: '#4A3F26' }}>English translation for convenience.</strong>{' '}
      This document is governed by Israeli law and the Hebrew version is the binding one.
      In any discrepancy between this translation and the Hebrew original, the Hebrew text prevails.{' '}
      <a
        href={typeof window !== 'undefined' ? window.location.pathname.replace(/^\/en/, '') || '/' : '/'}
        style={{ color: '#8A6D3B', textDecoration: 'underline', textUnderlineOffset: '2px' }}
      >
        Read the Hebrew original
      </a>
    </div>
  );
}
