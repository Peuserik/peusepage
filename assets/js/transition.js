/**
 * transition.js — OS screensaver-wake transition from landing → main page.
 * Sequence:
 *  1. Screen flickers (rapid brightness pulses)
 *  2. Content collapses toward center (scale-down + brightness increase)
 *  3. White flash
 *  4. Navigate to main.html
 */
(function () {
  'use strict';

  const screen   = document.getElementById('screen');
  const overlay  = document.getElementById('transition-overlay');

  if (!screen || !overlay) return;

  let triggered = false;

  function triggerTransition() {
    if (triggered) return;
    triggered = true;

    screen.style.pointerEvents = 'none';

    const duration = 1200; // ms total

    // Phase 1 — flicker (0–300ms)
    let flickerCount = 0;
    const flickerInterval = setInterval(() => {
      screen.style.filter = flickerCount % 2 === 0
        ? 'brightness(2.5) contrast(1.2)'
        : 'brightness(0.8)';
      flickerCount++;
      if (flickerCount >= 6) clearInterval(flickerInterval);
    }, 50);

    // Phase 2 — collapse (300–900ms)
    setTimeout(() => {
      screen.style.transition = `transform ${duration * 0.5}ms cubic-bezier(0.55,0,1,0.45), filter ${duration * 0.5}ms ease`;
      screen.style.transform  = 'scale(0.02)';
      screen.style.filter     = 'brightness(4) saturate(0)';
    }, 300);

    // Phase 3 — flash overlay (800ms)
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.3s ease';
      overlay.style.opacity = '1';
      overlay.style.background = '#ffffff';
    }, 800);

    // Phase 4 — navigate (1200ms)
    setTimeout(() => {
      // Use baseurl-aware path injected by Jekyll, fallback to relative
      window.location.href = window.SITE_MAINURL || './main.html';
    }, duration + 200);
  }

  screen.addEventListener('click', triggerTransition);
  screen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerTransition();
    }
  });
})();
