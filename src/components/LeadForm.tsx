import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CheckCircle, AlertCircle } from 'lucide-react';

const DARK       = '#1C1C1C';
const GOLD       = '#C9A870';
const TEXT_LIGHT = '#EDEBE6';
const BORDER_DARK = '#2A2A2A';

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

type FormData = { name: string; email: string; whatsapp?: string };
type Status   = 'idle' | 'loading' | 'success' | 'error';

function BrandBlock({ className, textLight }: { className?: string; textLight: string }) {
  return (
    <div className={`flex-col items-center text-center ${className ?? ''}`} style={{ marginTop: '48px', gap: '16px' }}>
      <img src="/assets/logo.png" alt="SPINZ" style={{ height: '70px', width: 'auto', objectFit: 'contain', filter: 'invert(1) brightness(2)' }} />
      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: textLight, margin: 0, lineHeight: 1.6 }}>
        אופני עיר סינגל ספיד. בנויים לרחובות, מעוצבים לבלוט.
      </p>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: textLight }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
        <a href="https://wa.me/972527565262?text=%D7%94%D7%99%D7%99%20Spinz%20%F0%9F%91%8B%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%90%D7%95%D7%A4%D7%A0%D7%99%D7%99%D7%9D.%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%9C%20%D7%94%D7%93%D7%92%D7%9E%D7%99%D7%9D%20%D7%95%D7%94%D7%9E%D7%97%D7%99%D7%A8%D7%99%D7%9D%20%D7%A9%D7%9C%D7%9B%D7%9D%21" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        </a>
        <a href="mailto:spinz.bikes@gmail.com?subject=%D7%94%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%A0%D7%95%D7%AA%20%D7%91%D7%90%D7%95%D7%A4%D7%A0%D7%99%D7%99%D7%9D%20Spinz&body=%D7%94%D7%99%D7%99%20Spinz%20%F0%9F%91%8B%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%90%D7%95%D7%A4%D7%A0%D7%99%D7%99%D7%9D.%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%9C%20%D7%94%D7%93%D7%92%D7%9E%D7%99%D7%9D%20%D7%95%D7%94%D7%9E%D7%97%D7%99%D7%A8%D7%99%D7%9D%20%D7%A9%D7%9C%D7%9B%D7%9D%21" style={{ color: textLight }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </a>
      </div>
    </div>
  );
}

