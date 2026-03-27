/* ============================================================
   FLOWPAY.WORK — SCRIPT.JS
   ============================================================ */

(function () {
  'use strict';

  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ============================================================
     1. YEAR
     ============================================================ */
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     2. NAV — scroll + mobile
     ============================================================ */
  const navHeader  = qs('#nav-header');
  const navToggle  = qs('#nav-toggle');
  const mobileMenu = qs('#mobile-menu');
  let menuOpen = false;

  function updateNav() {
    navHeader.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  function toggleMenu(force) {
    menuOpen = typeof force !== 'undefined' ? force : !menuOpen;
    navToggle.classList.toggle('open', menuOpen);
    navToggle.setAttribute('aria-expanded', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  navToggle && navToggle.addEventListener('click', () => toggleMenu());
  qsa('.mobile-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('click', e => {
    if (menuOpen && !navHeader.contains(e.target)) toggleMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(false);
  });

  /* ============================================================
     3. REVEAL — Intersection Observer
     ============================================================ */
  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  qsa('.reveal').forEach(el => revealObserver.observe(el));

  /* ============================================================
     4. TASK COUNTER — count up animation
     ============================================================ */
  const counterEl = qs('#task-counter');
  const TARGET    = 47; /* current "tasks completed" count */

  if (counterEl) {
    const counterObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        counterObserver.disconnect();
        let current = 0;
        const step = Math.ceil(TARGET / 60);
        const timer = setInterval(() => {
          current = Math.min(current + step, TARGET);
          counterEl.textContent = current;
          if (current >= TARGET) clearInterval(timer);
        }, 20);
      }
    }, { threshold: 0.5 });
    counterObserver.observe(counterEl);
  }

  /* ============================================================
     5. RECEIPT — rotating task name + live countdown
     ============================================================ */
  const tasks = [
    'Video Review',
    'Email List Building',
    'SEO Quick Wins',
    'Sitemap & Indexing',
    'Landing Page Audit',
    'DR Submissions'
  ];

  const rotatingEl = qs('#rotating-task');
  let taskIndex    = 0;

  if (rotatingEl) {
    setInterval(() => {
      taskIndex = (taskIndex + 1) % tasks.length;
      rotatingEl.style.opacity = '0';
      rotatingEl.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        rotatingEl.textContent = tasks[taskIndex];
        rotatingEl.style.transition = 'opacity 0.3s, transform 0.3s';
        rotatingEl.style.opacity = '1';
        rotatingEl.style.transform = 'translateY(0)';
      }, 250);
    }, 3200);
  }

  /* Countdown timer (ticks down from a fake 18h 34m) */
  const hEl = qs('#countdown-h');
  const mEl = qs('#countdown-m');

  if (hEl && mEl) {
    let totalMinutes = 18 * 60 + 34;

    setInterval(() => {
      totalMinutes = Math.max(totalMinutes - 1, 0);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      hEl.textContent = h;
      mEl.textContent = m.toString().padStart(2, '0');
      if (totalMinutes === 0) totalMinutes = 48 * 60; /* reset to 48h */
    }, 4000); /* ticks every 4s so it's visibly moving but not frantic */
  }

  /* ============================================================
     6. FAQ ACCORDION
     ============================================================ */
  qsa('.faq-q').forEach(btn => {
    const item   = btn.closest('.faq-item');
    const answer = item ? item.querySelector('.faq-a') : null;
    if (!answer) return;

    answer.removeAttribute('hidden');
    answer.style.maxHeight = '0';

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all others */
      qsa('.faq-q[aria-expanded="true"]').forEach(other => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        const otherAnswer = other.closest('.faq-item').querySelector('.faq-a');
        if (otherAnswer) {
          otherAnswer.classList.remove('open');
          otherAnswer.style.maxHeight = '0';
        }
      });

      /* Toggle this one */
      btn.setAttribute('aria-expanded', !isOpen);
      answer.classList.toggle('open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : '0';
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });

  /* ============================================================
     7. SMOOTH SCROLL
     ============================================================ */
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href').slice(1);
      const el  = qs(`#${id}`);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     8. MARQUEE — pause on hover
     ============================================================ */
  const marqueeTrack = qs('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => marqueeTrack.style.animationPlayState = 'paused');
    marqueeTrack.addEventListener('mouseleave', () => marqueeTrack.style.animationPlayState = 'running');
  }

  /* ============================================================
     9. TASK CARD — quick pulse on hover (accessibility-safe)
     ============================================================ */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    qsa('.task-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s';
      });
    });
  }

  /* ============================================================
     10. ACTIVE NAV LINK — section spy
     ============================================================ */
  const navLinks = qsa('.nav-link');
  const sectionIds = ['tasks', 'how-it-works', 'pricing', 'faq'];

  const sectionSpy = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--black)' : '';
        });
      });
    },
    { threshold: 0.4 }
  );

  sectionIds.forEach(id => {
    const el = qs(`#${id}`);
    if (el) sectionSpy.observe(el);
  });

  /* ============================================================
     11. STRIPE LINKS — ensure they open correctly
         (update with real Stripe payment links before going live)
     ============================================================ */
  qsa('a[href^="https://buy.stripe.com"]').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

})();
