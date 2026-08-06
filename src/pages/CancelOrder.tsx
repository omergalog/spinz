import { useState } from 'react';
import PageShell from '../components/PageShell';
import LegalNotice from '../components/LegalNotice';
import { useT, useDir, useLang, localizePath } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import { COMPANY } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

type Status = 'idle' | 'sending' | 'sent' | 'error';


export default function CancelOrder() {
  const t = useT();
  const dir = useDir();
  const lang = useLang();
  const L = (to: string) => localizePath(to, lang);
  const c = t.pages.cancel;
  const REASONS = c.reasons;
  const [form, setForm] = useState({ name: '', phone: '', email: '', orderRef: '', reason: REASONS[0], details: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: false }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.phone.trim()) errs.phone = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus('sending');
    const { error } = await supabase.from('cancellations').insert({
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_email: form.email.trim() || null,
      order_ref: form.orderRef.trim() || null,
      reason: form.reason,
      details: form.details.trim() || null,
    });

    if (error) {
      // Never lose a cancellation request – fall back to the leads table
      await supabase.from('leads').insert({
        name: `[ביטול עסקה] ${form.name.trim()}`,
        email: form.email.trim() || null,
        phone: form.phone.trim(),
      });
    }
    setStatus('sent');
  };

  const field = (
    key: string, label: string, placeholder: string,
    opts: { type?: string; required?: boolean; dir?: 'rtl' | 'ltr' } = {}
  ) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 600, color: DARK }}>
        {label}{opts.required && ' *'}
      </span>
      <input
        type={opts.type ?? 'text'}
        dir={opts.dir ?? dir}
        value={form[key as keyof typeof form]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '12px 14px', borderRadius: '9px',
          border: `1px solid ${errors[key] ? '#C17A56' : BORDER}`,
          backgroundColor: '#FFFFFF', color: DARK,
          fontFamily: "'Heebo', sans-serif", fontSize: '16px', outline: 'none', width: '100%',
        }}
      />
    </label>
  );

  return (
    <PageShell
      eyebrow={c.eyebrow}
      title={c.title}
      subtitle={c.sub}
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 55%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir={dir}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>

          <LegalNotice />

          {status === 'sent' ? (
            <div style={{
              backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`,
              borderRadius: '14px', padding: '30px 26px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>✓</div>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '21px', color: DARK, margin: '0 0 10px' }}>
                {c.received}
              </h2>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED, lineHeight: 1.8, margin: 0 }}>
                {c.receivedBody1}
                {c.receivedBody2}
                <br />
                {c.questions} <a href={`mailto:${COMPANY.email}`} style={{ color: GOLD }}>{COMPANY.email}</a> · {COMPANY.phone}
              </p>
            </div>
          ) : (
            <>
              <div style={{
                backgroundColor: '#FAF6EE', borderInlineStart: `4px solid ${GOLD}`,
                borderRadius: '10px', padding: '14px 18px', marginBottom: '26px',
                fontFamily: "'Heebo', sans-serif", fontSize: '13.5px', color: MUTED, lineHeight: 1.75,
              }}>
                {c.alsoBy1} <a href={`tel:${COMPANY.phone}`} style={{ color: GOLD }}>{COMPANY.phone}</a>,{' '}
                {c.alsoBy2} <a href={`mailto:${COMPANY.email}`} style={{ color: GOLD }}>{COMPANY.email}</a> {c.alsoBy3}{' '}
                {c.seeTerms1} <a href={L('/presale-terms')} style={{ color: GOLD }}>{c.seeTerms2}</a>.
              </div>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {field('name', c.name, c.name, { required: true })}
                {field('phone', c.phone, '050-0000000', { type: 'tel', required: true, dir: 'ltr' })}
                {field('email', c.email, 'israel@example.com', { type: 'email', dir: 'ltr' })}
                {field('orderRef', c.orderNo, c.optional)}

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 600, color: DARK }}>
                    {c.reason}
                  </span>
                  <select
                    value={form.reason}
                    onChange={e => set('reason', e.target.value)}
                    style={{
                      padding: '12px 14px', borderRadius: '9px', border: `1px solid ${BORDER}`,
                      backgroundColor: '#FFFFFF', color: DARK,
                      fontFamily: "'Heebo', sans-serif", fontSize: '16px', outline: 'none', width: '100%',
                    }}
                  >
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 600, color: DARK }}>
                    {c.details}
                  </span>
                  <textarea
                    value={form.details}
                    onChange={e => set('details', e.target.value)}
                    rows={4}
                    placeholder={c.detailsPh}
                    style={{
                      padding: '12px 14px', borderRadius: '9px', border: `1px solid ${BORDER}`,
                      backgroundColor: '#FFFFFF', color: DARK, resize: 'vertical',
                      fontFamily: "'Heebo', sans-serif", fontSize: '16px', outline: 'none', width: '100%',
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  style={{
                    marginTop: '6px', padding: '15px', borderRadius: '9px', border: 'none',
                    backgroundColor: DARK, color: '#EDEBE6',
                    fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700,
                    cursor: status === 'sending' ? 'wait' : 'pointer',
                    opacity: status === 'sending' ? 0.7 : 1,
                  }}
                >
                  {status === 'sending' ? c.sending : c.submit}
                </button>

                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#9A9690', margin: 0, lineHeight: 1.7 }}>
                  {c.legal1}{' '}
                  {c.legal2}
                </p>
              </form>
            </>
          )}

        </div>
      </div>
    </PageShell>
  );
}
