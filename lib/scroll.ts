export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScrollToElement(
  el: HTMLElement,
  opts?: { durationMs?: number; offsetPx?: number }
) {
  const durationMs = opts?.durationMs ?? 900;
  const offsetPx = opts?.offsetPx ?? 72;

  const startY = window.scrollY;
  const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offsetPx);
  const delta = targetY - startY;

  if (Math.abs(delta) < 2) return;

  const start = performance.now();

  function step(now: number) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = easeInOutCubic(t);
    window.scrollTo(0, startY + delta * eased);
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

