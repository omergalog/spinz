import { useState, useEffect, useRef } from 'react';

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

function applySettings(s: Settings) {
  const root = document.documentElement;

  // Font size
  root.style.fontSize = s.fontSize !== 0 ? `${100 + s.fontSize * 10}%` : '';

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

  // Pause animations — notify MotionConfig wrapper in main.tsx
  window.dispatchEvent(new CustomEvent('a11y-pause-motion', { detail: s.pauseAnimations }));
  // Also freeze plain CSS animations
  const anim = document.getElementById('a11y-anim-style') ?? (() => {
    const el = document.createElement('style');
    el.id = 'a11y-anim-style';
    document.head.appendChild(el);
    return el;
  })();
  anim.textContent = s.pauseAnimations
    ? '*, *::before, *::after { animation-play-state: paused !important; transition-duration: 0.001ms !important; }'
    : '';

  // Big cursor
  root.style.cursor = s.bigCursor ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Cpath d=\'M8 2l18 18-8-1-5 9-5-26z\' fill=\'%23fff\' stroke=\'%23000\' stroke-width=\'2\'/%3E%3C/svg%3E") 0 0, auto' : '';
}

const CONTROLS: {
  key: keyof Settings;
  label: string;
  type: 'toggle' | 'stepper';
  icon: string;
}[] = [
  { key: 'highContrast',    label: 'ניגודיות גבוהה',     type: 'toggle',  icon: '◐' },
  { key: 'underlineLinks',  label: 'הדגש קישורים',       type: 'toggle',  icon: '🔗' },
  { key: 'pauseAnimations', label: 'עצור אנימציות',      type: 'toggle',  icon: '⏸' },
  { key: 'bigCursor',       label: 'סמן גדול',           type: 'toggle',  icon: '↖' },
  { key: 'fontSize',        label: 'גודל טקסט',          type: 'stepper', icon: 'Aa' },
];

export default function AccessibilityWidget() {
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
    <div ref={panelRef} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="תפריט נגישות"
          style={{
            position: 'absolute',
            bottom: '64px',
            right: 0,
            width: '260px',
            backgroundColor: '#111',
            border: `1px solid #2A2A2A`,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', color: '#fff' }}>
              נגישות
            </span>
            {!isDefault && (
              <button
                onClick={reset}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                  color: GOLD, padding: 0,
                }}
              >
                איפוס
              </button>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    backgroundColor: active ? `${GOLD}18` : '#1C1C1C',
                    border: `1px solid ${active ? GOLD + '44' : '#2A2A2A'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{ctrl.icon}</span>
                    <span style={{
                      fontFamily: "'Heebo', sans-serif", fontSize: '13px',
                      color: active ? '#fff' : '#888',
                      fontWeight: active ? 600 : 400,
                    }}>
                      {ctrl.label}
                    </span>
                  </div>

                  {ctrl.type === 'toggle' ? (
                    <button
                      onClick={() => toggle(ctrl.key)}
                      aria-pressed={!!val}
                      aria-label={ctrl.label}
                      style={{
                        width: '36px', height: '20px',
                        borderRadius: '10px',
                        backgroundColor: active ? GOLD : '#333',
                        border: 'none', cursor: 'pointer',
                        position: 'relative', transition: 'background 0.2s',
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
                        aria-label="הקטן טקסט"
                        style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          backgroundColor: '#2A2A2A', border: 'none', cursor: 'pointer',
                          color: '#fff', fontSize: '14px', fontWeight: 700,
                          opacity: (settings.fontSize as number) <= -2 ? 0.3 : 1,
                        }}
                      >−</button>
                      <span style={{
                        fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                        color: active ? GOLD : '#555', minWidth: '16px', textAlign: 'center',
                      }}>
                        {(settings.fontSize as number) > 0 ? `+${settings.fontSize}` : settings.fontSize}
                      </span>
                      <button
                        onClick={() => step(1)}
                        disabled={(settings.fontSize as number) >= 4}
                        aria-label="הגדל טקסט"
                        style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          backgroundColor: '#2A2A2A', border: 'none', cursor: 'pointer',
                          color: '#fff', fontSize: '14px', fontWeight: 700,
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
            fontFamily: "'Heebo', sans-serif", fontSize: '10px', color: '#444',
            margin: '16px 0 0', textAlign: 'center', lineHeight: 1.6,
          }}>
            לפנייה בנושא נגישות:{' '}
            <a href="mailto:info@spinzbikes.com" style={{ color: GOLD }}>
              info@spinzbikes.com
            </a>
          </p>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="פתח תפריט נגישות"
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
