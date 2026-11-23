const KEY = 'einkaufszettel';
let items = JSON.parse(localStorage.getItem(KEY) || '[]');

const list = document.getElementById('list');
const empty = document.getElementById('empty');
const form = document.getElementById('form');
const input = document.getElementById('input');

function save() {
  localStorage.setItem(KEY, JSON.stringify(items));
  render();
}

function render() {
  list.textContent = '';
  const order = items
    .map((item, i) => i)
    .sort((a, b) => items[a].done - items[b].done || a - b);
  order.forEach((i) => {
    const item = items[i];
    const li = document.createElement('li');
    li.className = item.done ? 'done' : '';

    const mark = document.createElement('span');
    mark.className = 'mark';
    mark.textContent = item.done ? '✓' : '';

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = item.text;

    li.append(mark, span);

    if (item.done) {
      const del = document.createElement('button');
      del.className = 'del';
      del.type = 'button';
      del.textContent = '✕';
      del.setAttribute('aria-label', 'Löschen');
      del.onclick = (e) => { e.stopPropagation(); items.splice(i, 1); save(); };
      li.append(del);
    }

    const toggle = () => { items[i].done = !items[i].done; save(); };
    let startX = null;
    let swiped = false;
    li.onpointerdown = (e) => { startX = e.clientX; swiped = false; };
    li.onpointermove = (e) => {
      if (startX === null) return;
      const dx = Math.max(0, e.clientX - startX);
      li.style.transform = `translateX(${dx}px)`;
      if (dx > 80) { swiped = true; startX = null; toggle(); }
    };
    li.onpointerup = li.onpointercancel = () => {
      startX = null;
      li.style.transform = '';
    };
    li.onclick = () => { if (!swiped) toggle(); };

    list.append(li);
  });
  empty.hidden = items.length > 0;
}

function addItems(text) {
  text
    .split(/,|\bund\b/i)
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => items.push({ text: t.charAt(0).toUpperCase() + t.slice(1), done: false }));
  save();
}

form.onsubmit = (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  items.push({ text, done: false });
  input.value = '';
  save();
};

const mic = document.getElementById('mic');
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!Speech) {
  mic.hidden = true;
} else {
  let rec = null;
  let active = false;

  const stop = () => {
    active = false;
    mic.classList.remove('listening');
    if (rec) rec.stop();
  };

  const start = () => {
    rec = new Speech();
    rec.lang = 'de-DE';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) continue;
        const text = e.results[i][0].transcript;
        const m = text.match(/\bstopp?\b/i);
        addItems(m ? text.slice(0, m.index) : text);
        if (m) { stop(); return; }
      }
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') stop();
    };
    // Browser beenden die Aufnahme von selbst; solange aktiv, neu starten
    rec.onend = () => { if (active) start(); };
    rec.start();
  };

  mic.onclick = () => {
    if (active) { stop(); return; }
    active = true;
    mic.classList.add('listening');
    start();
  };
}

document.getElementById('clear').onclick = () => {
  items = items.filter((i) => !i.done);
  save();
};

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
