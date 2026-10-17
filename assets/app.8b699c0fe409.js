(() => {
  'use strict';
  const pages = [...document.querySelectorAll('[data-page]')];
  const header = document.querySelector('.header');
  const navigation = document.getElementById('site-navigation');
  const menu = document.querySelector('.nav-toggle');
  const titles = { inicio: 'Diseño, electrónica y software', productos: 'Productos', 'modelos-3d': 'Modelos 3D', 'coleccion-scorpio': 'Scorpio / The Division 2', taller: 'El taller', 'sobre-mi': 'Sobre mí' };
  let activePage = pages[0];
  header.classList.add('enhanced');
  menu.hidden = false;
  const closeMenu = () => {
    header.classList.remove('nav-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menú');
  };
  menu.addEventListener('click', event => {
    const open = header.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open && event.detail === 0) (navigation.querySelector('[aria-current="page"]') || navigation.querySelector('a')).focus();
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) { closeMenu(); menu.focus(); }
  });
  header.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    closeMenu();
    if (link.getAttribute('href')?.startsWith('#') && link.hash === location.hash) {
      event.preventDefault();
      showPage();
    }
  });
  const showPage = (initial = false) => {
    let id = 'inicio';
    try { id = decodeURIComponent(location.hash.slice(1)) || document.body.dataset.initialPage || 'inicio'; } catch {}
    const target = document.getElementById(id);
    const page = id.startsWith('modelo-') ? document.getElementById('modelos-3d') : target?.closest('[data-page]') || (id === 'contenido' ? activePage : pages[0]);
    const changed = page !== activePage;
    pages.forEach(item => { item.hidden = item !== page; });
    activePage = page;
    navigation.querySelectorAll('a').forEach(link => {
      const key = page.dataset.nav || (page.id.startsWith('coleccion-') ? 'modelos-3d' : page.id);
      if (link.hash === `#${key}` || link.dataset.navTarget === key) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = `Rango Maker — ${page.dataset.title || titles[page.id] || 'El taller'}`;
    closeMenu();
    if (!initial) {
      if (changed || target === page) window.scrollTo({ top: 0, behavior: 'instant' });
      if (changed || target === page) page.querySelector('h1, [data-design-text-type], h2, [tabindex]')?.focus({ preventScroll: true });
    }
  };
  window.addEventListener('hashchange', () => showPage());
  showPage(true);

  document.querySelector('.skip').addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'instant' });
    activePage.querySelector('h1')?.focus({ preventScroll: true });
  });

  document.querySelector('.back-top').addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    activePage.querySelector('h1')?.focus({ preventScroll: true });
  });

  const viewSwitch = document.querySelector('.view-switch');
  viewSwitch.hidden = false;
  viewSwitch.addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    viewSwitch.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('huskey-render').hidden = button.dataset.view !== 'assembled';
    document.getElementById('huskey-exploded').hidden = button.dataset.view !== 'exploded';
  });

  const dialog = document.getElementById('zero-dialog');
  const openers = document.querySelectorAll('[data-zero-open]');
  const fallback = document.getElementById('zerodialer-info');
  let previousOverflow = '';
  if (typeof dialog.showModal === 'function') {
    fallback.classList.add('enhanced');
    openers.forEach(open => open.addEventListener('click', event => {
      event.preventDefault();
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    }));
    dialog.querySelectorAll('.close-dialog, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
  }

  // Animate only the public presentation. Editing remains still and selectable.
  const makerStage = document.querySelector('[data-maker-stage]');
  if (makerStage) {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let observer, frame = 0, x = 0, y = 0, paused = false;
    const motionToggle = makerStage.querySelector('.maker-motion-toggle');
    const editing = () => document.body.classList.contains('design-editing');
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      makerStage.style.removeProperty('--maker-x'); makerStage.style.removeProperty('--maker-y');
    };
    const configure = () => {
      observer?.disconnect(); reset();
      if (motionToggle) motionToggle.hidden = motion.matches;
      if (motion.matches || paused) { delete document.documentElement.dataset.makerMotion; return; }
      document.documentElement.dataset.makerMotion = 'ready';
      if (!('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('maker-visible'); observer.unobserve(entry.target); }
      }), { threshold: .06 });
      document.querySelectorAll('.home-page>[data-design-instance],.home-page>[data-design-section]').forEach(section => {
        if (section.contains(makerStage)) return;
        section.classList.add('maker-reveal'); observer.observe(section);
      });
    };
    configure(); motion.addEventListener('change', configure);
    motionToggle?.addEventListener('click', () => {
      paused = !paused; motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.setAttribute('aria-label', paused ? 'Reproducir animación' : 'Pausar animación'); configure();
    });
    makerStage.addEventListener('pointermove', event => {
      if (motion.matches || paused || !finePointer.matches || editing()) return;
      const bounds = makerStage.getBoundingClientRect();
      x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 20;
      y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 15;
      if (!frame) frame = requestAnimationFrame(() => {
        makerStage.style.setProperty('--maker-x', String(x)); makerStage.style.setProperty('--maker-y', String(y)); frame = 0;
      });
    });
    makerStage.addEventListener('pointerleave', reset);
    new MutationObserver(() => { if (editing()) reset(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

})();
