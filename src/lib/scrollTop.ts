/**
 * Jump to the very top of the page.
 *
 * Two things make this less trivial than it looks:
 *  - globals.css sets `scroll-behavior: smooth`, so a plain scrollTo animates;
 *    'instant' keeps the landing crisp when a route also changes underneath.
 *  - on desktop Lenis drives the scroll position, and it has to be told
 *    directly or it animates the page straight back to where it was.
 */
export function scrollToTop() {
  const lenis = (window as unknown as { __spinzLenis?: { scrollTo?: (t: number, o?: object) => void } }).__spinzLenis;
  if (typeof lenis?.scrollTo === 'function') lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}
