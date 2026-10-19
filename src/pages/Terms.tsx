import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import LegalNotice from '../components/LegalNotice';
import { useLang, localizePath } from '../i18n/LanguageContext';
import { getPrivacySections, PRIVACY_UPDATED } from '../data/privacy';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const LINK = '#7E6129';
const BORDER = '#E0DCD4';

function Section({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '30px' }}>
      {title && (
        <h2 style={{
          fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(17px, 2.2vw, 21px)',
          color: DARK, margin: '0 0 10px', paddingInlineStart: '11px',
          borderInlineStart: `3px solid ${GOLD}`,
        }}>
          {title}
        </h2>
      )}
      <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED, lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );
}

/**
 * מדיניות הפרטיות (/terms).
 *
 * העמוד הכיל גם לשונית "תנאי שימוש" ישנה, שסתרה את התקנון: ביטול רק
 * אם האופניים לא הורכבו, "עד 5 ימי עסקים לכל הארץ", "עמידים לפנצ'ר".
 * היא הוסרה (19.10.2026). תנאי השימוש המחייבים הם התקנון ב-/regulations.
 * הכתובת נשארה /terms כדי שקישורים קיימים ימשיכו לעבוד.
 */
export default function Terms() {
  const lang = useLang();
  const en = lang === 'en';
  const L = (to: string) => localizePath(to, lang);

  return (
    <PageShell
      eyebrow={en ? 'Legal' : 'פרטיות'}
      title={en ? 'Privacy Policy' : 'מדיניות פרטיות'}
      subtitle={en
        ? 'What information we collect, why, where it is kept and for how long.'
        : 'איזה מידע אנחנו אוספים, למה, אצל מי הוא נשמר ולכמה זמן.'}
      heroImage="/assets/lifestyle-hero.jpg"
      heroPosition="center 45%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir={en ? 'ltr' : 'rtl'}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {en && <LegalNotice />}

          {getPrivacySections(lang).map((s, i) => (
            <Section key={i} title={s.title}>{s.text}</Section>
          ))}

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#6E6A64',
            lineHeight: 1.7, marginTop: '14px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            {en ? <>Last updated: {PRIVACY_UPDATED.en}. Terms of use are set out in the{' '}</>
                : <>תאריך עדכון אחרון: {PRIVACY_UPDATED.he}. תנאי השימוש מפורטים ב</>}
            <Link to={L('/regulations')} style={{ color: LINK }}>{en ? 'Terms & Conditions' : 'תקנון'}</Link>
            {en ? ' and the ' : ' ובתנאי '}
            <Link to={L('/presale-terms')} style={{ color: LINK }}>{en ? 'Pre-Sale Terms' : 'המכירה המוקדמת'}</Link>.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
