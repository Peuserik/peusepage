/**
 * office.js — Matrix canvas, popup system, clickable scene elements.
 */
(function () {
  'use strict';

  // ── Theme-aware matrix color ──────────────────────────────────
  function getMatrixColor() {
    const theme = (typeof Settings !== 'undefined') ? Settings.getTheme() : 'warm';
    if (theme === 'cool') return '#40a0e8';
    if (theme === 'mono') return '#00ff41';
    return '#e8a040'; // warm = amber
  }

  // ── Matrix rain animation ─────────────────────────────────────
  const matCanvas = document.getElementById('matrix-canvas');
  if (matCanvas) {
    const ctx = matCanvas.getContext('2d');
    const CHARS = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF'.split('');
    let drops = [];
    const FONT_SIZE = 8;

    function resizeMat() {
      matCanvas.width  = matCanvas.offsetWidth;
      matCanvas.height = matCanvas.offsetHeight;
      drops = Array.from({ length: Math.floor(matCanvas.width / FONT_SIZE) }, () =>
        Math.floor(Math.random() * (matCanvas.height / FONT_SIZE))
      );
    }

    function drawMatrix() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, matCanvas.width, matCanvas.height);
      ctx.fillStyle = getMatrixColor();
      ctx.font = `${FONT_SIZE}px monospace`;

      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * FONT_SIZE, y * FONT_SIZE);
        if (y * FONT_SIZE > matCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }

    resizeMat();
    setInterval(drawMatrix, 50);
    window.addEventListener('resize', resizeMat);
  }

  // ── Popup system ──────────────────────────────────────────────
  function openPopup(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    const focusable = el.querySelector('[data-close], button, a');
    focusable?.focus();

    const monitorDesktop = document.getElementById('monitor-desktop');
    if (monitorDesktop) {
      monitorDesktop.setAttribute('aria-hidden', id === 'popup-cv' ? 'false' : 'true');
    }
  }

  function closePopup(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-open');

    if (id === 'popup-cv') {
      const monitorDesktop = document.getElementById('monitor-desktop');
      monitorDesktop?.setAttribute('aria-hidden', 'true');
    }
  }

  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closePopup(btn.getAttribute('data-close')));
  });

  // Click outside popup window to close
  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup(overlay.id);
    });
  });

  // Desktop app tiles open sub-popups
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-open');
      // If inside desktop popup, close it first
      const parentPopup = btn.closest('.popup-overlay');
      if (parentPopup) {
        closePopup(parentPopup.id);
        setTimeout(() => openPopup(target), 200);
      } else {
        openPopup(target);
      }
    });
  });

  // Keyboard ESC to close any open popup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.popup-overlay.is-open').forEach(el => closePopup(el.id));
    }
  });

  // ── Scene click targets ───────────────────────────────────────
  function bindClickable(id, action) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', action);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    });
  }

  bindClickable('clickable-monitor',     () => openPopup('popup-desktop'));
  bindClickable('clickable-certificate', () => openPopup('popup-cv'));
  bindClickable('clickable-window',      () => openPopup('popup-hobbies'));
  bindClickable('clickable-pinboard',    () => openPopup('popup-pinboard'));

  // ── Retro clock ───────────────────────────────────────────────
  function updateRetroClock() {
    const el = document.getElementById('retro-clock');
    if (!el) return;
    const now = new Date();
    el.textContent = now.getHours().toString().padStart(2, '0') + ':' +
                     now.getMinutes().toString().padStart(2, '0');
  }
  setInterval(updateRetroClock, 1000);
  updateRetroClock();

  // ── Wall clock hands ──────────────────────────────────────────
  function updateClockHands() {
    const now = new Date();
    const hours   = (now.getHours() % 12) + now.getMinutes() / 60;
    const minutes = now.getMinutes();
    const hourHand   = document.querySelector('.clock__hand--hour');
    const minuteHand = document.querySelector('.clock__hand--minute');
    if (hourHand)   hourHand.style.transform   = `rotate(${hours * 30}deg)`;
    if (minuteHand) minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
  }
  setInterval(updateClockHands, 1000);
  updateClockHands();

  // ── Hobby i18n ────────────────────────────────────────────────
  function updateHobbiesLang(lang) {
    document.querySelectorAll('.hobby-item__label').forEach(el => {
      const val = el.getAttribute(`data-label-${lang}`);
      if (val) el.textContent = val;
    });
    document.querySelectorAll('.hobby-item__desc').forEach(el => {
      const val = el.getAttribute(`data-desc-${lang}`);
      if (val) el.textContent = val;
    });
  }

  document.addEventListener('settings:change', (e) => {
    if (e.detail.lang) updateHobbiesLang(e.detail.lang);
  });

  if (typeof Settings !== 'undefined') {
    updateHobbiesLang(Settings.getLang());
  }

  // ── Controls ──────────────────────────────────────────────────
  document.getElementById('btn-mode')?.addEventListener('click', () => {
    Settings.toggleMode();
    const btn = document.getElementById('btn-mode');
    if (btn) btn.textContent = Settings.getMode() === 'dark' ? '🌙' : '☀️';
  });

  document.getElementById('btn-lang')?.addEventListener('click', () => {
    Settings.toggleLang();
    const btn = document.getElementById('btn-lang');
    if (btn) btn.textContent = Settings.getLang() === 'en' ? '🌐' : '🇩🇪';
  });

})();
