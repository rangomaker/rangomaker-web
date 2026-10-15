(() => {
  'use strict';
  const categories = ['Piezas funcionales', 'Props', 'Decoración', 'Organización', 'Otros'];
  const maxImageBytes = 12 * 1024 * 1024;
  const maxFileBytes = 50 * 1024 * 1024;
  const text = (value, max) => String(value ?? '').trim().slice(0, max);
  const https = value => {
    if (!value) return '';
    try { const url = new URL(value); if (url.protocol === 'https:') return url.href; } catch {}
    throw new Error('El enlace de descarga debe comenzar con https://.');
  };
  const image = value => {
    if (!value || !/^data:image\/(?:png|jpeg|webp|avif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new Error('Una imagen tiene un formato no admitido.');
    if (value.split(',')[1].length % 4 !== 0) throw new Error('Los datos de una imagen están incompletos.');
    if (value.length > Math.ceil(maxImageBytes * 4 / 3) + 100) throw new Error('Cada imagen puede pesar hasta 12 MB.');
    return value;
  };
  const validate = raw => {
    if (!raw || typeof raw !== 'object') throw new Error('La ficha no es válida.');
    const id = text(raw.id, 80);
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('Identificador de modelo no válido.');
    const title = text(raw.title, 100);
    if (!title) throw new Error('Escribe un nombre para el modelo.');
    if (!Array.isArray(raw.images) || raw.images.length > 8) throw new Error('Se admiten hasta ocho imágenes por modelo.');
    const images = raw.images.map(item => ({ name: text(item.name, 180), src: image(item.src) }));
    const status = raw.status === 'visible' ? 'visible' : 'draft';
    if (status === 'visible' && !images.length) throw new Error('Añade al menos una imagen para mostrar el modelo en el catálogo.');
    let file = null;
    if (raw.file) {
      const name = text(raw.file.name, 180).replace(/[\\/\u0000-\u001f]/g, '_');
      if (!/\.(stl|3mf|obj|zip|glb|fbx|step|stp)$/i.test(name)) throw new Error('Formato de archivo 3D no admitido.');
      if (!/^data:application\/octet-stream;base64,[A-Za-z0-9+/]+={0,2}$/.test(raw.file.src)) throw new Error('El archivo 3D no es válido.');
      if (raw.file.src.split(',')[1].length % 4 !== 0) throw new Error('Los datos del archivo 3D están incompletos.');
      const size = Math.floor((raw.file.src.split(',')[1].length * 3) / 4) - (raw.file.src.endsWith('==') ? 2 : raw.file.src.endsWith('=') ? 1 : 0);
      if (size > maxFileBytes) throw new Error('El archivo 3D puede pesar hasta 50 MB.');
      file = { name, src: raw.file.src, size };
    }
    return { id, title, description: text(raw.description, 6000), category: categories.includes(raw.category) ? raw.category : 'Otros', tags: Array.isArray(raw.tags) ? raw.tags.map(t => text(t, 30)).filter(Boolean).slice(0, 10) : [], license: text(raw.license, 240) || 'Condiciones por definir', notes: text(raw.notes, 6000), status, featured: Boolean(raw.featured), archived: Boolean(raw.archived), images, file, downloadUrl: https(raw.downloadUrl), relatedUrl: raw.relatedUrl === '../../Huskey/entregables/Huskey-Pocket.html#galeria' ? raw.relatedUrl : '', updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : Date.now() };
  };
  const backup = models => ({ format: 'rangomaker-catalog', version: 1, exportedAt: new Date().toISOString(), models: models.map(validate) });
  const readBackup = input => {
    if (!input || input.format !== 'rangomaker-catalog' || input.version !== 1 || !Array.isArray(input.models) || input.models.length > 1000) throw new Error('Este archivo no es un respaldo de catálogo compatible.');
    const models = input.models.map(validate);
    if (new Set(models.map(m => m.id)).size !== models.length) throw new Error('El respaldo contiene identificadores repetidos.');
    return models;
  };
  const seed = src => validate({ id: 'huskey-case', title: 'Carcasa de Huskey', description: 'La parte física del proyecto: una carcasa que da forma al dispositivo y reúne la pantalla, la electrónica y la batería.', category: 'Piezas funcionales', images: [{ name: 'Render de la carcasa', src }], status: 'visible', relatedUrl: '../../Huskey/entregables/Huskey-Pocket.html#galeria', updatedAt: 0 });
  const open = async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('rangomaker-catalog-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('models', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Cierra otras pestañas del panel y vuelve a abrirlo.'));
    });
    db.onversionchange = () => db.close();
    const list = () => new Promise((resolve, reject) => {
      const tx = db.transaction('models', 'readonly');
      const request = tx.objectStore('models').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const saveMany = values => {
      const models = values.map(validate);
      return new Promise((resolve, reject) => {
        const tx = db.transaction('models', 'readwrite');
        models.forEach(model => tx.objectStore('models').put(model));
        tx.oncomplete = () => resolve(models);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('No se pudo guardar el catálogo.'));
      });
    };
    return { list, saveMany, save: model => saveMany([model]), close: () => db.close() };
  };
  const node = (tag, className, content) => { const element = document.createElement(tag); if (className) element.className = className; if (content !== undefined) element.textContent = content; return element; };
  const download = (content, name, mime = 'application/json') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob); const link = node('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  const fileBlob = file => {
    const decoded = atob(file.src.split(',')[1]);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
    return new Blob([bytes], { type: 'application/octet-stream' });
  };
  window.RangoCatalog = { categories, maxImageBytes, maxFileBytes, validate, backup, readBackup, seed, open, node, download, fileBlob };
})();
