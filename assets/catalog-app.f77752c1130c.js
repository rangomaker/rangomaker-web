(() => {
  'use strict';
  const C = window.RangoCatalog;
  const grid = document.getElementById('catalog-grid');
  const search = document.getElementById('catalog-search');
  const category = document.getElementById('catalog-category');
  const empty = document.getElementById('catalog-empty');
  const dialog = document.getElementById('model-dialog');
  const builtInCards = [...grid.querySelectorAll('[data-collection-card], [data-catalog-card]')];
  let models = [], current = null, previousOverflow = '';
  const visible = model => model.status === 'visible' && !model.archived;
  const caseRoute = document.body.dataset.caseRoute || '#pieza-carcasa-huskey';
  const defaultCaseImage = document.getElementById('huskey-case-image').src;
  const syncCase = () => {
    const model = models.find(item => item.id === 'huskey-case' && visible(item));
    if (!model) return;
    // Refresh an unchanged seed from older browser storage without overwriting saved edits.
    if (model.updatedAt === 0) model.images = [{ ...model.images[0], name: 'Vista frontal en perspectiva', src: defaultCaseImage }];
    document.getElementById('huskey-case-image').src = model.images[0].src;
    document.getElementById('huskey-case-description').textContent = model.description;
  };
  const showImage = index => {
    const image = current.images[index]; if (!image) return;
    const main = document.getElementById('model-detail-image'); main.src = image.src; main.alt = `${current.title}, imagen ${index + 1}`;
    document.querySelectorAll('#model-thumbnails button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  };
  const openModel = id => {
    const model = models.find(item => item.id === id && visible(item)); if (!model) return;
    if (id === 'huskey-case') { syncCase(); if (caseRoute.startsWith('#')) location.hash = caseRoute; else location.assign(caseRoute); return; }
    current = model;
    document.getElementById('model-detail-title').textContent = model.title;
    document.getElementById('model-detail-category').textContent = model.category;
    document.getElementById('model-detail-description').textContent = model.description;
    document.getElementById('model-detail-license').textContent = model.license;
    document.getElementById('model-detail-notes').textContent = model.notes;
    document.getElementById('model-notes-block').hidden = !model.notes;
    const thumbs = document.getElementById('model-thumbnails'); thumbs.replaceChildren();
    model.images.forEach((image, index) => { const button = C.node('button'); button.type = 'button'; button.setAttribute('aria-label', `Ver imagen ${index + 1} de ${model.title}`); const img = C.node('img'); img.src = image.src; img.alt = ''; button.append(img); button.addEventListener('click', () => showImage(index)); thumbs.append(button); });
    thumbs.hidden = model.images.length < 2; showImage(0);
    const actions = document.getElementById('model-detail-actions'); actions.replaceChildren();
    if (model.file) { const button = C.node('button', 'solid-link', `Descargar ${model.file.name.split('.').pop().toUpperCase()} ↓`); button.type = 'button'; button.addEventListener('click', () => C.download(C.fileBlob(model.file), model.file.name)); actions.append(button); }
    else if (model.downloadUrl) { const link = C.node('a', 'solid-link', 'Ir a la descarga ↗'); link.href = model.downloadUrl; link.target = '_blank'; link.rel = 'noopener'; actions.append(link); }
    else actions.append(C.node('p', 'model-availability', 'Archivo de descarga aún no publicado.'));
    if (model.relatedUrl) { const link = C.node('a', 'text-link', 'Explorar el proyecto ↗'); link.href = model.relatedUrl; actions.append(link); }
    if (!dialog.open) { previousOverflow = document.body.style.overflow; dialog.showModal(); document.body.style.overflow = 'hidden'; }
  };
  const render = () => {
    const query = search.value.trim().toLocaleLowerCase('es');
    const filtered = models.filter(visible).filter(model => (!category.value || model.category === category.value) && `${model.title} ${model.description} ${model.tags.join(' ')}`.toLocaleLowerCase('es').includes(query));
    const filteredBuiltInCards = builtInCards.filter(card => (!category.value || card.dataset.category === category.value) && card.dataset.search.toLocaleLowerCase('es').includes(query));
    grid.replaceChildren(...filteredBuiltInCards);
    filtered.forEach(model => {
      const card = C.node('article', 'catalog-card'); card.id = `modelo-${model.id}`;
      const isCase = model.id === 'huskey-case';
      const media = C.node(isCase ? 'a' : 'div', 'catalog-card-media');
      if (isCase) { media.href = caseRoute; media.setAttribute('aria-label', 'Ver la carcasa de Huskey'); }
      const img = C.node('img'); img.src = model.images[0].src; img.alt = model.title; img.loading = 'lazy'; img.decoding = 'async';
      if (model.images[0].srcset) { img.srcset = model.images[0].srcset; img.sizes = model.images[0].sizes; }
      media.append(img); card.append(media);
      const copy = C.node('div', 'catalog-card-copy'); copy.append(C.node('span', 'section-label', model.category), C.node('h2', '', model.title), C.node('p', '', model.description.length > 180 ? model.description.slice(0, 177) + '…' : model.description));
      const button = C.node(isCase ? 'a' : 'button', 'text-link'); button.append(document.createTextNode('Ver modelo '),C.node('span','','↗')); button.setAttribute('aria-label', `Ver modelo ${model.title}`);
      if (isCase) button.href = caseRoute;
      else { button.type = 'button'; button.addEventListener('click', () => openModel(model.id)); }
      copy.append(button); card.append(copy); grid.append(card);
    });
    const count = filtered.length + filteredBuiltInCards.length;
    empty.hidden = count !== 0;
    document.getElementById('catalog-results').textContent = `${count} ${count === 1 ? 'entrada' : 'entradas'}`;
  };
  const refreshNews = () => {
    const selected = models.filter(model => visible(model) && model.featured).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 1);
    if (!selected.length) return;
    document.getElementById('default-model-news').hidden = true;
    const container = document.querySelector('.home-model-spotlight');
    selected.forEach(model => {
      const target = model.id === 'huskey-case' ? caseRoute : `#modelo-${model.id}`;
      const article = C.node('article', 'home-model-showcase');
      const copy = C.node('div', 'home-model-copy'); copy.append(C.node('p', 'home-eyebrow', model.category), C.node('h3', '', model.title), C.node('p', '', model.description.slice(0, 240)));
      const link = C.node('a', 'text-link'); link.href = target; link.append(document.createTextNode('Ver modelo '), C.node('span', '', '↗')); link.lastChild.setAttribute('aria-hidden', 'true'); copy.append(link); article.append(copy);
      const media = C.node('a', 'home-model-media home-model-media--catalog'); media.href = target; media.setAttribute('aria-label', `Ver modelo ${model.title}`);
      const image = C.node('img'); image.src = model.images[0].src; image.alt = model.title; image.loading = 'lazy'; image.decoding = 'async';
      if (model.images[0].srcset) { image.srcset = model.images[0].srcset; image.sizes = model.images[0].sizes; }
      media.append(image); article.append(media); container.prepend(article);
    });
  };
  search.addEventListener('input', render); category.addEventListener('change', render);
  document.getElementById('model-detail-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; if (location.hash.startsWith('#modelo-')) history.replaceState(null, '', '#modelos-3d'); });
  const fromHash = () => { if (location.hash.startsWith('#modelo-')) { let id; try { id = decodeURIComponent(location.hash.slice(8)); } catch { return; } openModel(id); } };
  window.addEventListener('hashchange', fromHash);
  (async () => {
    try {
      const embedded = JSON.parse(document.getElementById('catalog-data').textContent);
      if (embedded.public) models = embedded.models;
      else if (embedded.snapshot) models = C.readBackup(embedded);
      else {
        try { const store = await C.open(); models = (await store.list()).map(C.validate); store.close(); } catch {}
        if (!models.length) { let src = document.querySelector('[data-catalog-seed]').src; if (!src.startsWith('data:')) { const blob = await (await fetch(src)).blob(); src = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); }); } models = [C.seed(src)]; }
      }
      syncCase(); render(); refreshNews(); document.getElementById('catalog-tools').hidden = false;
      if (location.hash.startsWith('#modelo-')) window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch { document.getElementById('catalog-results').textContent = 'El catálogo no pudo cargarse.'; }
  })();
})();
