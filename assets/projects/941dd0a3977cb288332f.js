(() => {
  'use strict';
  const bank = document.getElementById('embedded-media');
  if (!bank) return;
  const media = JSON.parse(bank.textContent);
  document.querySelectorAll('[data-media]').forEach(image => {
    const source = media[image.dataset.media];
    if (source) image.src = source;
  });
})();

const __huskeyCaptured={};