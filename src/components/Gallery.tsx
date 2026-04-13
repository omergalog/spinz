import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';



const TEXT = '#111111';
const TEXT_MUTED = '#8A8880';
const BG = '#F5F2EC';
const BORDER = '#E0DCD4';

const photos = [
  { id: 1, src: '/assets/gallery-1.jpg', span: 'col-span-2 row-span-2', alt: 'Spinz Pink — white rims' },
  { id: 2, src: '/assets/gallery-2.jpg', span: 'col-span-1 row-span-1', alt: 'Spinz Sage Green' },
  { id: 3, src: '/assets/gallery-3.jpg', span: 'col-span-1 row-span-1', alt: 'Spinz — front view' },
  { id: 4, src: '/assets/gallery-4.jpg', span: 'col-span-1 row-span-1', alt: 'Spinz Army Green' },
  { id: 5, src: '/assets/gallery-5.jpg', span: 'col-span-1 row-span-1', alt: 'Spinz Burgundy' },
  { id: 6, src: '/assets/gallery-6.jpg', span: 'col-span-2 row-span-1', alt: 'Spinz 2026 Collection' },
];

function PhotoCell({ photo, delay }: { photo: (typeof photos)[number]; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      className={`${photo.span} relative overflow-hidden`}
      style={{ backgroundColor: '#EDEAE4', minHeight: '180px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.img
        src={photo.src}
        alt={photo.alt}
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ mixBlendMode: 'multiply' }}
        loading="lazy"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />

      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-10"
        style={{ backgroundColor: 'rgba(28,28,28,0.18)' }}
      />
    </motion.div>
  );
}

export default function Gallery() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });

  return (
    <section
      ref={ref}
      id="gallery"
      className="relative py-24 lg:py-32"
      style={{ backgroundColor: BG }}
    >
      <div className="w-full h-px" style={{ backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-16 pt-16 lg:pt-20" dir="rtl">

        {/* Header */}
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
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(32px, 7vw, 80px)',
                  color: TEXT,
                  letterSpacing: '-0.02em',
                }}
              >
                העיר שלך. הצבע שלך.
              </motion.h2>
            </div>
          </div>

          <motion.a
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            href="#models"
            className="flex items-center gap-2 pb-1 text-sm font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap"
            style={{ color: '#C9A870', fontFamily: "'Heebo', sans-serif", textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#A8885A'; (e.currentTarget as HTMLAnchorElement).style.gap = '10px'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A870'; (e.currentTarget as HTMLAnchorElement).style.gap = '8px'; }}
          >
            לכל הדגמים ←
          </motion.a>
        </div>

        {/* Desktop grid */}
        <div className="hidden gap-2 md:grid md:grid-cols-4 md:grid-rows-3" style={{ backgroundColor: 'transparent' }}>
          {photos.map((photo, i) => (
            <PhotoCell key={photo.id} photo={photo} delay={i * 0.07} />
          ))}
        </div>

        {/* Mobile 2-col */}
        <div className="grid grid-cols-2 gap-2 md:hidden" style={{ backgroundColor: 'transparent' }}>
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.7, delay: i * 0.06 }}
              className="relative overflow-hidden"
              style={{ backgroundColor: '#EDEAE4', aspectRatio: '1/1' }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ mixBlendMode: 'multiply' }}
                loading="lazy"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </motion.div>
          ))}
        </div>

        {/* Follow prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-5"
          dir="rtl"
        >
          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
          <span
            className="text-[11px] uppercase tracking-[0.3em]"
            style={{ color: '#CCC', fontFamily: "'Heebo', sans-serif" }}
          >
            Spinz — 2026
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: BORDER }} />
    </section>
  );
}
