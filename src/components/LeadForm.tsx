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
      className="px-5 py-10 md:p-9"
      dir="rtl"
    >
      <div style={{ borderTop: `1px solid ${BORDER_DARK}` }} className="pt-8 md:pt-16">
        <div
          style={{
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'start',
          }}
          className="flex flex-col gap-10 md:grid md:gap-0"
        >

          {/* Left: heading */}
          <div>
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
                מחפש את האופניים המושלמים?
              </h2>
            </RevealText>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                height: '1px',
                backgroundColor: BORDER_DARK,
                margin: '28px 0',
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
                color: '#666',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '320px',
              }}
            >
              השאר פרטים ונחזור אליך עם כל המידע — מודלים, מחירים, וזמני אספקה.
            </motion.p>

            {/* Info blocks */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.65 }}
              style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              className="hidden md:flex"
            >
              {[
                { label: 'תגובה', value: 'תוך 24 שעות' },
                { label: 'שפה', value: 'עברית / English' },
                { label: 'WhatsApp', value: 'זמין 9:00–21:00' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '2px', height: '20px', backgroundColor: GOLD, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#555' }}>
                      {label}
                    </span>
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: TEXT_LIGHT, margin: '2px 0 0' }}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ paddingTop: '8px' }}
            className="mt-10 md:mt-0"
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
                  <p style={{ fontFamily: "'Heebo', sans-serif", color: '#666', fontSize: '14px', margin: 0 }}>
                    תגובה תוך 24 שעות.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    style={{ marginTop: '8px', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#555', fontFamily: "'Heebo', sans-serif", background: 'none', border: 'none', cursor: 'pointer' }}
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
                  <div style={{ borderTop: `1px solid ${BORDER_DARK}`, padding: '24px 0' }}>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '10px',
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        color: errors.name ? '#CC4400' : '#555',
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
                  <div style={{ borderTop: `1px solid ${BORDER_DARK}`, padding: '24px 0' }}>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '10px',
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        color: errors.email ? '#CC4400' : '#555',
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
                  <div style={{ borderTop: `1px solid ${BORDER_DARK}`, padding: '24px 0' }}>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '10px',
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        color: '#555',
                        marginBottom: '10px',
                      }}
                    >
                      WhatsApp (אופציונלי)
                    </label>
                    <input
                      type="tel"
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
                  <div style={{ borderTop: `1px solid ${BORDER_DARK}`, paddingTop: '32px', marginTop: '8px' }}>
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
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
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
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#444', margin: '16px 0 0', textAlign: 'center' }}>
                      לא שולחים ספאם. מגיבים תוך 24 שעות.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
