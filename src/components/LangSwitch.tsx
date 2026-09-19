import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useLang, useT, localizePath, type Lang } from '../i18n/LanguageContext';

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

  /**
   * המתג היה שתי אותיות אפורות בתוך מסגרת דקה, ונקרא כתווית ולא
   * ככפתור. נוסף אייקון גלובוס שמסמן שפה בלי מילים, הניגודיות הועלתה,
   * והשפה הפעילה מסומנת ברקע זהב במקום באפור בהיר.
   */
  return (
    <div
      role="group"
      aria-label={t.lang.switchAria}
      title={t.lang.switchAria}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '2px',
        border: `1px solid ${variant === 'dark' ? '#4A4A4A' : '#C9C4BA'}`,
        borderRadius: '999px',
        padding: '3px 3px 3px 9px',
        overflow: 'hidden', flexShrink: 0,
      }}
    >
      <Globe
        size={14}
        aria-hidden
        style={{ color: variant === 'dark' ? '#9A9690' : '#6A6862', marginInlineEnd: '3px', flexShrink: 0 }}
      />
      {(['he', 'en'] as Lang[]).map(code => {
        const on = code === lang;
        return (
          <button
            key={code}
            onClick={() => go(code)}
            aria-current={on ? 'true' : undefined}
            lang={code}
            style={{
              padding: '6px 11px',
              borderRadius: '999px',
              border: 'none',
              fontFamily: "'Heebo', sans-serif", fontSize: '12.5px',
              fontWeight: on ? 800 : 600,
              letterSpacing: '0.04em',
              color: on ? (variant === 'dark' ? '#1C1C1C' : '#1C1C1C') : idle,
              backgroundColor: on ? GOLD : 'transparent',
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
