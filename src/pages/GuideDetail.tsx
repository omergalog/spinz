import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { getGuide, getGuides, type GuideBlock } from '../data/guides';
import { useT, useLang, localizePath, useDir } from '../i18n/LanguageContext';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15.5px', color: MUTED, lineHeight: 1.9, margin: '0 0 16px' }}>
          {block.text}
        </p>
      );
    case 'list':
      return (
        <ul style={{ margin: '0 0 16px', paddingInlineStart: '20px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15.5px', color: MUTED, lineHeight: 1.75 }}>{it}</li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: DARK, color: '#EDEBE6', fontFamily: "'Heebo', sans-serif",
                fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</span>
              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15.5px', color: MUTED, lineHeight: 1.7, paddingTop: '3px' }}>{it}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderInlineStart: `3px solid ${GOLD}`,
          borderRadius: '10px', padding: '14px 16px', margin: '4px 0 20px',
        }}>
          <span aria-hidden style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: DARK, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            {block.text}
          </p>
        </div>
      );
    case 'image':
      return (
        <figure style={{ margin: '8px 0 24px' }}>
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            style={{ width: '100%', borderRadius: '14px', display: 'block', aspectRatio: '16 / 9', objectFit: 'cover' }}
          />
        </figure>
      );
    default:
      return null;
  }
}

export default function GuideDetail() {
  const dir = useDir();
  const t = useT();
  const lang = useLang();
  const L = (to: string) => localizePath(to, lang);
  const { slug } = useParams();
  const guide = slug ? getGuide(slug, lang) : undefined;

  // Same route (/guides/:slug) stays mounted across related-guide clicks, so
  // reset the scroll to the top of the new guide whenever the slug changes.
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    if (!guide) return;
    const prevTitle = document.title;
    document.title = guide.metaTitle;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content') ?? null;
    if (meta) meta.setAttribute('content', guide.metaDescription);
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc !== null) meta.setAttribute('content', prevDesc);
    };
  }, [guide]);

  if (!guide) return <Navigate to={L("/guides")} replace />;

  const related = getGuides(lang).filter(g => g.slug !== guide.slug).slice(0, 3);

  return (
    <PageShell
      eyebrow="Guide"
      title={guide.title}
      subtitle={guide.summary}
      heroImage={guide.heroImage}
      heroPosition={guide.heroPosition}
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir={dir}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Breadcrumb */}
          <nav style={{ marginBottom: '22px', fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#9A9690' }}>
            <Link to={L("/guides")} style={{ color: GOLD, textDecoration: 'none' }}>{t.pages.guides.crumb}</Link>
            <span aria-hidden> ← </span>
            <span>{guide.title}</span>
          </nav>

          {/* Facts + read time */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
            <span style={chip}>{guide.readTime}</span>
            {guide.facts?.map(f => (
              <span key={f.label} style={chip}>
                <b style={{ color: DARK }}>{f.label}:</b> {f.value}
              </span>
            ))}
          </div>

          {/* Intro */}
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '17px', color: DARK, lineHeight: 1.85, margin: '0 0 36px', fontWeight: 500 }}>
            {guide.intro}
          </p>

          {/* Sections */}
          {guide.sections.map((section, si) => (
            <section key={si} style={{ marginBottom: '34px' }}>
              <h2 style={{
                fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(18px, 2.4vw, 23px)',
                color: DARK, margin: '0 0 14px', paddingInlineStart: '11px', borderInlineStart: `3px solid ${GOLD}`,
              }}>
                {section.heading}
              </h2>
              {section.blocks.map((b, bi) => <Block key={bi} block={b} />)}
            </section>
          ))}

          {/* FAQ */}
          {guide.faq && guide.faq.length > 0 && (
            <section style={{ marginTop: '44px', paddingTop: '32px', borderTop: `1px solid ${BORDER}` }}>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(18px, 2.4vw, 23px)', color: DARK, margin: '0 0 20px' }}>
                {t.pages.guides.faqTitle}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {guide.faq.map((f, i) => (
                  <div key={i}>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15.5px', color: DARK, margin: '0 0 6px' }}>{f.q}</h3>
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED, lineHeight: 1.8, margin: 0 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div style={{
            marginTop: '44px', padding: 'clamp(24px, 5vw, 36px)', borderRadius: '16px',
            background: 'linear-gradient(135deg, #1C1C1C 0%, #2A2620 100%)', textAlign: 'center',
          }}>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '18px', fontWeight: 800, color: '#EDEBE6', margin: '0 0 6px' }}>
              {t.pages.guides.ctaTitle}
            </p>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: 'rgba(237,235,230,0.7)', margin: '0 0 20px' }}>
              {t.pages.guides.ctaBody}
            </p>
            <Link to={L("/bikes")} style={{
              display: 'inline-block', backgroundColor: GOLD, color: DARK, fontFamily: "'Heebo', sans-serif",
              fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textDecoration: 'none',
              padding: '13px 30px', borderRadius: '8px',
            }}>
              {t.pages.guides.ctaLink}
            </Link>
          </div>

          {/* Related guides */}
          <section style={{ marginTop: '48px', paddingTop: '32px', borderTop: `1px solid ${BORDER}` }}>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '18px', color: DARK, margin: '0 0 18px' }}>
              {t.pages.guides.more}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {related.map(r => (
                <Link key={r.slug} to={L(`/guides/${r.slug}`)} style={{
                  display: 'block', backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`,
                  borderRadius: '12px', overflow: 'hidden', textDecoration: 'none',
                }}>
                  <img src={r.heroImage} alt={r.title} loading="lazy" style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: DARK, lineHeight: 1.4 }}>{r.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </PageShell>
  );
}

const chip: React.CSSProperties = {
  fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: MUTED,
  backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '100px', padding: '6px 13px',
};
