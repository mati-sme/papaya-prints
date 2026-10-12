/* ==========================================================
   PLACEHOLDER CONFIG: replace before going live.
   This is the ONLY place the WhatsApp number and Instagram
   handle live. All wa.me links on the page are built from it.
   ========================================================== */
const CONFIG = {
  whatsapp: '972500000000', /* PLACEHOLDER – replace with the real number, digits only, with country code */
  instagram: 'https://instagram.com/PLACEHOLDER' /* PLACEHOLDER – replace with the real profile URL */
};

const MESSAGES = {
  general: 'היי, אשמח להזמין הדפסה בהתאמה אישית. מצרף/ת תמונה ומידות.',
  custom: 'היי, יש לי חלק שאני צריך/ה לתכנן ולהדפיס. מצרף/ת תמונה ומידות.',
  product: (name) => 'היי, אשמח להזמין: ' + name
};

function waLink(text) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text);
}

function setExternal(el, href) {
  el.href = href;
  el.target = '_blank';
  el.rel = 'noopener';
}

(function init() {
  /* WhatsApp: general / custom messages */
  document.querySelectorAll('[data-wa]').forEach((el) => {
    const text = MESSAGES[el.dataset.wa] || MESSAGES.general;
    setExternal(el, waLink(text));
  });

  /* WhatsApp: per-product, pre-filled with the product name */
  document.querySelectorAll('[data-wa-product]').forEach((el) => {
    setExternal(el, waLink(MESSAGES.product(el.dataset.waProduct)));
  });

  /* Instagram */
  document.querySelectorAll('[data-instagram]').forEach((el) => setExternal(el, CONFIG.instagram));

  /* Footer year */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile nav */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* Subtle reveal for product cards and steps, played once */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const items = document.querySelectorAll('.card, .step, .mat');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('in');
          io.unobserve(el);
          /* drop the stagger delay so hover transitions stay instant */
          setTimeout(() => { el.style.transitionDelay = ''; }, 600);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 50 + 'ms';
      io.observe(el);
    });
  }
})();
