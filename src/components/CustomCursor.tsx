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
      curr.current.x += (pos.current.x - curr.current.x) * 0.15;
      curr.current.y += (pos.current.y - curr.current.y) * 0.15;

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '14px',
        height: '14px',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
      }}
    >
      {/* Horizontal line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        height: '1px',
        backgroundColor: '#C9A870',
        transform: 'translateY(-50%)',
        opacity: 0.9,
      }} />
      {/* Vertical line */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        width: '1px',
        height: '100%',
        backgroundColor: '#C9A870',
        transform: 'translateX(-50%)',
        opacity: 0.9,
      }} />
    </div>
  );
}
