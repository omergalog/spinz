import PageShell from '../components/PageShell';
import LegalNotice from '../components/LegalNotice';
import { usePresale } from '../config/presale';
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
 * הגרסה האנגלית של תנאי המכירה המוקדמת, כקומפוננטה נפרדת.
 * הנוסח העברי — המחייב — נשאר ב-PresaleTerms.tsx ללא שינוי.
 */
export default function PresaleTermsEn() {
  const presale = usePresale();
  const fmt = (n: number) => n.toLocaleString('en-US');

  return (
    <PageShell
      eyebrow="Pre-Sale"
      title="Pre-Sale Terms"
      subtitle="What to know before ordering at the launch price — delivery dates, right of cancellation and refunds."
      heroImage="/assets/photo-beige-bike.jpg"
      heroPosition="center 55%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="ltr">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <LegalNotice />

          <div style={{
            backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`,
            borderRadius: '14px', padding: '20px 24px', marginBottom: '34px',
          }}>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '16px', color: DARK, margin: '0 0 10px' }}>
              In short
            </h2>
            <ul style={{ margin: 0, paddingInlineStart: '18px', fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED, lineHeight: 1.9 }}>
              <li>These bikes are a pre-order — they are <b>not yet in stock</b>.</li>
              <li>Estimated delivery: <b>{presale.arrivalLabel}</b>.</li>
              <li>You can cancel and receive a <b>full refund</b> at any stage before delivery.</li>
              <li>Even after receiving the bike — 14 days to cancel, and <b>we charge no cancellation fee</b>.</li>
              <li>If we run past the estimated date, we will tell you in advance and you can cancel at no cost.</li>
            </ul>
          </div>

          <Section title="1. What a pre-sale order means">
            <p style={{ margin: 0 }}>
              As part of our launch offer, you can order a SPINZ Urban at a reduced price before the shipment has
              arrived in Israel. This means the <b>product is not in stock at the time of your order</b>, and delivery
              will take place once the shipment is received. This disclosure is presented before the ordering stage
              in accordance with the requirements of the Israeli Consumer Protection Law, 5741-1981.
            </p>
          </Section>

          <Section title="2. Delivery date">
            <p style={{ margin: '0 0 8px' }}>
              The estimated delivery date is <b>{presale.arrivalLabel}</b>. This date is based on manufacturing and
              sea-freight schedules and may change due to factors outside our control (production delays, shipping,
              customs or force majeure).
            </p>
            <p style={{ margin: 0 }}>
              In the event of a material change to the date, we will notify you in advance, and you may choose to
              wait or <b>cancel and receive a full refund</b>.
            </p>
          </Section>

          <Section title="3. Launch price">
            <p style={{ margin: 0 }}>
              The launch price (₪{fmt(presale.presalePrice)} instead of ₪{fmt(presale.regularPrice)}) applies to a
              limited number of units in each color and size, as shown live on the site. Once the allocation for a
              given model is exhausted, it will be sold at its regular price. The operative price is the one
              displayed at the time your order was confirmed.
            </p>
          </Section>

          <Section title="4. Right of cancellation">
            <p style={{ margin: '0 0 8px' }}>
              In accordance with the Israeli Consumer Protection Law, a distance-selling transaction may be cancelled:
            </p>
            <ul style={{ margin: '0 0 8px', paddingInlineStart: '18px' }}>
              <li><b>Before receiving the product</b> — at any stage, with a full refund.</li>
              <li><b>After receiving the product</b> — within 14 days of receiving it or of receiving the transaction details document, whichever is later.</li>
              <li>
                For people with disabilities, senior citizens and new immigrants, the cancellation period is extended
                to <b>4 months</b>, provided the transaction included a conversation between the parties.
              </li>
            </ul>
            <p style={{ margin: 0 }}>
              For a cancellation after receiving the product, it must be returned in a resalable condition, in its
              original packaging where possible. Damage, depreciation or wear caused to the product after delivery
              may give rise to liability for compensation in the amount of the loss in value, in accordance with law.
            </p>
          </Section>

          <Section title="5. Cancellation fees and returning the product">
            <p style={{ margin: '0 0 8px' }}>
              <b>We do not charge any cancellation fee at all.</b> The law permits us to charge up to 5% of the
              transaction value or ₪100 (whichever is lower), but we have chosen to waive it — every cancellation
              receives a full refund.
            </p>
            <p style={{ margin: 0 }}>
              As for return shipping: for a voluntary cancellation, returning the product to us is the customer's
              responsibility and at their expense.
              <b> If the product arrived damaged or faulty, or delivery was delayed beyond the date given, collection
              is at our expense</b> and we will arrange it with you.
            </p>
          </Section>

          <Section title="6. How to cancel and receive a refund">
            <p style={{ margin: 0 }}>
              You can give notice of cancellation using the{' '}
              <a href="/en/cancel-order" style={{ color: GOLD, fontWeight: 700 }}>cancellation form</a>,
              by email at <a href={`mailto:${CO.email}`} style={{ color: GOLD }}>{CO.email}</a>,
              by phone at <a href={`tel:${CO.phone}`} style={{ color: GOLD }}>{CO.phone}</a>, or on WhatsApp.
              The refund will be issued to the payment method used for the transaction, within 14 days of our
              receiving the cancellation notice.
            </p>
          </Section>

          <Section title="7. Warranty">
            <p style={{ margin: 0 }}>
              The aluminum frame carries a 5-year warranty from the date of delivery. The warranty does not cover
              wear items (tires, inner tubes, chain, brake pads, grips), reasonable wear, or damage caused by an
              accident, by modifications made to the product, or by <b>assembly not carried out in accordance with
              the assembly instructions supplied</b>. The bike arrives mostly assembled; completing the assembly
              according to the instructions and the included video does not affect the warranty.
            </p>
          </Section>

          <Section title="8. Business details">
            <p style={{ margin: 0 }}>
              {CO.legalNameEn} ({CO.legalNameHe}) · Company no. {CO.companyNumber}<br />
              {CO.address}<br />
              Email: <a href={`mailto:${CO.email}`} style={{ color: GOLD }}>{CO.email}</a> ·
              {' '}Phone: <a href={`tel:${CO.phone}`} style={{ color: GOLD }}>{CO.phone}</a>
            </p>
          </Section>

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            lineHeight: 1.7, marginTop: '34px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            Nothing herein derogates from consumer rights under the Israeli Consumer Protection Law, 5741-1981, and
            the regulations enacted thereunder. In any conflict between this document and the provisions of law, the
            provisions of law prevail. These terms supplement the{' '}
            <a href="/en/terms" style={{ color: GOLD }}>Terms of Use and Privacy Policy</a>.
          </p>

        </div>
      </div>
    </PageShell>
  );
}
