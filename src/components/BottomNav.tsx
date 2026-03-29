import { Home, Bike, Image, MessageCircle } from 'lucide-react';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';

const tabs = [
  { label: 'בית',     href: '#',         icon: Home          },
  { label: 'מודלים',  href: '#models',   icon: Bike          },
  { label: 'גלריה',   href: '#gallery',  icon: Image         },
  { label: 'צור קשר', href: '#lead-form',icon: MessageCircle },
];

function scrollTo(href: string) {
  if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
}

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      dir="rtl"
      style={{
        backgroundColor: DARK,
        borderTop: `1px solid #2A2A2A`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          onClick={e => { e.preventDefault(); scrollTo(href); }}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-150"
          style={{
            color: '#666',
            textDecoration: 'none',
            fontFamily: "'Heebo', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.05em',
          }}
          onTouchStart={e => { (e.currentTarget as HTMLAnchorElement).style.color = GOLD; }}
          onTouchEnd={e => { setTimeout(() => { (e.currentTarget as HTMLAnchorElement).style.color = '#666'; }, 300); }}
        >
          <Icon size={20} strokeWidth={1.5} />
          {label}
        </a>
      ))}

      {/* CTA button in the center */}
      <a
        href="#lead-form"
        onClick={e => { e.preventDefault(); scrollTo('#lead-form'); }}
        className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: GOLD, color: DARK }}
      >
        <MessageCircle size={22} strokeWidth={2} />
      </a>
    </nav>
  );
}
