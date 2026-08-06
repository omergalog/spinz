import PageShell from '../components/PageShell';
import { useT, useLang } from '../i18n/LanguageContext';
import { COMPANY, COMPANY_LINE, COMPANY_LINE_EN } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
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
      <div style={{
        fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED,
        lineHeight: 1.85, whiteSpace: 'pre-line',
      }}>
        {children}
      </div>
    </section>
  );
}

export default function Accessibility() {
  const t = useT();
  const lang = useLang();
  const a = t.pages.accessibility;
  const sections = [
    { title: null, text: `${lang === 'en' ? COMPANY_LINE_EN : COMPANY_LINE} ${a.s0}` },
    { title: a.s1t, text: a.s1 },
    { title: a.s2t, text: a.s2 },
    { title: a.s3t, text: a.s3 },
    { title: a.s4t, text: a.s4 },
    { title: a.s5t, text: `${a.emailLabel}: ${COMPANY.email}\n${a.phoneLabel}: ${COMPANY.phone}\n${a.viaWhatsapp}` },
    { title: a.s6t, text: `${a.coordinator(lang === 'en' ? COMPANY.legalNameEn : COMPANY.legalNameHe)} ${COMPANY.email}` },
  ];
  return (
    <PageShell
      eyebrow="Accessibility"
      title={a.title}
      subtitle={a.sub}
      heroImage="/assets/photo-beige-bike.jpg"
      heroPosition="center 55%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <div style={{ marginBottom: '30px' }}>
            <span style={{
              display: 'inline-block', padding: '7px 16px', borderRadius: '20px',
              border: `1px solid ${GOLD}55`, backgroundColor: `${GOLD}18`,
              fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', fontWeight: 700,
              color: '#8A6D2F', letterSpacing: '0.04em',
            }}>
              {a.badge}
            </span>
          </div>

          {sections.map((s, i) => (
            <Section key={i} title={s.title}>{s.text}</Section>
          ))}

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            lineHeight: 1.7, marginTop: '14px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            {a.updated}
          </p>

        </div>
      </div>
    </PageShell>
  );
}
