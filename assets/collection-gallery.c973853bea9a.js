(() => {
  'use strict';
  const dialog = document.getElementById('collection-render-dialog');
  const image = document.getElementById('collection-render-image');
  const caption = document.getElementById('collection-render-caption');
  const position = document.getElementById('collection-render-position');
  let items = [], index = 0, origin = null, previousOverflow = '';
  const show = step => {
    index = (step + items.length) % items.length;
    const button = items[index];
    image.src = button.querySelector('img').dataset.fullSrc || button.querySelector('img').src;
    image.alt = button.dataset.renderLabel;
    caption.textContent = button.dataset.renderLabel;
    position.textContent = `${index + 1} / ${items.length}`;
  };
  document.querySelectorAll('[data-render-open]').forEach(button => button.addEventListener('click', () => {
    items = [...button.closest('[data-page]').querySelectorAll('[data-render-open]')];
    dialog.querySelector('.render-dialog-controls').hidden = items.length < 2;
    origin = button; show(items.indexOf(button));
    previousOverflow = document.body.style.overflow;
    dialog.showModal(); document.body.style.overflow = 'hidden';
  }));
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  document.getElementById('collection-render-prev').addEventListener('click', () => show(index-1));
  document.getElementById('collection-render-next').addEventListener('click', () => show(index+1));
  dialog.addEventListener('keydown', event => {
    if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(index+(event.key === 'ArrowLeft' ? -1 : 1)); }
  });
  dialog.addEventListener('click', event => {
    if(event.target !== dialog) return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow=previousOverflow; origin?.focus({preventScroll:true}); });
})();
