import { Link } from 'react-router-dom';
import { useLang, useT, localizePath } from '../i18n/LanguageContext';

/**
 * שורת השימוש בפרטים, ליד כל טופס שאוסף מידע אישי.
 *
 * הנוסח שונה לפי הטופס, כי השימוש שונה: פנייה מטופלת, הזמנה מעובדת,
 * כתובת לניוזלטר מקבלת עדכונים, וביקורת — מתפרסמת. "לטיפול בפנייה
 * בלבד" ליד טופס ביקורת היה לא נכון: השם והטקסט מוצגים באתר.
 */
export default function PrivacyNote({ kind, tone = 'light' }: {
  kind: 'request' | 'order' | 'newsletter' | 'review';
  tone?: 'light' | 'dark';
}) {
  const t = useT();
  const lang = useLang();
  const n = t.privacyNote;
  // ניגודיות: על רקע בהיר #6E6A64 (4.8:1), על רקע כהה #B5B2AC.
  const color = tone === 'dark' ? '#B5B2AC' : '#6E6A64';
  const link = tone === 'dark' ? '#EDEBE6' : '#7E6129';
  return (
    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color, lineHeight: 1.6, margin: '10px 0 0', width: '100%' }}>
      {/* בעברית "ב" נצמדת למילה שאחריה; באנגלית יש רווח. */}
      {n[kind]}{lang === 'en' ? ' ' : ''}
      <Link to={`${localizePath('/terms', lang)}?tab=privacy`}
            style={{ color: link, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
        {n.link}
      </Link>.
    </p>
  );
}
