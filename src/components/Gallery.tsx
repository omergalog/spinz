import { useT, useDir } from '../i18n/LanguageContext';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const TEXT = '#111111';
const TEXT_MUTED = '#8A8880';
const BG = '#F5F2EC';
const BORDER = '#E0DCD4';

export type GalleryPhoto = { thumb: string; src: string; n: number };

/** סדרת תמונות ממוספרת: `${dir}/${prefix}-01.jpg` והקטנה ב-`${dir}/thumbs/`. */
export const numberedPhotos = (dir: string, prefix: string, total: number): GalleryPhoto[] =>
  Array.from({ length: total }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    // Small ~400px thumbnail for the grid, full 1024px for the lightbox
    return { thumb: `${dir}/thumbs/${prefix}-${n}.jpg`, src: `${dir}/${prefix}-${n}.jpg`, n: i + 1 };
  });

// גלריית האופניים (ברירת המחדל). גלריות אחרות — למשל החולצות — מעבירות photos משלהן.
const BIKE_PHOTOS = numberedPhotos('/assets/gallery', 'g', 64);

// ── Full-screen viewer with prev/next, keyboard and swipe ──────────────
function Lightbox({ photos, alt, index, onClose, onNav }: { photos: GalleryPhoto[]; alt: (n: number) => string; index: number; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  const TOTAL = photos.length;
  const t = useT();
  const touchX = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // הפוקוס נשאר בתמונה שמאחורי החלון, ו-Tab המשיך לגלול בין 64
  // התמונות שמתחת. הוא נכנס לחלון, נלכד בו, וחוזר לתמונה שפתחה אותו.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft') { onNav(1); return; }   // RTL: left advances forward
      if (e.key === 'ArrowRight') { onNav(-1); return; }
      if (e.key !== 'Tab') return;

      const items = Array.from(
        boxRef.current?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])') ?? [],
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !boxRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, [onClose, onNav]);

  // Preload the next and previous full images so navigation is instant
  useEffect(() => {
    [(index + 1) % TOTAL, (index - 1 + TOTAL) % TOTAL].forEach(j => {
      const img = new Image();
      img.src = photos[j].src;
    });
  }, [index, photos, TOTAL]);

  const arrowBtn: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: '52px', height: '52px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
    color: '#FFFFFF', fontSize: '24px', cursor: 'pointer', zIndex: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      ref={boxRef}
      role="dialog"
      aria-modal="true"
      aria-label={t.gallery.title}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(12,11,10,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px, 5vw, 56px)',
      }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) onNav(dx < 0 ? 1 : -1); // swipe left = forward
        touchX.current = null;
      }}
    >
      {/* Close */}
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label={t.gallery.close}
        style={{
          position: 'absolute', top: '20px', insetInlineStart: '20px', zIndex: 3,
          width: '46px', height: '46px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
          color: '#FFFFFF', fontSize: '22px', cursor: 'pointer', lineHeight: 1,
        }}
      >×</button>

      {/* Counter.
          היה למעלה עם insetInlineEnd, אבל direction: 'ltr' על אותו
          אלמנט הפך את ה-inline-end שלו לימין — בדיוק הצד שבו יושב
          כפתור הסגירה ב-RTL. ברוחב 360 המונה שכב על ה-X ותפס את
          הלחיצה במרכזו. עכשיו הוא למטה במרכז, ושקוף ללחיצות. */}
      <div aria-hidden style={{
        position: 'absolute', bottom: '18px', left: 0, right: 0, zIndex: 3,
        textAlign: 'center', pointerEvents: 'none',
        fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.7)',
        direction: 'ltr',
      }}>
        {index + 1} / {TOTAL}
      </div>

      {/* Prev (right side in RTL) */}
      <button aria-label={t.gallery.prev} onClick={e => { e.stopPropagation(); onNav(-1); }} style={{ ...arrowBtn, insetInlineEnd: 'clamp(8px, 2vw, 28px)' }}>›</button>
      {/* Next (left side in RTL) */}
      <button aria-label={t.gallery.next} onClick={e => { e.stopPropagation(); onNav(1); }} style={{ ...arrowBtn, insetInlineStart: 'clamp(8px, 2vw, 28px)' }}>‹</button>

      {/* Image — plain <img> so it swaps instantly and never depends on an animation */}
      <img
        key={index}
        src={photos[index].src}
        alt={alt(photos[index].n)}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'lbFade 0.25s ease' }}
      />
      <style>{`@keyframes lbFade { from { opacity: 0.4; } to { opacity: 1; } }`}</style>
    </motion.div>
  );
}

