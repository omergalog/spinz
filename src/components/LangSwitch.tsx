import { useNavigate, useLocation } from 'react-router-dom';
import { useLang, useT, localizePath, type Lang } from '../i18n/LanguageContext';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';

/**
 * מתג עב/EN. שומר על אותו עמוד ומחליף רק את קידומת השפה,
 * כך שמי שקורא את עמוד המידות בעברית נוחת על עמוד המידות באנגלית.
 */
export default function LangSwitch({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const lang = useLang();
  const t = useT();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  const go = (next: Lang) => {
    if (next === lang) return;
    navigate(localizePath(pathname, next) + search + hash);
  };

  const idle   = variant === 'dark' ? '#9A9690' : '#6A6862';
  const active = variant === 'dark' ? '#EDEBE6' : DARK;
  const border = variant === 'dark' ? '#333333' : '#DDD9D1';

  return (
    <div
      role="group"
      aria-label={t.lang.switchAria}
      style={{
        display: 'inline-flex', alignItems: 'center',
        border: `1px solid ${border}`, borderRadius: '4px',
        overflow: 'hidden', flexShrink: 0,
      }}
    >
      {(['he', 'en'] as Lang[]).map(code => {
        const on = code === lang;
        return (
          <button
            key={code}
            onClick={() => go(code)}
            aria-current={on ? 'true' : undefined}
            lang={code}
            style={{
              padding: '7px 10px',
              fontFamily: "'Heebo', sans-serif", fontSize: '12px',
              fontWeight: on ? 700 : 500,
              color: on ? active : idle,
              backgroundColor: on ? (variant === 'dark' ? '#2A2A2A' : '#EFEBE3') : 'transparent',
              cursor: on ? 'default' : 'pointer',
              transition: 'color 0.2s, background-color 0.2s',
              lineHeight: 1,
            }}
            onMouseEnter={e => { if (!on) e.currentTarget.style.color = GOLD; }}
            onMouseLeave={e => { if (!on) e.currentTarget.style.color = idle; }}
          >
            {t.lang[code]}
          </button>
        );
      })}
    </div>
  );
}
