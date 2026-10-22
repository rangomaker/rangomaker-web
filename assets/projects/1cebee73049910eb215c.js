
'use strict';
const $=selector=>document.querySelector(selector), $$=selector=>[...document.querySelectorAll(selector)];
let language='es', medium=0, story=1, galleryIndex=0;
const L=(es,en)=>language==='es'?es:en;
const translations=$$('[data-en]').map(node=>({node,es:node.innerHTML,en:node.dataset.en}));
const labels=$$('[data-label-en]').map(node=>({node,es:node.getAttribute('aria-label'),en:node.dataset.labelEn}));
const altLabels=$$('[data-alt-en]').map(node=>({node,es:node.getAttribute('alt'),en:node.dataset.altEn}));
const comparisons=$$('[data-comparison]');
function renderComparison(example){
 const frame=example.querySelector('.compare-frame'),range=example.querySelector('.compare-range'),value=Number(range.value);
 frame.style.setProperty('--split',value+'%');
 range.setAttribute('aria-valuetext',L(value+'% original, '+(100-value)+'% recorte',value+'% original, '+(100-value)+'% cutout'));
 const mode=example.dataset.mode;
 example.querySelector('[data-result-label]').textContent=mode==='ultra'?'Ultra':L('Borrador de fondos','Background Eraser');
 example.querySelector('.compare-badge.before').hidden=value<17;
 example.querySelector('.compare-badge.after').hidden=value>83;
}
comparisons.forEach(example=>{
 const frame=example.querySelector('.compare-frame'),range=example.querySelector('.compare-range');
 range.addEventListener('input',()=>renderComparison(example));
 function positionFromPointer(event){const bounds=frame.getBoundingClientRect();range.value=String(Math.round(Math.max(0,Math.min(100,(event.clientX-bounds.left)/bounds.width*100))));renderComparison(example);}
 let activePointer=null;
 frame.addEventListener('pointerdown',event=>{if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;event.preventDefault();activePointer=event.pointerId;frame.setPointerCapture(event.pointerId);range.focus({preventScroll:true});positionFromPointer(event);});
 frame.addEventListener('pointermove',event=>{if(activePointer===event.pointerId)positionFromPointer(event);});
 function releasePointer(event){if(activePointer!==event.pointerId)return;activePointer=null;if(frame.hasPointerCapture(event.pointerId))frame.releasePointerCapture(event.pointerId);}
 frame.addEventListener('pointerup',releasePointer);frame.addEventListener('pointercancel',releasePointer);frame.addEventListener('lostpointercapture',()=>{activePointer=null;});
 example.querySelectorAll('[data-backdrop-choice]').forEach(button=>button.addEventListener('click',()=>{frame.dataset.backdrop=button.dataset.backdropChoice;example.querySelectorAll('[data-backdrop-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}));
});
const mediumContent=[
 {title:['La forma sigue tu idea.','Form follows your idea.'],body:['Curvas editables, formas y pinceles vectoriales. Del gesto inicial al detalle más preciso.','Editable curves, shapes and vector brushes. From the first gesture to the finest detail.'],label:['Composición vectorial de líneas orbitales','Vector composition of orbital lines']},
 {title:['La imagen toma otra atmósfera.','The image finds a new atmosphere.'],body:['Pintura con textura, efectos naturales y retoque. Dale profundidad, luz y carácter a tu imagen.','Textured painting, natural effects and retouching. Bring depth, light and character to your image.'],label:['Composición con nubes usando la punta Nube suave','Cloud composition using the Soft Cloud tip']},
 {title:['Las palabras también dibujan.','Words can draw, too.'],body:['Texto editable y composición tipográfica. Una parte de la imagen que tiene mucho que decir.','Editable text and typographic composition. A part of the image with a lot to say.'],label:['Composición tipográfica verde con grandes letras y formas de color','Green typographic composition with large lettering and colored shapes']}
];
function renderMedium(){
 $$('[data-medium]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.medium)===medium)));
 $$('[data-medium-scene]').forEach(scene=>scene.toggleAttribute('hidden',Number(scene.dataset.mediumScene)!==medium));
 $('#medium-preview').closest('.medium-stage').classList.toggle('is-type',medium===2);
 $('#medium-preview').setAttribute('preserveAspectRatio',medium===2?'xMidYMid meet':'xMidYMid slice');
 const item=mediumContent[medium],index=language==='es'?0:1;
 $('#medium-title').textContent=item.title[index];$('#medium-description').textContent=item.body[index];$('#medium-preview').setAttribute('aria-label',item.label[index]);
}
function renderStory(){
 $$('[data-story]').forEach(button=>{const active=Number(button.dataset.story)===story;button.setAttribute('aria-expanded',String(active));button.closest('.story-step').classList.toggle('active',active);button.querySelector('.step-sign').textContent=active?'−':'+';$('#'+button.getAttribute('aria-controls')).hidden=!active;});
 $$('[data-story-scene]').forEach(scene=>scene.toggleAttribute('hidden',Number(scene.dataset.storyScene)!==story));
 $('#story-caption').textContent=$(`[data-story="${story}"] h3`).textContent;
}
function renderLanguage(){
 document.documentElement.lang=language;document.title=L('Altergraph — Un lienzo. Todas tus ideas.','Altergraph — One canvas. All your ideas.')+' | Rango Maker';
 translations.forEach(item=>item.node.innerHTML=item[language]);labels.forEach(item=>item.node.setAttribute('aria-label',item[language]));altLabels.forEach(item=>item.node.setAttribute('alt',item[language]));comparisons.forEach(renderComparison);
 $('#language').textContent=language==='es'?'EN':'ES';$('#language').setAttribute('aria-label',L('Switch to English','Cambiar a español'));
 document.querySelector('meta[name="description"]').content=L('Altergraph. Un espacio para ilustrar, pintar y componer. Descubre tus ideas en píxeles, vectores y texto.','Altergraph. A workspace for illustration, painting and composition. Discover your ideas in pixels, vectors and text.');
 renderMedium();renderStory();renderGallery();
}
$('#language').addEventListener('click',()=>{language=language==='es'?'en':'es';renderLanguage();});
$$('[data-medium]').forEach(button=>button.addEventListener('click',()=>{medium=Number(button.dataset.medium);renderMedium();}));
$$('[data-story]').forEach(button=>button.addEventListener('click',()=>{story=Number(button.dataset.story);renderStory();}));
const gallery=$('#gallery');
const galleryContent=[
 {title:['Un pequeño jardín.','A small garden.'],category:['Ilustración','Illustration'],body:['De una curva a una ilustración. Formas, color y detalles con tu estilo.','From a curve to an illustration. Shapes, color and details in your own style.'],label:['Ilustración botánica de hojas verdes y flores coral sobre papel crema','Botanical illustration of green leaves and coral flowers on cream paper']},
 {title:['Última luz.','Last light.'],category:['Pintura y atmósfera','Painting and atmosphere'],body:['Construye un paisaje, explora la luz y encuentra los colores de otro lugar.','Build a landscape, explore the light and find the colors of another place.'],label:['Paisaje de dunas en tonos malva, terracota y melocotón al atardecer','Sunset dune landscape in mauve, terracotta and peach tones']},
 {title:['Fuera de línea.','Outside the line.'],category:['Cartelería','Posters'],body:['Dale protagonismo al texto. Combina tipografía y formas en una pieza que se haga ver.','Put words in the spotlight. Combine typography and shapes in a piece that stands out.'],label:['Cartel azul con tipografía grande y geometría en tonos cálidos','Blue poster with large typography and warm geometric shapes']},
 {title:['Una identidad que florece.','An identity in bloom.'],category:['Identidad visual','Visual identity'],body:['Una marca, una paleta y varias aplicaciones. Lleva una idea más allá del logotipo.','A brand, a palette and several applications. Take an idea beyond the logo.'],label:['Identidad conceptual Alba aplicada a tarjeta, cartel y papelería','Conceptual Alba identity applied to a card, poster and stationery']},
 {title:['Entre formas.','Between shapes.'],category:['Diseño editorial','Editorial design'],body:['Compón con imágenes y palabras. Encuentra el equilibrio entre lo que muestras y lo que cuentas.','Compose with images and words. Balance what you show with what you tell.'],label:['Doble página editorial con texto y composición abstracta en verde y ocre','Editorial spread with text and an abstract green and ochre composition']},
 {title:['Un ritmo de color.','A rhythm of color.'],category:['Patrones y composición','Patterns and composition'],body:['Repite, combina y cambia la escala. Las formas sencillas también tienen mucho que decir.','Repeat, combine and change the scale. Simple shapes have plenty to say, too.'],label:['Patrón de módulos geométricos en coral, azul, crema y verde','Geometric tile pattern in coral, blue, cream and green']}
];
function renderGallery(){
 const item=galleryContent[galleryIndex],index=language==='es'?0:1;
 $$('[data-gallery-slide]').forEach(scene=>scene.toggleAttribute('hidden',Number(scene.dataset.gallerySlide)!==galleryIndex));
 $$('[data-gallery-dot]').forEach(button=>button.setAttribute('aria-current',String(Number(button.dataset.galleryDot)===galleryIndex)));
 $('#gallery-title').textContent=item.title[index];$('#gallery-category').textContent=item.category[index];$('#gallery-description').textContent=item.body[index];$('#gallery-image').setAttribute('aria-label',item.label[index]);
 $('#gallery-counter').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+String(galleryContent.length).padStart(2,'0');
 gallery.setAttribute('aria-roledescription',L('carrusel','carousel'));
}
function moveGallery(direction){galleryIndex=(galleryIndex+direction+galleryContent.length)%galleryContent.length;renderGallery();}
$('#gallery-prev').addEventListener('click',()=>moveGallery(-1));$('#gallery-next').addEventListener('click',()=>moveGallery(1));
$$('[data-gallery-dot]').forEach(button=>button.addEventListener('click',()=>{galleryIndex=Number(button.dataset.galleryDot);renderGallery();}));
gallery.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveGallery(event.key==='ArrowRight'?1:-1);}else if(event.key==='Home'||event.key==='End'){event.preventDefault();galleryIndex=event.key==='Home'?0:galleryContent.length-1;renderGallery();}});
let touchStart=null;
gallery.addEventListener('touchstart',event=>{touchStart=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
gallery.addEventListener('touchend',event=>{if(!touchStart||!event.changedTouches.length)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)moveGallery(dx<0?1:-1);},{passive:true});
gallery.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('arrived');observer.unobserve(entry.target);}}),{threshold:.12});$$('.reveal').forEach(node=>observer.observe(node));}
renderLanguage();

