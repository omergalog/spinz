import { useState, useEffect, useRef } from 'react';
import { setPauseMotion } from '../utils/motionStore';
import { COMPANY } from '../config/company';
import { useT } from '../i18n/LanguageContext';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';

type Settings = {
  fontSize: number;
  highContrast: boolean;
  underlineLinks: boolean;
  pauseAnimations: boolean;
  bigCursor: boolean;
};

const DEFAULT: Settings = {
  fontSize: 0,
  highContrast: false,
  underlineLinks: false,
  pauseAnimations: false,
  bigCursor: false,
};

// 32px cursors: white fill with a black outline so they stay visible on both
// the cream and the dark sections.
const BIG_ARROW =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M6 2l18 17-8 1 5 9-4 2-5-9-6 6z' fill='%23fff' stroke='%23000' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E") 4 2, auto`;
const BIG_HAND =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M12 4a2.5 2.5 0 015 0v9V9a2.5 2.5 0 015 0v4V12a2.5 2.5 0 015 0v3a2.5 2.5 0 015 0v7c0 4-3 8-8 8h-4c-4 0-6-2-8-5l-4-7a2.5 2.5 0 014-3l3 4V4z' fill='%23fff' stroke='%23000' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E") 10 2, pointer`;

function applySettings(s: Settings) {
  const root = document.documentElement;

  // Text size. The site sizes text in px (inline styles), so scaling the root
  // font-size has no effect — `zoom` on the root scales the whole page the way
  // the browser's own zoom does, which is what the control promises.
  if (s.fontSize !== 0) {
    root.style.setProperty('zoom', String(1 + s.fontSize * 0.08));
  } else {
    root.style.removeProperty('zoom');
  }

  // High contrast
  if (s.highContrast) {
    root.style.filter = 'contrast(1.5) brightness(1.05)';
  } else {
    root.style.filter = '';
  }

  // Underline links
  const style = document.getElementById('a11y-links-style') ?? (() => {
    const el = document.createElement('style');
    el.id = 'a11y-links-style';
    document.head.appendChild(el);
    return el;
  })();
  style.textContent = s.underlineLinks ? 'a { text-decoration: underline !important; }' : '';

  // Pause animations
  setPauseMotion(s.pauseAnimations);
  const anim = document.getElementById('a11y-anim-style') ?? (() => {
    const el = document.createElement('style');
    el.id = 'a11y-anim-style';
    document.head.appendChild(el);
    return el;
  })();

  if (s.pauseAnimations) {
    document.documentElement.setAttribute('data-pause-motion', 'true');
    // Pause all currently running WAAPI animations (Framer Motion uses these)
    document.getAnimations().forEach(a => a.pause());
    // Intercept new WAAPI animations so they auto-pause
    if (!(Element.prototype.animate as any).__paused) {
      const orig = Element.prototype.animate;
      (Element.prototype.animate as any) = function(this: Element, ...args: Parameters<typeof orig>) {
        const a = orig.apply(this, args);
        a.pause();
        return a;
      };
      (Element.prototype.animate as any).__paused = true;
      (Element.prototype.animate as any).__orig = orig;
    }
    anim.textContent = '*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }';
  } else {
    // Restore original animate and resume. The attribute must come off too —
    // globals.css keys `transition: none` and forced final states off it.
    document.documentElement.removeAttribute('data-pause-motion');
    const patched = Element.prototype.animate as any;
    if (patched.__paused) {
      Element.prototype.animate = patched.__orig;
    }
    document.getAnimations().forEach(a => a.play());
    anim.textContent = '';
  }

  // Big cursor. Setting it on the root alone is overridden by every button and
  // link (they declare cursor:pointer), i.e. exactly where the cursor matters,
  // so it goes through a stylesheet with !important instead.
  const cursorStyle = document.getElementById('a11y-cursor-style') ?? (() => {
    const el = document.createElement('style');
    el.id = 'a11y-cursor-style';
    document.head.appendChild(el);
    return el;
  })();
  cursorStyle.textContent = s.bigCursor
    ? `*, *::before, *::after { cursor: ${BIG_ARROW} !important; }
       a, button, [role="button"], label, select, summary,
       input[type="checkbox"], input[type="radio"], input[type="submit"] { cursor: ${BIG_HAND} !important; }
       input, textarea { cursor: text !important; }`
    : '';
  root.style.cursor = '';
}

const CONTROLS: {
  key: keyof Settings;
  labelKey: 'contrast' | 'links' | 'motion' | 'cursor' | 'text';
  type: 'toggle' | 'stepper';
  icon: string;
}[] = [
  { key: 'highContrast',    labelKey: 'contrast' as const,     type: 'toggle',  icon: '◐' },
  { key: 'underlineLinks',  labelKey: 'links' as const,       type: 'toggle',  icon: '🔗' },
  { key: 'pauseAnimations', labelKey: 'motion' as const,      type: 'toggle',  icon: '⏸' },
  { key: 'bigCursor',       labelKey: 'cursor' as const,           type: 'toggle',  icon: '↖' },
  { key: 'fontSize',        labelKey: 'text' as const,          type: 'stepper', icon: 'Aa' },
];

