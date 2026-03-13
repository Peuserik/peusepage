/**
 * settings.js — theme, dark mode, and language persistence via localStorage.
 * Runs immediately (before body paint) to avoid flash of wrong theme.
 */
(function () {
  const html = document.documentElement;
  const stored = {
    mode:  localStorage.getItem('psp_mode'),
    theme: localStorage.getItem('psp_theme'),
    lang:  localStorage.getItem('psp_lang'),
  };

  if (stored.mode)  html.setAttribute('data-mode',  stored.mode);
  if (stored.theme) html.setAttribute('data-theme', stored.theme);
  if (stored.lang)  html.setAttribute('lang', stored.lang);

  // ── Public API ──────────────────────────────────────────────
  window.Settings = {
    getMode()  { return html.getAttribute('data-mode')  || 'dark'; },
    getTheme() { return html.getAttribute('data-theme') || 'warm'; },
    getLang()  { return html.getAttribute('lang')        || 'en';  },

    toggleMode() {
      const next = this.getMode() === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-mode', next);
      localStorage.setItem('psp_mode', next);
      document.dispatchEvent(new CustomEvent('settings:change', { detail: { mode: next } }));
    },

    setTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('psp_theme', theme);
      document.dispatchEvent(new CustomEvent('settings:change', { detail: { theme } }));
    },

    toggleLang() {
      const next = this.getLang() === 'en' ? 'de' : 'en';
      html.setAttribute('lang', next);
      localStorage.setItem('psp_lang', next);
      document.dispatchEvent(new CustomEvent('settings:change', { detail: { lang: next } }));
      // Re-render all translatable elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const t = window.SITE?.translations?.[next]?.[key];
        if (t) el.textContent = t;
      });
    },

    /** Translate a key using current lang */
    t(key) {
      const lang = this.getLang();
      return window.SITE?.translations?.[lang]?.[key] || key;
    },
  };
})();
