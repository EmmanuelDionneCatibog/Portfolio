const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const getScrollTop = () =>
  window.pageYOffset ??
  document.documentElement.scrollTop ??
  document.body.scrollTop ??
  0;

const setScrollTop = (top) => {
  // Assign directly to avoid interaction with CSS `scroll-behavior: smooth`
  // (which can cause RAF-driven animations to restart/jump).
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
};

export function animateWindowScrollTo(targetTop, durationMs) {
  const startTop = getScrollTop();
  const delta = targetTop - startTop;
  if (delta === 0) return () => {};

  const startTime = performance.now();
  let raf = 0;

  const tick = (now) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / durationMs);
    const eased = easeInOutCubic(t);
    setScrollTop(startTop + delta * eased);
    if (t < 1) raf = window.requestAnimationFrame(tick);
  };

  raf = window.requestAnimationFrame(tick);
  return () => window.cancelAnimationFrame(raf);
}

export function smoothScrollToId(id, { durationMs = 750, offsetPx = 0 } = {}) {
  const el = document.getElementById(id);
  if (!el) return () => {};

  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  const targetTop = el.getBoundingClientRect().top + window.pageYOffset - offsetPx;
  const finalTop = Math.max(0, targetTop);

  if (prefersReducedMotion) {
    setScrollTop(finalTop);
    return () => {};
  }

  return animateWindowScrollTo(finalTop, durationMs);
}
