/**
 * BATALLA DE TALENTOS SENA 2026
 * script.js — Lógica de interactividad
 *
 * Módulos:
 *  1. Canvas de estrellas/reflectores (Hero)
 *  2. Navbar: scroll + hamburguesa
 *  3. Animaciones reveal al hacer scroll
 *  4. Galería con lightbox
 *  5. Botón volver arriba
 *  6. Navegación suave (scroll-behavior fallback)
 *  7. Marca enlace activo al hacer scroll
 */

/* ================================================
   1. CANVAS DE ESTRELLAS — HERO
   ================================================
   Partículas circulares de distintos tamaños que
   simulan un cielo estrellado con destellos y
   algunos "reflectores" de color primario/dorado.
*/
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let animId;

  // Configuración de partículas
  const STAR_COUNT   = 160;
  const SPOT_COUNT   = 6;  // reflectores grandes

  // Redimensionar canvas al tamaño del contenedor
  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  // Crear partícula estrella
  function createStar() {
    return {
      type: 'star',
      x:    Math.random() * width,
      y:    Math.random() * height,
      r:    Math.random() * 1.6 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    };
  }

  // Crear partícula "reflector" (punto de luz grande y difuso)
  function createSpotlight() {
    const colors = [
      'rgba(194,24,91,',   // primario
      'rgba(255,215,0,',   // dorado
      'rgba(233,30,140,',  // primario claro
    ];
    return {
      type:  'spot',
      x:     Math.random() * width,
      y:     Math.random() * height * 0.7,
      r:     Math.random() * 60 + 30,
      alpha: Math.random() * 0.12 + 0.04,
      speed: Math.random() * 0.002 + 0.0005,
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx:   (Math.random() - 0.5) * 0.15,
      vy:   (Math.random() - 0.5) * 0.08,
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < STAR_COUNT; i++) particles.push(createStar());
    for (let i = 0; i < SPOT_COUNT; i++)  particles.push(createSpotlight());
  }

  function drawStar(p, t) {
    const alpha = (Math.sin(t * p.speed * Math.PI * 2 + p.phase) * 0.5 + 0.5) * 0.85 + 0.15;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  function drawSpotlight(p, t) {
    // Movimiento suave
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -p.r * 2)     p.x = width  + p.r;
    if (p.x > width  + p.r) p.x = -p.r * 2;
    if (p.y < -p.r * 2)     p.y = height + p.r;
    if (p.y > height + p.r) p.y = -p.r * 2;

    const alpha = (Math.sin(t * p.speed * Math.PI * 2 + p.phase) * 0.5 + 0.5) * p.alpha;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    gradient.addColorStop(0, p.color + alpha + ')');
    gradient.addColorStop(1, p.color + '0)');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  let startTime = null;

  function loop(timestamp) {
    if (!startTime) startTime = timestamp;
    const t = (timestamp - startTime) / 1000; // segundos

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      if (p.type === 'star')  drawStar(p, t);
      if (p.type === 'spot')  drawSpotlight(p, t);
    }

    animId = requestAnimationFrame(loop);
  }

  // Arranque
  resize();
  init();
  animId = requestAnimationFrame(loop);

  // Redimensionar con debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      init();
    }, 200);
  });

  // Pausar al salir del viewport para ahorrar recursos
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (!animId) animId = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });
  observer.observe(canvas.closest('.hero'));
})();


/* ================================================
   2. NAVBAR
   ================================================ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const menu     = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Clase "scrolled" al desplazarse
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburguesa
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar menú al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !navbar.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ================================================
   3. REVEAL AL HACER SCROLL
   ================================================ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Retraso escalonado para los hijos de un grid
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
          const idx = siblings.indexOf(entry.target);
          const delay = idx * 80; // ms

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ================================================
   4. GALERÍA — LIGHTBOX
   ================================================ */
(function initLightbox() {
  const lightbox  = document.getElementById('lightbox');
  const lb_img    = document.getElementById('lightboxImg');
  const lb_close  = document.getElementById('lightboxClose');
  const lb_prev   = document.getElementById('lightboxPrev');
  const lb_next   = document.getElementById('lightboxNext');

  if (!lightbox) return;

  // Recopilar todas las imágenes de galería y de categorías
  const galleryImgs = Array.from(
    document.querySelectorAll('.galeria-item img, .foto-card img')
  );

  let currentIdx = 0;

  function openLightbox(idx) {
    currentIdx = idx;
    lb_img.src = galleryImgs[idx].src;
    lb_img.alt = galleryImgs[idx].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lb_img.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lb_img.src = '';
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIdx = (currentIdx + 1) % galleryImgs.length;
    lb_img.src = galleryImgs[currentIdx].src;
    lb_img.alt = galleryImgs[currentIdx].alt;
  }

  function showPrev() {
    currentIdx = (currentIdx - 1 + galleryImgs.length) % galleryImgs.length;
    lb_img.src = galleryImgs[currentIdx].src;
    lb_img.alt = galleryImgs[currentIdx].alt;
  }

  // Abrir al hacer clic en tarjetas de categoría
  document.querySelectorAll('.foto-card').forEach((card, i) => {
    card.addEventListener('click', () => {
      // Índice dentro de galleryImgs (las primeras son galeria-item, luego foto-card)
      const galCount = document.querySelectorAll('.galeria-item img').length;
      openLightbox(galCount + i);
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Ver imagen ampliada');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });

  // Abrir al hacer clic en galería general
  document.querySelectorAll('.galeria-item').forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Ver imagen ampliada');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') item.click();
    });
  });

  lb_close.addEventListener('click', closeLightbox);
  lb_prev.addEventListener('click', showPrev);
  lb_next.addEventListener('click', showNext);

  // Cerrar al hacer clic en el fondo
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft')  showPrev();
  });
})();


/* ================================================
   5. BOTÓN VOLVER ARRIBA
   ================================================ */
(function initScrollTop() {
  const btn = document.getElementById('btnTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ================================================
   6. MARCA ENLACE ACTIVO AL HACER SCROLL (Spy)
   ================================================ */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navH     = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

  function updateActive() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - navH - 24;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ================================================
   7. NAVEGACIÓN SUAVE (fallback para Safari antiguo)
   ================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
