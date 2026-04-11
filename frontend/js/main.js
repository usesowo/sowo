// ── NAV SCROLL EFFECT ──
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  // update logo arc color when scrolled
  const arc1 = document.getElementById('arc1');
  const dotInner = document.getElementById('dot-inner');
  if (arc1) arc1.setAttribute('stroke', window.scrollY > 40 ? '#0A0A0A' : 'white');
  if (dotInner) dotInner.setAttribute('fill', window.scrollY > 40 ? '#FFFFFF' : '#0A0A0A');
}, {passive:true});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => observer.observe(el));

// ── SEARCH CHIPS ──
document.querySelectorAll('.hs-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.hs-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// ── FILTER CHIPS ──
function toggleChip(chip) {
  chip.classList.toggle('on');
}

// ── FOLLOW BUTTONS ──
document.querySelectorAll('.pc-follow-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('following')) {
      btn.classList.remove('following');
      btn.textContent = 'Follow';
    } else {
      btn.classList.add('following');
      btn.textContent = 'Following ✓';
    }
  });
});

// ── ANIMATED COUNTER (stats) ──
function animateCounter(el, target, suffix='') {
  let start = 0, duration = 1400, startTime = null;
  const isK = target >= 1000;
  function step(ts) {
    if (!startTime) startTime = ts;
    const prog = Math.min((ts - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    const val = Math.floor(ease * target);
    el.textContent = isK && target >= 1000 ? (val >= 1000 ? Math.floor(val/1000) + 'k' : val) : val;
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = isK && target >= 1000 ? Math.floor(target/1000)+'k' : target;
  }
  requestAnimationFrame(step);
}

// ── SMOOTH SEARCH INPUT ──
const inputs = document.querySelectorAll('.sui-input, .hs-input');
inputs.forEach(input => {
  input.addEventListener('focus', () => input.parentElement && input.parentElement.classList && input.parentElement.classList.add('focused'));
  input.addEventListener('blur', () => input.parentElement && input.parentElement.classList && input.parentElement.classList.remove('focused'));
});