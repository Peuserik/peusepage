/**
 * office.js — Matrix canvas, popup system, clickable scene elements.
 */
(function () {
  'use strict';

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
      ctx.fillStyle = '#00ff41';
      ctx.font = `${FONT_SIZE}px monospace`;

      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * FONT_SIZE, y * FONT_SIZE);
        if (y * FONT_SIZE > matCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }

    resizeMat();
    const matInterval = setInterval(drawMatrix, 50);
    window.addEventListener('resize', resizeMat);
  }

  // ── Popup system ──────────────────────────────────────────────
  function openPopup(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    el.querySelector('[data-close]')?.focus();

    // Show/hide monitor desktop state when CV is opened
    const monitorDesktop = document.getElementById('monitor-desktop');
    if (monitorDesktop) {
      monitorDesktop.setAttribute('aria-hidden', id === 'popup-cv' ? 'false' : 'true');
    }
  }

  function closePopup(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-open');

    // Restore matrix on CV close
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

  // Desktop app icons open sub-popups
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-open');
      closePopup('popup-desktop');
      setTimeout(() => openPopup(target), 200);
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

  // Apply on load
  updateHobbiesLang(Settings.getLang());

  // ── Controls (also available on main page) ────────────────────
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
