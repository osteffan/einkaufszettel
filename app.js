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
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = item.done ? 'done' : '';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = item.done;
    cb.onchange = () => { items[i].done = cb.checked; save(); };

    const span = document.createElement('span');
    span.textContent = item.text;

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Löschen');
    del.onclick = () => { items.splice(i, 1); save(); };

    li.append(cb, span, del);
    list.append(li);
  });
  empty.hidden = items.length > 0;
}

form.onsubmit = (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  items.push({ text, done: false });
  input.value = '';
  save();
};

document.getElementById('clear').onclick = () => {
  items = items.filter((i) => !i.done);
  save();
};

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
