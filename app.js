(() => {
  const $ = (s) => document.querySelector(s);
  const protocols = Array.isArray(window.PROTOCOLS) ? window.PROTOCOLS : [];
  let active = 'Todos', current = null;
  const favkey = 'bibliome-favs';

  const favs = () => { try { return JSON.parse(localStorage.getItem(favkey) || '[]'); } catch { return []; } };
  const isfav = (id) => favs().includes(id);

  function toggle(id) {
    let f = favs();
    f = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
    localStorage.setItem(favkey, JSON.stringify(f));
    render(); sync();
  }

  function card(p) {
    const a = document.createElement('article');
    a.className = 'card';
    a.innerHTML = `<div class="top"><span>${p.icon || '📌'}</span><button class="star">${isfav(p.id) ? '★' : '☆'}</button></div>
      <button class="open"><h3>${p.title || ''}</h3><p>${p.summary || ''}</p></button><span class="tag">${p.cat || ''}</span>`;
    a.querySelector('.star').onclick = () => toggle(p.id);
    a.querySelector('.open').onclick = () => openP(p);
    return a;
  }

  function cats() {
    const cs = ['Todos', ...new Set(protocols.map(p => String(p.cat || '').split(' • ')[0]).filter(Boolean))];
    $('#cats').replaceChildren(...cs.map(c => {
      const b = document.createElement('button');
      b.textContent = c; b.className = c === active ? 'active' : '';
      b.onclick = () => { active = c; cats(); render(); };
      return b;
    }));
  }

  function render() {
    const q = ($('#search').value || '').toLocaleLowerCase('pt-BR').trim();
    const arr = protocols.filter(p => {
      const cat = String(p.cat || '');
      const hay = [p.title, p.cat, p.summary, p.kw].map(v => String(v || '')).join(' ').toLocaleLowerCase('pt-BR');
      return (active === 'Todos' || cat.startsWith(active)) && hay.includes(q);
    });
    $('#library').replaceChildren(...arr.map(card));
    $('#count').textContent = `${arr.length} itens`;

    const ff = protocols.filter(p => isfav(p.id));
    $('#favs').replaceChildren(...(ff.length ? ff.map(card) : [Object.assign(document.createElement('p'), {textContent:'Nenhum favorito ainda.'})]));

    const u = protocols.filter(p => p.urgent).slice(0,16);
    $('#urgent').replaceChildren(...u.map(card));
  }

  function openP(p) {
    current = p;
    $('#vtitle').textContent = p.title || '';
    $('#vcat').textContent = p.cat || '';
    $('#vimgs').replaceChildren(...(p.imgs || []).map(src => {
      const i = document.createElement('img'); i.src = src; i.alt = p.title || 'Infográfico'; return i;
    }));
    sync(); $('#viewer').showModal();
  }

  function sync() {
    if (current) $('#vfav').textContent = isfav(current.id) ? '★ Remover dos favoritos' : '☆ Adicionar aos favoritos';
  }

  $('#search').oninput = render;
  $('#close').onclick = () => $('#viewer').close();
  $('#vfav').onclick = () => current && toggle(current.id);
  $('#viewer').onclick = e => { if (e.target === $('#viewer')) $('#viewer').close(); };

  function net() { $('#net').textContent = navigator.onLine ? '● online' : '● offline'; }
  addEventListener('online', net); addEventListener('offline', net); net();

  cats(); render();

  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
  }
})();
