document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('#menu');
  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      menu.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // Smooth scroll for in-page links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', evt => {
      const href = anchor.getAttribute('href');
      if (!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      evt.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Initialize all carousels
  document.querySelectorAll('.carousel').forEach(initCarousel);
});

function initCarousel(root) {
  const track = root.querySelector('.carousel__track');
  const slides = Array.from(root.querySelectorAll('.carousel__slide'));
  const prevBtn = root.querySelector('.carousel__control.prev');
  const nextBtn = root.querySelector('.carousel__control.next');
  const dotsRoot = root.querySelector('.carousel__dots');

  let current = 0;
  let autoplay = root.getAttribute('data-autoplay') === 'true';
  let interval = Number(root.getAttribute('data-interval') || 5000);
  let timer = null;

  // Build dots
  if (dotsRoot) {
    dotsRoot.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsRoot.appendChild(dot);
    });
  }

  function updateUI() {
    const offset = -current * root.clientWidth;
    track.style.transform = `translate3d(${offset}px,0,0)`;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));

    if (dotsRoot) {
      Array.from(dotsRoot.children).forEach((d, i) => {
        d.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    updateUI();
    restartAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  // Keyboard navigation when carousel is focused
  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Resize handling to keep slides full width
  const onResize = () => updateUI();
  window.addEventListener('resize', onResize);

  // Autoplay
  function startAutoplay() {
    if (!autoplay) return;
    stopAutoplay();
    timer = setInterval(next, interval);
  }
  function stopAutoplay() { if (timer) { clearInterval(timer); timer = null; } }
  function restartAutoplay() { if (autoplay) { stopAutoplay(); startAutoplay(); } }

  // Pause on hover/focus
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  // Touch / swipe support
  let startX = 0; let isDragging = false;
  root.addEventListener('pointerdown', (e) => {
    isDragging = true; startX = e.clientX; root.setPointerCapture(e.pointerId);
    stopAutoplay();
  });
  root.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const base = -current * root.clientWidth;
    track.style.transform = `translate3d(${base + dx}px,0,0)`;
  });
  root.addEventListener('pointerup', (e) => {
    if (!isDragging) return; isDragging = false; root.releasePointerCapture(e.pointerId);
    const dx = e.clientX - startX;
    const threshold = root.clientWidth * 0.2;
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
    else updateUI();
    startAutoplay();
  });

  // Initial state
  updateUI();
  startAutoplay();
}