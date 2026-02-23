// ============================================
// Alex Kobak — Portfolio Scripts
// ============================================

(function () {
  'use strict';

  // --- Scroll Reveal ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // --- Nav Scroll (only on homepage with hero) ---
  const nav = document.getElementById('nav');
  const hasHero = document.querySelector('.hero');

  if (hasHero) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // --- Mobile Menu ---
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active')
        ? 'hidden'
        : '';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Video Thumbnail Keyframes ---
  // Seek each thumbnail to an interesting frame.
  // Per-cell override via data-seek attribute (0–1 fraction); default 10%.
  // We retry via 'seeked' + a fallback timer since the browser
  // may need to fetch additional data after setting currentTime.
  document.querySelectorAll('.thumb-video').forEach((video) => {
    const cell    = video.closest('.video-cell');
    const seekSec = parseFloat(cell && cell.dataset.seek);
    // data-seek is now absolute seconds; fall back to 10% of duration
    const TARGET  = () => (!isNaN(seekSec) && seekSec > 0)
      ? seekSec
      : Math.max(1, (video.duration || 30) * 0.10);

    const doSeek = () => {
      video.currentTime = TARGET();
    };

    // Once the seek completes, the frame is painted — nothing more to do.
    // If currentTime resets to 0 it means the seek failed; retry once.
    video.addEventListener('seeked', () => {
      if (video.currentTime < 0.5) {
        setTimeout(doSeek, 400);
      }
    });

    if (video.readyState >= 1 && video.duration) {
      doSeek();
    } else {
      video.addEventListener('loadedmetadata', doSeek, { once: true });
    }

    // Belt-and-suspenders: try again 1.5s later for slow-loading videos
    setTimeout(() => {
      if (video.currentTime < 0.5 && video.duration) doSeek();
    }, 1500);
  });

  // --- Lightbox ---
  const lightbox     = document.getElementById('lightbox');
  const lightboxBg   = document.getElementById('lightbox-bg');
  const lightboxVid  = document.getElementById('lightbox-video');
  const lightboxClose= document.getElementById('lightbox-close');
  const lightboxTitle= document.getElementById('lightbox-title');

  if (lightbox) {
    const lightboxDirector = document.getElementById('lightbox-director');

    // Open on cell click
    document.querySelectorAll('.video-cell').forEach((cell) => {
      cell.addEventListener('click', () => {
        const src      = cell.dataset.src;
        const title    = cell.dataset.title;
        const director = cell.dataset.director;
        lightboxVid.src = src;
        lightboxTitle.textContent    = title    || '';
        if (lightboxDirector) lightboxDirector.textContent = director ? `Dir. ${director}` : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        lightboxVid.play().catch(() => {});
      });
    });

    // Close helpers
    function closeLightbox() {
      lightbox.classList.remove('active');
      lightboxVid.pause();
      setTimeout(() => { lightboxVid.src = ''; }, 350);
      document.body.style.overflow = '';
    }

    lightboxBg.addEventListener('click', closeLightbox);
    lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // --- Stat Counter Animation ---
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => counterObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }
})();
