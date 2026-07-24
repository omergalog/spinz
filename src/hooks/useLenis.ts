import { useEffect } from 'react';
import Lenis from 'lenis';

export function useLenis() {
  useEffect(() => {
    // Lenis applies transforms to html/body which breaks position:fixed on mobile.
    // Native mobile scroll is smooth enough – only enable on pointer:fine (desktop).
    if (window.matchMedia('(pointer: coarse)').matches) return;
    // Debug escape hatch: ?noLenis disables smooth scroll (used for automated visual checks)
    if (new URLSearchParams(window.location.search).has('noLenis')) return;

    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Exposed so scrollToTop() can hand the jump to Lenis; without it Lenis
    // keeps its own target and animates the page straight back.
    (window as unknown as { __spinzLenis?: Lenis }).__spinzLenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      delete (window as unknown as { __spinzLenis?: Lenis }).__spinzLenis;
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);
}
