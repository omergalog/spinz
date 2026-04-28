import { useState } from 'react';

const PASSWORD = 'spinz2026';
const SESSION_KEY = 'spinz_auth';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => {
    if (window.location.pathname === '/waitlist' || window.location.hostname === 'waitlist.spinzbikes.com') return true;
    return sessionStorage.getItem(SESSION_KEY) === 'ok';
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'ok');
      setAuthed(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#1C1C1C',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999999,
      fontFamily: "'Heebo', sans-serif",
    }}>
      <img
        src="/assets/logo.png"
        alt="SPINZ"
        style={{ height: '48px', width: 'auto', filter: 'invert(1) brightness(2)', opacity: 0.9, marginBottom: '40px' }}
      />

      <div style={{
        backgroundColor: '#242424',
        border: '1px solid #2A2A2A',
        borderRadius: '16px',
        padding: '36px 32px',
        width: '100%',
        maxWidth: '340px',
        animation: shake ? 'shake 0.4s ease' : 'none',
      }}>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
          האתר בתצוגה מקדימה פרטית
        </p>

        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="סיסמא"
          autoFocus
          dir="ltr"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: `1px solid ${error ? '#FF6B6B' : '#3A3A3A'}`,
            backgroundColor: '#1C1C1C',
            color: '#EDEBE6',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: '12px',
            textAlign: 'center',
            letterSpacing: '0.15em',
          }}
        />

        {error && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
            סיסמא שגויה
          </p>
        )}

        <button
          onClick={submit}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: '#C9A870',
            border: 'none',
            color: '#1C1C1C',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          כניסה
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