function RevealText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '105%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function LeadForm() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [status, setStatus] = useState<Status>('idle');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const emailjs = await import('@emailjs/browser');
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  data.name,
        from_email: data.email,
        whatsapp:   data.whatsapp || '—',
      }, EMAILJS_PUBLIC_KEY);
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <section
      ref={ref}
      id="lead-form"
      style={{ backgroundColor: DARK }}
      className="px-5 py-8 md:p-9"
      dir="rtl"
    >
      <div style={{ borderTop: `1px solid ${BORDER_DARK}` }} className="pt-5 md:pt-16">
        <div
          style={{
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'start',
          }}
          className="flex flex-col gap-0 md:grid md:gap-0"
        >

          {/* Left: heading */}
          <div className="md:px-0 mb-6 md:mb-0">
            <motion.h5
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 16px',
              }}
            >
              צור קשר
            </motion.h5>

            <RevealText delay={0.08}>
              <h2
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(28px, 5.5vw, 72px)',
                  color: TEXT_LIGHT,
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                  margin: '0 0 0',
                }}
              >
                מחפש את האופניים ההבאים שלך?
              </h2>
            </RevealText>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden md:block"
              style={{
                height: '1px',
                backgroundColor: BORDER_DARK,
                margin: '16px 0',
                transformOrigin: 'right',
              }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: '15px',
                color: '#FFFFFF',
                lineHeight: 1.7,
                margin: '0 0 24px',
                maxWidth: '320px',
              }}
              className="max-md:max-w-full"
            >
              השאר פרטים ונחזור אליך עם כל המידע — מודלים, מחירים, וזמני אספקה.
            </motion.p>

            {/* Brand block — desktop only (on mobile it appears after the form) */}
            <BrandBlock className="hidden md:flex" textLight={TEXT_LIGHT} />

          </div>

          {/* Right: form — on mobile this comes before brand block */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ paddingTop: '0' }}
            className="mt-0 md:mt-0"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '60px 0',
                    textAlign: 'center',
                    borderTop: `1px solid ${BORDER_DARK}`,
                  }}
                >
                  <CheckCircle size={36} style={{ color: GOLD }} />
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, color: TEXT_LIGHT, letterSpacing: '0', fontSize: '28px', margin: 0 }}>
                    קיבלנו! נחזור אליך בקרוב.
                  </h3>
                  <p style={{ fontFamily: "'Heebo', sans-serif", color: '#FFFFFF', fontSize: '14px', margin: 0 }}>
                    תגובה תוך 24 שעות.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    style={{ marginTop: '8px', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#FFFFFF', fontFamily: "'Heebo', sans-serif", background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    שלח שוב
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
                  noValidate
                >
                  {/* Name field */}
                  <div className="lead-form-field" style={{ borderTop: `1px solid ${BORDER_DARK}`, paddingTop: '18px', paddingBottom: '18px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '14px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: errors.name ? '#CC4400' : '#FFFFFF',
                        marginBottom: '10px',
                      }}
                    >
                      שם מלא *
                    </label>
                    <input
                      type="text"
                      placeholder="ישראל ישראלי"
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        borderBottom: `1px solid ${errors.name ? '#CC4400' : BORDER_DARK}`,
                        outline: 'none',
                        color: TEXT_LIGHT,
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '16px',
                        padding: '8px 0',
                        boxSizing: 'border-box',
                      }}
                      {...register('name', { required: true })}
                    />
                    {errors.name && (
                      <p style={{ color: '#CC4400', fontSize: '11px', fontFamily: "'Heebo'", marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={11} /> שדה חובה
                      </p>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="lead-form-field" style={{ borderTop: `1px solid ${BORDER_DARK}`, paddingTop: '18px', paddingBottom: '18px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '14px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: errors.email ? '#CC4400' : '#FFFFFF',
                        marginBottom: '10px',
                      }}
                    >
                      אימייל *
                    </label>
                    <input
                      type="email"
                      placeholder="israel@example.com"
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        borderBottom: `1px solid ${errors.email ? '#CC4400' : BORDER_DARK}`,
                        outline: 'none',
                        color: TEXT_LIGHT,
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '16px',
                        padding: '8px 0',
                        boxSizing: 'border-box',
                      }}
                      {...register('email', {
                        required: true,
                        pattern: /^\S+@\S+\.\S+$/,
                      })}
                    />
                    {errors.email && (
                      <p style={{ color: '#CC4400', fontSize: '11px', fontFamily: "'Heebo'", marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={11} /> {errors.email.type === 'pattern' ? 'אימייל לא תקין' : 'שדה חובה'}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp field */}
                  <div className="lead-form-field" style={{ borderTop: `1px solid ${BORDER_DARK}`, paddingTop: '18px', paddingBottom: '18px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '14px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        marginBottom: '10px',
                      }}
                    >
                      טלפון (אופציונלי)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="+972 50-000-0000"
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        borderBottom: `1px solid ${BORDER_DARK}`,
                        outline: 'none',
                        color: TEXT_LIGHT,
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '16px',
                        padding: '8px 0',
                        boxSizing: 'border-box',
                        textAlign: 'right',
                        direction: 'ltr',
                      }}
                      {...register('whatsapp', {
                        pattern: /^[+\d\s\-()]{7,20}$/,
                      })}
                    />
                  </div>

                  {/* Error banner */}
                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 0',
                          fontSize: '13px',
                          color: '#CC4400',
                          fontFamily: "'Heebo', sans-serif",
                        }}
                      >
                        <AlertCircle size={13} />
                        משהו השתבש. נסה שוב.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <div className="lead-form-submit" style={{ borderTop: `1px solid ${BORDER_DARK}`, paddingTop: '24px', marginTop: '4px' }}>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      style={{
                        width: '100%',
                        backgroundColor: GOLD,
                        color: DARK,
                        border: 'none',
                        padding: '16px 32px',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '16px',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        opacity: status === 'loading' ? 0.6 : 1,
                        borderRadius: '4px',
                        transition: 'background-color 0.25s, transform 0.25s',
                      }}
                      onMouseEnter={e => {
                        if (status === 'loading') return;
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.backgroundColor = '#B8933A';
                        el.style.transform = 'translateY(2px)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.backgroundColor = GOLD;
                        el.style.transform = 'translateY(0)';
                      }}
                    >
                      {status === 'loading' ? 'שולח...' : 'שלח פנייה'}
                    </button>
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#FFFFFF', margin: '16px 0 0', textAlign: 'center' }}>
                      לא שולחים ספאם. מגיבים תוך 24 שעות.
                    </p>
                  </div>

                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Brand block — mobile only (on desktop it's inside the left column) */}
          <BrandBlock className="md:hidden" textLight={TEXT_LIGHT} />

        </div>
      </div>
    </section>
  );
}
