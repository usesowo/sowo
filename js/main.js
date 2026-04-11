/* ═══════════════════════════════
   SOWO — MAIN JS v2.0
═══════════════════════════════ */

// ── NAV SCROLL ──
const nav = document.getElementById('sowo-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── FOLLOW BUTTONS ──
document.querySelectorAll('.pc-follow').forEach(btn => {
  btn.addEventListener('click', () => {
    const on = btn.classList.toggle('on');
    btn.textContent = on ? 'Following ✓' : 'Follow';
  });
});

// ── FILTER CHIPS ──
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('on'));
});

// ── SEARCH HERO CHIPS ──
document.querySelectorAll('.hs-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.hs-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// ── STAT COUNTER ANIMATION ──
function animateValue(el, end, duration = 1600) {
  let start = null;
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const value = Math.floor(ease * end);
    el.textContent = prefix + (value >= 1000 ? (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k' : value) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + (end >= 1000 ? (end / 1000) + 'k' : end) + suffix;
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.count);
      if (target) animateValue(e.target, target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ── MARQUEE DUPLICATE ──
// Duplicates marquee content for seamless loop
const track = document.querySelector('.marquee-track');
if (track) {
  const clone = track.innerHTML;
  track.innerHTML = clone + clone;
}
