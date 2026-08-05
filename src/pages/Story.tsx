import { useT, useLang, localizePath } from '../i18n/LanguageContext';
import { getStory } from '../data/story';
import PageShell from '../components/PageShell';
import { Link } from 'react-router-dom';

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
      <div style={{
        fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED,
        lineHeight: 1.85, whiteSpace: 'pre-line',
      }}>
        {children}
      </div>
    </section>
  );
}

export default function Story() {
  const t = useT();
  const lang = useLang();
  const sections = getStory(lang);
  return (
    <PageShell
      eyebrow="Our Story"
      title={t.pages.story.title}
      subtitle={t.pages.story.sub}
      heroImage="/assets/story-hero.jpg"
      heroPosition="center 40%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {sections.map((s, i) => (
            <Section key={i} title={s.title}>{s.text}</Section>
          ))}

          <div style={{ marginTop: '10px', paddingTop: '30px', borderTop: `1px solid ${BORDER}` }}>
            <Link
              to={localizePath("/", lang) + "#models"}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: DARK, color: '#EDEBE6',
                fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700,
                letterSpacing: '0.05em', textDecoration: 'none',
                padding: '14px 32px', borderRadius: '8px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              {t.pages.story.cta}
            </Link>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
