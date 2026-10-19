import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { useLang, useT, localizePath } from '../i18n/LanguageContext';

/**
 * כתובת שלא קיימת.
 *
 * קודם כל כתובת לא מוכרת הופנתה בשקט לדף הבית. מבקר שהקליד כתובת
 * שגויה לא ידע שטעה, וגוגל ראה את דף הבית תחת אינסוף כתובות.
 * השרת מחזיר כאן סטטוס 404 (404.html, ראו scripts/build-seo.mjs).
 */
export default function NotFound() {
  const t = useT();
  const lang = useLang();
  const n = t.notFound;
  return (
    <PageShell eyebrow="404" title={n.title} subtitle={n.sub}>
      <div style={{ backgroundColor: '#F5F2EC', padding: '48px 20px 72px', textAlign: 'center' }}>
        <Link to={localizePath('/', lang)} style={{
          display: 'inline-block', padding: '14px 28px', borderRadius: '6px', backgroundColor: '#1C1C1C',
          color: '#EDEBE6', fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15px', textDecoration: 'none',
        }}>
          {n.home}
        </Link>
      </div>
    </PageShell>
  );
}
