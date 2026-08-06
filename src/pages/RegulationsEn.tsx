import PageShell from '../components/PageShell';
import LegalNotice from '../components/LegalNotice';
import { useT } from '../i18n/LanguageContext';
import { COMPANY as CO } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '30px' }}>
      <h2 style={{
        fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(17px, 2.2vw, 21px)',
        color: DARK, margin: '0 0 10px', paddingInlineStart: '11px',
        borderInlineStart: `3px solid ${GOLD}`,
      }}>
        {title}
      </h2>
      <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED, lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );
}

/**
 * הגרסה האנגלית של התקנון, כקומפוננטה נפרדת לגמרי.
 * כך הקוד של הגרסה העברית — הנוסח המחייב — לא נגוע כלל.
 */
export default function RegulationsEn() {
  const t = useT();
  const r = t.pages.regulations;
  const companyName = `${CO.legalNameEn} (${CO.legalNameHe})`;

  return (
    <PageShell
      eyebrow={r.eyebrow}
      title={r.title}
      subtitle={r.sub}
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 55%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="ltr">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <LegalNotice />

          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690', margin: '0 0 30px' }}>
            {r.version}
          </p>

          <Section title={r.s1t}>
            <p style={{ margin: 0 }}>{r.s1(companyName)}</p>
          </Section>

          <Section title={r.s2t}>
            <ul style={{ margin: 0, paddingInlineStart: '18px' }}>
              {(r.s2 as readonly string[]).map((li, i) => (
                <li key={i} style={{ marginBottom: i === r.s2.length - 1 ? 0 : '8px' }}>{li}</li>
              ))}
            </ul>
          </Section>

          <Section title={r.s3t}>
            <ul style={{ margin: 0, paddingInlineStart: '18px' }}>
              {(r.s3 as readonly (readonly [string | null, string])[]).map(([label, text], i) => (
                <li key={i} style={{ marginBottom: i === r.s3.length - 1 ? 0 : '8px' }}>
                  {label && <b>{label}</b>}{text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={r.s4t}>
            <p style={{ margin: '0 0 8px' }}>{r.s4intro}</p>
            <ul style={{ margin: '0 0 8px', paddingInlineStart: '18px' }}>
              {(r.s4list as readonly (readonly [string | null, string])[]).map(([label, text], i) => (
                <li key={i}>{label ? <><b>{label}</b>{text}</> : text}</li>
              ))}
            </ul>
            <p style={{ margin: '0 0 8px' }}>
              <b>{r.s4bodyA}</b>{r.s4bodyB}
            </p>
            <p style={{ margin: 0 }}>
              {r.s4bodyC}
              <a href="/en/cancel-order" style={{ color: GOLD, fontWeight: 700 }}>{r.s4form}</a>
              {r.s4bodyD}
            </p>
          </Section>

          <Section title={r.s5t}>
            <p style={{ margin: 0 }}>{r.s5}</p>
          </Section>

          <Section title={r.s6t}>
            <p style={{ margin: 0 }}>
              {companyName} · Company no. {CO.companyNumber}<br />
              {CO.address}<br />
              {r.emailLabel}: <a href={`mailto:${CO.email}`} style={{ color: GOLD }}>{CO.email}</a> ·
              {' '}{r.phoneLabel}: <a href={`tel:${CO.phone}`} style={{ color: GOLD }}>{CO.phone}</a>
            </p>
          </Section>

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            lineHeight: 1.7, marginTop: '34px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            {r.footerA}
            <a href="/en/terms" style={{ color: GOLD }}>{r.footerTerms}</a>
            {r.footerAnd}
            <a href="/en/presale-terms" style={{ color: GOLD }}>{r.footerPresale}</a>.
          </p>

        </div>
      </div>
    </PageShell>
  );
}
