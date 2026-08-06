import { useState } from 'react';
import PageShell from '../components/PageShell';
import LegalNotice from '../components/LegalNotice';
import { COMPANY as CO } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

const COMPANY_LINE = `${CO.legalNameEn} (${CO.legalNameHe}), company no. ${CO.companyNumber}`;

export const privacySectionsEn = [
  { title: null, text: `${COMPANY_LINE} is committed to protecting your privacy and to full transparency in how we use the information you share with us.` },
  { title: 'Information we collect', text: 'When you use the site, fill in a form or make a purchase, we may collect personal details such as your name, email address, phone number and shipping address, along with technical information about your visit (browser, device and pages viewed).' },
  { title: 'How we use the information', text: 'Information is collected in order to process orders, provide customer service, improve the user experience, and — with your consent — send updates and offers. We do not sell your information to third parties.' },
  { title: 'Sharing with third parties', text: 'We share information with third parties only as needed to operate the service (such as the shipping company and the payment processor), and only to the extent required for that purpose.' },
  { title: 'Data retention', text: 'Information is retained for as long as needed for the purpose it was collected for, or as required by law.' },
  { title: 'Your rights', text: 'You have the right to access your information, correct it, delete it, restrict its processing or object to it — by contacting us at the address below.' },
  { title: 'Contact', text: `To exercise your rights or for any privacy question: ${CO.email}` },
  { title: 'Cookies', text: 'We use cookies in accordance with your consent. You can manage your preferences at any time through your browser settings.' },
  { title: 'Company details', text: `The site is operated by ${COMPANY_LINE}. Email: ${CO.email} · Phone: ${CO.phone}.` },
];

export const termsSectionsEn = [
  { title: 'General', text: `The site is operated by ${COMPANY_LINE}, which sells bicycles. Use of the site and its services constitutes acceptance of these terms.` },
  { title: 'The products', text: `${CO.legalNameEn} sells urban single-speed bicycles. The bikes are designed in Tel Aviv and built from standard components available worldwide.` },
  { title: 'Technical specification', text: 'Frame: aluminum, urban geometry | Fork: steel | Wheels: 700c double-wall | Tires: Kenda 32 mm, puncture-resistant | Drivetrain: single speed, 46T chainring | Brakes: front and rear caliper.' },
  { title: 'What’s in the box', text: 'The bike arrives about 85% assembled. Final assembly involves attaching the handlebars, fitting the pedals and setting the saddle height. Assembly instructions and an instructional video are included.' },
  { title: 'Shipping', text: 'Shipping takes place within 5 business days of order confirmation, anywhere in Israel. Local pickup from Tel Aviv is available by prior arrangement, at no shipping charge.' },
  { title: 'Warranty', text: 'The bike comes with a 5-year warranty on the aluminum frame. The warranty does not cover wear items such as tires, chain, brake pads and grips, nor reasonable wear or damage caused by improper use.' },
  { title: 'Cancellation and returns', text: 'In accordance with the Israeli Consumer Protection Law, a transaction may be cancelled within 14 days of receiving the product. Full details appear in our Terms & Conditions and Pre-Sale Terms.' },
  { title: 'Limitation of liability', text: `${CO.legalNameEn} shall not be liable for indirect damages, loss of income or any consequential damage arising from use of the product or the site, subject to any applicable law.` },
  { title: 'Changes to these terms', text: `${CO.legalNameEn} reserves the right to update these terms at any time. Continued use of the site after an update constitutes acceptance of the revised terms.` },
  { title: 'Contact', text: `For any question: ${CO.email} · ${CO.phone}` },
];

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
 * הגרסה האנגלית של תנאי השימוש ומדיניות הפרטיות, כקומפוננטה נפרדת.
 * הנוסח העברי — המחייב — נשאר ב-Terms.tsx ללא שינוי.
 */
export default function TermsEn() {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');
  const sections = tab === 'privacy' ? privacySectionsEn : termsSectionsEn;

  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Use & Privacy Policy"
      subtitle="The rules for using the site, product details, and how we look after your personal information."
      heroImage="/assets/lifestyle-hero.jpg"
      heroPosition="center 45%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="ltr">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <LegalNotice />

          <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${BORDER}`, marginBottom: '34px' }}>
            {[
              { id: 'terms', label: 'Terms of Use' },
              { id: 'privacy', label: 'Privacy Policy' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as 'terms' | 'privacy')}
                style={{
                  padding: '12px 22px', background: 'none', border: 'none',
                  borderBottom: tab === t.id ? `2px solid ${GOLD}` : '2px solid transparent',
                  marginBottom: '-1px',
                  color: tab === t.id ? DARK : '#9A9690',
                  fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.03em',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {sections.map((s, i) => (
            <Section key={`${tab}-${i}`} title={s.title}>{s.text}</Section>
          ))}

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            lineHeight: 1.7, marginTop: '14px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            Last updated: July 2026. This document supplements the
            <a href="/en/regulations" style={{ color: GOLD }}> Terms &amp; Conditions</a> and the
            <a href="/en/presale-terms" style={{ color: GOLD }}> Pre-Sale Terms</a>.
          </p>

        </div>
      </div>
    </PageShell>
  );
}
