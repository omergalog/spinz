import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos   = useRef({ x: -100, y: -100 });
  const curr  = useRef({ x: -100, y: -100 });
  const raf   = useRef<number>(0);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener('mousemove', onMove);

    function loop() {
      curr.current.x += (pos.current.x - curr.current.x) * 0.8;
      curr.current.y += (pos.current.y - curr.current.y) * 0.8;

      if (cursorRef.current) {
        const size = 14;
        cursorRef.current.style.transform =
          `translate(${curr.current.x - size / 2}px, ${curr.current.y - size / 2}px)`;
      }

      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hidden md:block"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '24px',
        height: '24px',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
      }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Wheels */}
        <circle cx="5.5" cy="16.5" r="4" stroke="#C9A870" strokeWidth="1.2"/>
        <circle cx="18.5" cy="16.5" r="4" stroke="#C9A870" strokeWidth="1.2"/>
        {/* Rear frame: seat tube + chain stay */}
        <line x1="5.5" y1="16.5" x2="10" y2="9" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="5.5" y1="16.5" x2="12" y2="14" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Front fork */}
        <line x1="18.5" y1="16.5" x2="15" y2="9" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Top tube + down tube */}
        <line x1="10" y1="9" x2="15" y2="9" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="10" y1="9" x2="12" y2="14" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="15" y1="9" x2="12" y2="14" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Saddle */}
        <line x1="9" y1="8.5" x2="12" y2="8.5" stroke="#C9A870" strokeWidth="1.4" strokeLinecap="round"/>
        {/* Handlebar */}
        <line x1="15" y1="9" x2="17" y2="7.5" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="16" y1="7" x2="18" y2="8" stroke="#C9A870" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Crank */}
        <circle cx="12" cy="14" r="1" stroke="#C9A870" strokeWidth="1"/>
      </svg>
    </div>
  );
}
