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
})();
