(() => {
  'use strict';
  const source=document.currentScript,website=source?.dataset.websiteId,page=source?.dataset.rmAnalyticsPage;
  const allowed=['rangomaker.com','www.rangomaker.com'];
  // Local previews, embedded canvases and privacy preferences never load Umami.
  if(!website||!page||!allowed.includes(location.hostname)||location.protocol!=='https:'||window.top!==window.self||document.documentElement.classList.contains('design-editing')||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true||window.__rmAnalytics)return;
  window.__rmAnalytics=true;
  const labels=new WeakMap(),publicLabels=new Set();
  const labelOf=node=>(node.textContent.trim()||node.getAttribute('aria-label')||node.getAttribute('title')||'Enlace').replace(/\s+/g,' ').slice(0,80);
  function eligible(node){return !node.closest('form,[contenteditable],input,textarea,select,[data-analytics-ignore]')&&!node.matches('[disabled],[aria-disabled="true"]')&&!(node.matches('a')&&(!node.getAttribute('href')||/^(?:javascript:|data:)/i.test(node.getAttribute('href'))));}
  // Freeze public interface labels before any visitor interaction. Never read
  // inputs, destinations, document titles, URL queries or referrers for events.
  for(const node of document.querySelectorAll('a[href],button')){
    if(!eligible(node))continue;
    const label=labelOf(node);labels.set(node,label);publicLabels.add(label);
  }
  const pending=[];let ready=false;
  function send(name,label){
    const payload={website,hostname:location.hostname,url:page,...(name?{name,data:{boton:label}}:{})};
    if(!ready){if(pending.length<20)pending.push(payload);return;}
    // Analytics failures must never interrupt or delay navigation.
    try{Promise.resolve(window.umami.track(payload)).catch(()=>{});}catch{}
  }
  send();
  document.addEventListener('click',event=>{
    const node=event.target.closest?.('a[href],button');
    if(!node||!eligible(node))return;
    // Catalog filtering can recreate a link. Accept only labels already present
    // in the public interface, never new text derived from visitor input.
    const label=labels.get(node)||(publicLabels.has(labelOf(node))?labelOf(node):null);
    if(label)send('Clic',label);
  },{capture:true,passive:true});
  const tracker=document.createElement('script');tracker.src='https://cloud.umami.is/script.js';tracker.async=true;
  tracker.dataset.websiteId=website;tracker.dataset.autoTrack='false';tracker.dataset.doNotTrack='true';tracker.dataset.excludeSearch='true';tracker.dataset.excludeHash='true';
  tracker.referrerPolicy='no-referrer';
  tracker.onload=()=>{if(typeof window.umami?.track!=='function')return;ready=true;for(const payload of pending.splice(0)){try{Promise.resolve(window.umami.track(payload)).catch(()=>{});}catch{}}};
  tracker.onerror=()=>pending.splice(0);
  document.head.append(tracker);
})();