export default function Gallery({ hideHeader = false, photos = BIKE_PHOTOS, title, photoAlt, thumbAspect = '1 / 1', gridClass = 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6', showAllModels = true, sectionId = 'gallery' }: {
  hideHeader?: boolean;
  photos?: GalleryPhoto[];
  /** כותרת במקום כותרת גלריית האופניים. */
  title?: string;
  photoAlt?: (n: number) => string;
  thumbAspect?: string;
  gridClass?: string;
  showAllModels?: boolean;
  sectionId?: string;
}) {
  const dir = useDir();
  const t = useT();
  const TOTAL = photos.length;
  const altOf = photoAlt ?? t.gallery.photoAlt;
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const nav = useCallback((dir: 1 | -1) => {
    setOpenIndex(i => (i === null ? i : (i + dir + TOTAL) % TOTAL));
  }, [TOTAL]);

  return (
    <section ref={ref} id={sectionId} className="relative py-7 lg:py-32" style={{ backgroundColor: BG }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-16 pt-2 lg:pt-20" dir={dir}>

        {/* Header */}
        {!hideHeader && (
          <div className="mb-14 flex flex-row items-end justify-between">
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.7 }}
                className="block mb-4 text-[11px] tracking-[0.4em] uppercase"
                style={{ color: TEXT_MUTED, fontFamily: "'Heebo', sans-serif" }}
              >
                2026 Collection
              </motion.span>
              <div ref={headingRef} style={{ overflow: 'hidden' }}>
                <motion.h2
                  initial={{ y: '105%' }}
                  animate={headingInView ? { y: '0%' } : {}}
                  transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                  className="leading-none"
                  style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 7vw, 80px)', color: TEXT, letterSpacing: '-0.02em' }}
                >
                  {title ?? t.gallery.title}
                </motion.h2>
              </div>
            </div>

            {showAllModels && <motion.a
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              href="#models"
              className="flex items-center gap-2 pb-1 text-sm font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap"
              style={{ color: '#C9A870', fontFamily: "'Heebo', sans-serif", textDecoration: 'none' }}
            >
              {t.gallery.allModels}
            </motion.a>}
          </div>
        )}

        {/* Hint */}
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: TEXT_MUTED, margin: '0 0 18px' }}>
          {t.gallery.hint}
        </p>

        {/* Thumbnail grid */}
        <div className={`grid ${gridClass} gap-1.5 md:gap-2`}>
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              onClick={() => setOpenIndex(i)}
              className="gallery-thumb relative overflow-hidden"
              style={{ aspectRatio: thumbAspect, backgroundColor: '#EDEAE4', border: 'none', padding: 0, cursor: 'pointer' }}
              aria-label={t.gallery.enlarge(altOf(photo.n))}
            >
              <img
                src={photo.thumb}
                alt={altOf(photo.n)}
                width={400}
                height={400}
                decoding="async"
                loading={i < 12 ? 'eager' : 'lazy'}
                className="gallery-thumb-img absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Follow prompt */}
        <div className="mt-10 flex items-center justify-center gap-5" dir={dir}>
          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
          <span className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#CCC', fontFamily: "'Heebo', sans-serif" }}>
            Spinz – 2026
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: BORDER }} />

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox photos={photos} alt={altOf} index={openIndex} onClose={() => setOpenIndex(null)} onNav={nav} />
        )}
      </AnimatePresence>

      <style>{`
        .gallery-thumb-img { transition: transform 0.4s ease, opacity 0.3s ease; }
        .gallery-thumb:hover .gallery-thumb-img { transform: scale(1.06); }
      `}</style>
    </section>
  );
}