export default function AccessibilityWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('a11y_settings');
      return saved ? { ...DEFAULT, ...JSON.parse(saved) } : DEFAULT;
    } catch { return DEFAULT; }
  });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem('a11y_settings', JSON.stringify(settings));
  }, [settings]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const reset = () => setSettings(DEFAULT);
  const isDefault = JSON.stringify(settings) === JSON.stringify(DEFAULT);

  const toggle = (key: keyof Settings) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  const step = (delta: number) => {
    setSettings(s => ({ ...s, fontSize: Math.max(-2, Math.min(4, (s.fontSize as number) + delta)) }));
  };

  return (
    <div ref={panelRef} style={{ position: 'fixed', bottom: 'calc(24px + var(--fab-lift, 0px))', right: '24px', zIndex: 9999, transition: 'bottom 0.35s ease' }}>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t.a11y.panelAria}
          style={{
            position: 'absolute',
            bottom: '64px',
            right: 0,
            width: '272px',
            backgroundColor: '#F5F0E8',
            border: `1px solid #D8D0C0`,
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '15px', color: '#1C1C1C' }}>
              {t.a11y.panelTitle}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={reset}
                disabled={isDefault}
                style={{
                  background: 'none', border: 'none', cursor: isDefault ? 'default' : 'pointer',
                  fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                  color: isDefault ? '#C0B8A8' : '#8A6830', padding: 0,
                  textDecoration: isDefault ? 'none' : 'underline',
                  textUnderlineOffset: '2px',
                  transition: 'color 0.2s',
                }}
              >
                {t.a11y.reset}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label={t.a11y.closeAria}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  backgroundColor: '#E8E0D0', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#5A5040', fontSize: '14px', fontWeight: 700, lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {CONTROLS.map(ctrl => {
              const val = settings[ctrl.key];
              const active = ctrl.type === 'toggle' ? !!val : (val as number) !== 0;
              return (
                <div
                  key={ctrl.key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: active ? `${GOLD}22` : '#EDE7DA',
                    border: `1px solid ${active ? GOLD + '88' : '#CEC6B4'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{ctrl.icon}</span>
                    <span style={{
                      fontFamily: "'Heebo', sans-serif", fontSize: '13px',
                      color: active ? '#1C1C1C' : '#5A5040',
                      fontWeight: active ? 700 : 400,
                    }}>
                      {t.a11y.controls[ctrl.labelKey]}
                    </span>
                  </div>

                  {ctrl.type === 'toggle' ? (
                    <button
                      onClick={() => toggle(ctrl.key)}
                      aria-pressed={!!val}
                      aria-label={t.a11y.controls[ctrl.labelKey]}
                      style={{
                        width: '36px', height: '20px',
                        borderRadius: '10px',
                        backgroundColor: active ? GOLD : '#C8BFB0',
                        border: 'none', cursor: 'pointer',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: active ? '2px' : '16px',
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        transition: 'right 0.2s',
                      }} />
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => step(-1)}
                        disabled={(settings.fontSize as number) <= -2}
                        aria-label={t.a11y.smaller}
                        style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          backgroundColor: '#D8D0C0', border: 'none', cursor: 'pointer',
                          color: '#1C1C1C', fontSize: '14px', fontWeight: 700,
                          opacity: (settings.fontSize as number) <= -2 ? 0.3 : 1,
                        }}
                      >−</button>
                      <span style={{
                        fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                        color: active ? '#8A6830' : '#8A7A6A', minWidth: '16px', textAlign: 'center',
                        fontWeight: 600,
                      }}>
                        {(settings.fontSize as number) > 0 ? `+${settings.fontSize}` : settings.fontSize}
                      </span>
                      <button
                        onClick={() => step(1)}
                        disabled={(settings.fontSize as number) >= 4}
                        aria-label={t.a11y.larger}
                        style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          backgroundColor: '#D8D0C0', border: 'none', cursor: 'pointer',
                          color: '#1C1C1C', fontSize: '14px', fontWeight: 700,
                          opacity: (settings.fontSize as number) >= 4 ? 0.3 : 1,
                        }}
                      >+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '10px', color: '#8A7A6A',
            margin: '14px 0 0', textAlign: 'center', lineHeight: 1.6,
          }}>
            {t.a11y.contactLine}{' '}
            <a href={`mailto:${COMPANY.email}`} style={{ color: '#8A6830' }}>
              {COMPANY.email}
            </a>
          </p>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t.a11y.accessibility}
        aria-expanded={open}
        style={{
          width: '48px', height: '48px',
          borderRadius: '50%',
          backgroundColor: open ? GOLD : DARK,
          border: `2px solid ${open ? GOLD : '#2A2A2A'}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!open) (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD;
        }}
        onMouseLeave={e => {
          if (!open) (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A2A2A';
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="4" r="2" fill={open ? DARK : GOLD} />
          <path d="M12 7v5M9 9l-3 3M15 9l3 3M10 14l-1 5M14 14l1 5" stroke={open ? DARK : GOLD} strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 12h8" stroke={open ? DARK : GOLD} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
