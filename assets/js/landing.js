/**
 * landing.js — screensaver canvas, welcome text cycling, controls
 */
(function () {
  'use strict';

  // ── Welcome text cycling ─────────────────────────────────────
  const WELCOME_FONTS = [
    "'Playfair Display', serif",
    "'Space Grotesk', sans-serif",
    "'Bebas Neue', sans-serif",
    "'Cinzel', serif",
    "'Special Elite', cursive",
    "'Major Mono Display', monospace",
  ];

  const WELCOME_STRINGS = {
    en: 'Welcome',
    de: 'Willkommen',
  };

  let fontIndex = 0;
  let langFlip = false;

  function cycleWelcome() {
    const el = document.getElementById('welcome-text');
    if (!el) return;
    el.classList.add('is-fading');

    setTimeout(() => {
      fontIndex = (fontIndex + 1) % WELCOME_FONTS.length;
      el.style.fontFamily = WELCOME_FONTS[fontIndex];
      langFlip = !langFlip;
      const lang = langFlip ? (Settings.getLang() === 'en' ? 'de' : 'en') : Settings.getLang();
      el.textContent = WELCOME_STRINGS[lang] || 'Welcome';
      el.classList.remove('is-fading');
    }, 400);
  }

  setInterval(cycleWelcome, 3000);

  // Update hint text on lang change
  document.addEventListener('settings:change', (e) => {
    if (e.detail.lang) {
      const hint = document.getElementById('screen-hint');
      if (hint) hint.textContent = Settings.t('tagline_cta');
    }
  });

  // ── Screensaver canvas — floating orbs ───────────────────────
  const canvas = document.getElementById('screensaver-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.2,
      };
    }

    function initParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    }

    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(232,160,64,${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,160,64,${p.opacity})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      requestAnimationFrame(drawFrame);
    }

    resize();
    initParticles();
    drawFrame();
    window.addEventListener('resize', () => { resize(); initParticles(); });
  }

  // ── Controls ─────────────────────────────────────────────────
  document.getElementById('btn-mode')?.addEventListener('click', (e) => {
    e.stopPropagation();
    Settings.toggleMode();
    e.currentTarget.textContent = Settings.getMode() === 'dark' ? '🌙' : '☀️';
  });

  document.getElementById('btn-lang')?.addEventListener('click', (e) => {
    e.stopPropagation();
    Settings.toggleLang();
    e.currentTarget.textContent = Settings.getLang() === 'en' ? '🌐' : '🇩🇪';
  });

  // Theme picker
  const btnTheme = document.getElementById('btn-theme');
  let picker = null;

  btnTheme?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!picker) {
      picker = document.createElement('div');
      picker.className = 'theme-picker';
      const themes = window.SITE?.config?.themes?.available || [
        { id: 'warm', label: 'Warm' },
        { id: 'cool', label: 'Cool' },
        { id: 'mono', label: 'Mono' },
      ];
      themes.forEach(th => {
        const btn = document.createElement('button');
        btn.textContent = th.label;
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          Settings.setTheme(th.id);
          picker.classList.remove('is-open');
        });
        picker.appendChild(btn);
      });
      document.querySelector('.monitor__frame').appendChild(picker);
    }
    picker.classList.toggle('is-open');
  });

  // Close theme picker when clicking elsewhere
  document.addEventListener('click', () => {
    picker?.classList.remove('is-open');
  });

})();
