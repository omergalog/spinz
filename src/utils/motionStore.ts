type Listener = (paused: boolean) => void;
const listeners = new Set<Listener>();
let _paused = false;

try {
  const saved = localStorage.getItem('a11y_settings');
  if (saved) _paused = !!JSON.parse(saved).pauseAnimations;
} catch { /* ignore */ }

export function setPauseMotion(paused: boolean) {
  _paused = paused;
  listeners.forEach(l => l(paused));
}

export function getPauseMotion() {
  return _paused;
}

export function onPauseMotionChange(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
