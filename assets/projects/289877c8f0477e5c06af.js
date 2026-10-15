(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const notesDisclosure = $('#notes-disclosure');
  function revealNote(hash) {
    const note = hash.startsWith('#nota-') ? document.getElementById(hash.slice(1)) : null;
    if (!note || !notesDisclosure.contains(note)) return null;
    notesDisclosure.open = true;
    return note;
  }
  function openNoteFromHash() {
    const note = revealNote(location.hash);
    if (note) requestAnimationFrame(() => note.scrollIntoView({block: 'start'}));
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#nota-"]');
    if (link) revealNote(link.getAttribute('href'));
  });
  window.addEventListener('hashchange', openNoteFromHash);
  openNoteFromHash();
  const galleryCards = $$('.gallery-card');
  const galleryColors = $$('[data-gallery-color]');
  const galleryDialog = $('#gallery-dialog');
  const galleryTrack = $('#gallery-track');
  const galleryRailPrev = $('#gallery-rail-prev');
  const galleryRailNext = $('#gallery-rail-next');
  let visibleGallery = galleryCards.filter(card => !card.hidden);
  let galleryIndex = 0;
  let previousOverflow = '';
  let galleryRailFrame = null;
  function updateGalleryRail() {
    const bounds = galleryTrack.getBoundingClientRect();
    const visibleIndexes = [];
    visibleGallery.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      if (center >= bounds.left && center <= bounds.right) visibleIndexes.push(index);
    });
    if (visibleIndexes.length) {
      const first = visibleIndexes[0] + 1;
      const last = visibleIndexes[visibleIndexes.length - 1] + 1;
      const label = (first === last ? first : first + '–' + last) + ' / ' + visibleGallery.length;
      if ($('#gallery-range').textContent !== label) $('#gallery-range').textContent = label;
    }
    galleryRailPrev.disabled = galleryTrack.scrollLeft <= 2;
    galleryRailNext.disabled = galleryTrack.scrollLeft + galleryTrack.clientWidth >= galleryTrack.scrollWidth - 2;
    $('.gallery-rail-controls').hidden = false;
  }
  function scheduleGalleryRail() {
    if (galleryRailFrame !== null) return;
    galleryRailFrame = requestAnimationFrame(() => {
      galleryRailFrame = null;
      updateGalleryRail();
    });
  }
  function moveGalleryRail(direction, oneImage = false) {
    const gap = parseFloat(getComputedStyle(galleryTrack).columnGap);
    const step = visibleGallery[0].getBoundingClientRect().width + gap;
    const amount = oneImage ? 1 : Math.max(1, Math.floor((galleryTrack.clientWidth + gap) / step));
    galleryTrack.scrollBy({left: direction * amount * step, behavior: reduced.matches ? 'auto' : 'smooth'});
  }
  galleryRailPrev.addEventListener('click', () => moveGalleryRail(-1));
  galleryRailNext.addEventListener('click', () => moveGalleryRail(1));
  galleryTrack.addEventListener('scroll', scheduleGalleryRail, {passive: true});
  galleryTrack.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveGalleryRail(event.key === 'ArrowRight' ? 1 : -1, true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      galleryTrack.scrollTo({left: event.key === 'Home' ? 0 : galleryTrack.scrollWidth, behavior: reduced.matches ? 'auto' : 'smooth'});
    }
  });
  new ResizeObserver(scheduleGalleryRail).observe(galleryTrack);
  function showGalleryImage(index) {
    galleryIndex = (index + visibleGallery.length) % visibleGallery.length;
    const card = visibleGallery[galleryIndex];
    const thumbnail = card.querySelector('img');
    $('#gallery-full-image').src = thumbnail.currentSrc || thumbnail.src;
    $('#gallery-full-image').alt = thumbnail.alt;
    $('#gallery-view-title').textContent = card.querySelector('figcaption').textContent;
    $('#gallery-position').textContent = (galleryIndex + 1) + ' / ' + visibleGallery.length;
    $('#gallery-prev').disabled = $('#gallery-next').disabled = visibleGallery.length < 2;
  }
  function selectGalleryColor(color) {
    galleryCards.forEach(card => { card.hidden = card.dataset.galleryKind !== color; });
    visibleGallery = galleryCards.filter(card => !card.hidden);
    galleryTrack.dataset.filter = color;
    galleryTrack.scrollTo({left: 0, behavior: 'auto'});
    scheduleGalleryRail();
    galleryColors.forEach(button => {
      const active = button.dataset.galleryColor === color;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('#gallery-total').textContent = visibleGallery.length + ' imágenes';
  }
  galleryColors.forEach(button => button.addEventListener('click', () => selectGalleryColor(button.dataset.galleryColor)));
  galleryCards.forEach(card => card.querySelector('button').addEventListener('click', () => {
    showGalleryImage(visibleGallery.indexOf(card));
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    galleryDialog.showModal();
  }));
  $('#gallery-prev').addEventListener('click', () => showGalleryImage(galleryIndex - 1));
  $('#gallery-next').addEventListener('click', () => showGalleryImage(galleryIndex + 1));
  galleryDialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showGalleryImage(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
  galleryDialog.addEventListener('click', event => {
    const bounds = galleryDialog.getBoundingClientRect();
    if (event.target === galleryDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) galleryDialog.close();
  });
  galleryDialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    $('#gallery-full-image').removeAttribute('src');
  });
  $('.gallery-toolbar').hidden = false;
  scheduleGalleryRail();
  const indexMenu = $('.nav-index');
  indexMenu.addEventListener('click', event => {
    if (event.target.closest('a')) indexMenu.open = false;
  });
  document.addEventListener('click', event => {
    if (!indexMenu.contains(event.target)) indexMenu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && indexMenu.open) {
      indexMenu.open = false;
      indexMenu.querySelector('summary').focus();
    }
  });
  const productAssets = {
  "gray-three-quarter": __huskeyCaptured["assets/huskey-gray-three-quarter.webp"],
  "gray-front": __huskeyCaptured["assets/huskey-gray-front.webp"],
  "gray-side": __huskeyCaptured["assets/huskey-gray-side.webp"],
  "gray-detail": __huskeyCaptured["assets/huskey-gray-detail.webp"],
  "black-three-quarter": __huskeyCaptured["assets/huskey-black-three-quarter.webp"],
  "black-front": __huskeyCaptured["assets/huskey-black-front.webp"],
  "black-side": __huskeyCaptured["assets/huskey-black-side.webp"],
  "black-detail": __huskeyCaptured["assets/huskey-black-detail.webp"],
  "list-dark": __huskeyCaptured["assets/ui-hd/list-dark.webp"],
  "list-light": __huskeyCaptured["assets/ui-hd/list-light.webp"],
  "detail-dark": __huskeyCaptured["assets/ui-hd/detail-dark.webp"],
  "detail-light": __huskeyCaptured["assets/ui-hd/detail-light.webp"],
  "generator-dark": __huskeyCaptured["assets/ui-hd/generator-dark.webp"],
  "generator-light": __huskeyCaptured["assets/ui-hd/generator-light.webp"],
  "totp-setup-dark": __huskeyCaptured["assets/ui-hd/totp-setup-dark.webp"],
  "totp-setup-light": __huskeyCaptured["assets/ui-hd/totp-setup-light.webp"],
  "backup-dark": __huskeyCaptured["assets/ui-hd/backup-dark.webp"],
  "backup-light": __huskeyCaptured["assets/ui-hd/backup-light.webp"],
  "appearance-dark": __huskeyCaptured["assets/ui-hd/appearance-dark.webp"],
  "appearance-light": __huskeyCaptured["assets/ui-hd/appearance-light.webp"],
  "pin-dark": __huskeyCaptured["assets/ui-hd/pin-dark.webp"],
  "pin-light": __huskeyCaptured["assets/ui-hd/pin-light.webp"],
  "decoy-dark": __huskeyCaptured["assets/ui-hd/decoy-dark.webp"],
  "decoy-light": __huskeyCaptured["assets/ui-hd/decoy-light.webp"],
  "snatch-dark": __huskeyCaptured["assets/ui-hd/snatch-dark.webp"],
  "snatch-light": __huskeyCaptured["assets/ui-hd/snatch-light.webp"],
  "lost-dark": __huskeyCaptured["assets/ui-hd/lost-dark.webp"],
  "lost-light": __huskeyCaptured["assets/ui-hd/lost-light.webp"],
  "qr-dark": __huskeyCaptured["assets/ui-hd/qr-dark.webp"],
  "qr-light": __huskeyCaptured["assets/ui-hd/qr-light.webp"],
  "lock-dark": __huskeyCaptured["assets/ui-hd/lock-dark.webp"],
  "lock-light": __huskeyCaptured["assets/ui-hd/lock-light.webp"]
};
  $$('[data-ui-theme]').forEach(b=>b.addEventListener('click',()=>{
    const theme=b.dataset.uiTheme;
    $$('[data-ui-theme]').forEach(item=>{const active=item===b;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    $$('[data-ui]').forEach(img=>{img.src=productAssets[img.dataset.ui+'-'+theme];img.alt=img.alt.replace(/tema (oscuro|claro)/,'tema '+(theme==='dark'?'oscuro':'claro'));});
  }));
  const track = $('#feature-track');
  const slides = $$('.feature-slide');
  const dots = $$('[data-feature-index]');
  const carousel = $('.feature-carousel');
  const pauseButton = $('#feature-pause');
  const interval = 7500;
  let activeFeature = 0;
  let paused = reduced.matches;
  let inView = false;
  let autoplayTimer = null;
  function scheduleAutoplay() {
    clearTimeout(autoplayTimer);
    if (paused || !inView || document.hidden) return;
    autoplayTimer = setTimeout(() => goToFeature(activeFeature + 1), interval);
  }
  function updatePlayback() {
    pauseButton.textContent = paused ? '▶ Reanudar' : 'Ⅱ Pausar';
    pauseButton.setAttribute('aria-label', paused ? 'Reanudar carrusel automático' : 'Pausar carrusel automático');
    pauseButton.setAttribute('aria-pressed', String(paused));
    $('#feature-count').setAttribute('aria-live', paused ? 'polite' : 'off');
    scheduleAutoplay();
  }
  function updateFeature(index) {
    activeFeature = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
      slide.inert = i !== index;
    });
    $('#feature-count').textContent = String(index + 1).padStart(2, '0') + ' / ' + slides.length;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-pressed', String(i === index));
    });
  }
  function goToFeature(index) {
    index = (index + slides.length) % slides.length;
    updateFeature(index);
    scheduleAutoplay();
  }
  pauseButton.addEventListener('click', () => { paused = !paused; updatePlayback(); });
  $('#feature-prev').addEventListener('click', () => goToFeature(activeFeature - 1));
  $('#feature-next').addEventListener('click', () => goToFeature(activeFeature + 1));
  dots.forEach(dot => dot.addEventListener('click', () => goToFeature(Number(dot.dataset.featureIndex))));
  track.addEventListener('keydown', event => {
    const indexes = {ArrowLeft: activeFeature - 1, ArrowRight: activeFeature + 1, Home: 0, End: slides.length - 1};
    if (!(event.key in indexes)) return;
    event.preventDefault();
    goToFeature(indexes[event.key]);
  });
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    scheduleAutoplay();
  }, {threshold:0}).observe(carousel);
  document.addEventListener('visibilitychange', scheduleAutoplay);
  reduced.addEventListener('change', event => { paused = event.matches; updatePlayback(); });
  carousel.classList.add('is-enhanced');
  $('.carousel-controls').hidden = false;
  updateFeature(0);
  updatePlayback();
})();
