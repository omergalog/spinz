import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePresale, PRESALE_COPY } from '../config/presale';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const CREAM = '#EDEBE6';

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
      <span style={{ fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: CREAM }}>
        {String(value).padStart(2, '0')}
      </span>
      <span dir="rtl" style={{ fontSize: '7.5px', letterSpacing: '0.1em', color: 'rgba(237,235,230,0.55)', marginTop: '2px' }}>
        {label}
      </span>
    </span>
  );
}

export default function AnnouncementBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const presale = usePresale();
  const { d, h, m, s, done } = useCountdown(presale.deadline);

  if (!presale.active || done) return null;

  const goModels = () => {
    if (location.pathname === '/') {
      document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#models');
    }
  };

  return (
    <div
      dir="rtl"
      onClick={goModels}
      style={{
        position: 'relative', zIndex: 60,
        background: `linear-gradient(90deg, ${DARK} 0%, #2A2620 50%, ${DARK} 100%)`,
        cursor: 'pointer',
        overflow: 'hidden',
        borderBottom: `1px solid ${GOLD}`,
      }}
    >
      {/* gold sheen */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 20%, rgba(201,168,112,0.10) 50%, transparent 80%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '10px', flexWrap: 'nowrap',
        padding: '7px 14px',
        position: 'relative',
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%', backgroundColor: GOLD,
          flexShrink: 0, boxShadow: `0 0 8px ${GOLD}`,
          animation: 'presalePulse 1.6s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: "'Heebo', sans-serif",
          fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 700,
          color: CREAM, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <span style={{ color: GOLD, fontWeight: 900 }}>Pre-Sale</span>
          <span style={{ margin: '0 5px' }}>·</span>
          מחיר השקה ל-100 הראשונים
        </span>

        {/* Countdown – hidden on the narrowest screens to avoid crowding */}
        <span
          className="presale-countdown"
          style={{
            display: 'none', alignItems: 'center', gap: '7px',
            paddingInlineStart: '10px', marginInlineStart: '4px',
            borderInlineStart: '1px solid rgba(201,168,112,0.3)',
            flexShrink: 0,
            direction: 'ltr',
          }}
        >
          <Unit value={d} label="ימים" />
          <span style={{ color: 'rgba(237,235,230,0.4)', fontWeight: 700, alignSelf: 'flex-start', marginTop: '1px' }}>:</span>
          <Unit value={h} label="שעות" />
          <span style={{ color: 'rgba(237,235,230,0.4)', fontWeight: 700, alignSelf: 'flex-start', marginTop: '1px' }}>:</span>
          <Unit value={m} label="דק'" />
          <span style={{ color: 'rgba(237,235,230,0.4)', fontWeight: 700, alignSelf: 'flex-start', marginTop: '1px' }}>:</span>
          <Unit value={s} label="שנ'" />
        </span>

        <span style={{
          fontFamily: "'Heebo', sans-serif",
          fontSize: 'clamp(10px, 2.6vw, 12px)', fontWeight: 800,
          color: DARK, backgroundColor: GOLD,
          padding: '4px 12px', borderRadius: '6px',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {PRESALE_COPY.barCta}
        </span>
      </div>

      <style>{`
        @keyframes presalePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @media (min-width: 560px) {
          .presale-countdown { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
