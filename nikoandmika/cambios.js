// ── cambios.js v5 ──
(function () {

  // ══════════════════════════════════════════════════════
  //  INIT — ejecuta directo (el script va al final del body)
  // ══════════════════════════════════════════════════════
  function _init() {
    _injectStyles();
    _patchJuegos();
    _insertCieloInMap();
    _patchGoTab();
    _watchLists();
    _launchShimeji();
    _injectSharedCoverInput();
    _initDarkModeCanvas();
    _injectEntryAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  // ══════════════════════════════════════════════════════
  //  ESTILOS
  // ══════════════════════════════════════════════════════
  function _injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      body.dark .movie-item {
        background: rgba(50,20,40,0.82) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(244,176,196,0.22) !important;
        box-shadow: 0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06) !important;
      }
      body.dark .movie-item:hover {
        border-color: rgba(244,176,196,0.5) !important;
        background: rgba(70,25,55,0.9) !important;
      }
      body.dark .movie-name { color: #fce8f2 !important; font-weight: 700 !important; font-size: 0.96rem !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5) !important; }
      body.dark .movie-meta { color: rgba(230,195,215,0.88) !important; }
      body.dark .badge-pendiente { background: rgba(200,110,60,0.4) !important; color: #f4b090 !important; border:none !important; }
      body.dark .badge-vista     { background: rgba(60,150,80,0.4) !important;  color: #90d4a4 !important; border:none !important; }
      body.dark .badge-favorita  { background: rgba(249,198,208,0.25) !important; color: #f4b0c4 !important; border:none !important; }
      .movie-name { font-weight: 700 !important; font-size: 0.95rem !important; }

      body.dark #tmdb-dropdown {
        background: #2a1030 !important;
        border: 1.5px solid rgba(244,176,196,0.3) !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.7) !important;
      }
      body.dark #tmdb-dropdown > div { border-bottom-color: rgba(244,176,196,0.1) !important; }
      body.dark #tmdb-dropdown > div:hover { background: rgba(249,198,208,0.12) !important; }
      body.dark #tmdb-dropdown div[style*="font-weight:700"] { color: #fce8f2 !important; }
      body.dark #tmdb-dropdown div[style*="color:var(--text-soft)"] { color: rgba(210,175,200,0.85) !important; }
      body.dark #tmdb-dropdown span[style*="background:rgba(249"] { background: rgba(249,198,208,0.2) !important; color: #f4b0c4 !important; }

      .movie-cover {
        width: 44px; height: 60px; border-radius: 8px; flex-shrink: 0;
        border: 1.5px solid rgba(240,192,212,0.4);
        background: linear-gradient(135deg,#f9c6d0,#ddd0f0);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem; overflow: hidden; cursor: pointer; position: relative;
      }
      .movie-cover::after { content:'✍️'; position:absolute; inset:0; background:rgba(0,0,0,0.4); color:white; display:flex; align-items:center; justify-content:center; font-size:1.1rem; opacity:0; transition:opacity 0.2s; border-radius:6px; pointer-events:none; }
      .movie-cover:hover::after { opacity:1; }
      .movie-cover img { width:100%; height:100%; object-fit:cover; border-radius:6px; display:block; }
      body.dark .movie-cover { border-color: rgba(244,176,196,0.25); background: linear-gradient(135deg,rgba(249,198,208,0.15),rgba(180,140,220,0.15)); }
      .cover-upload-wrap { display:flex; align-items:center; gap:0.6rem; margin-top:0.6rem; flex-wrap:wrap; }
      .cover-upload-btn {
        display:inline-flex; align-items:center; gap:0.3rem;
        padding:0.38rem 0.85rem; border-radius:50px; font-size:0.76rem;
        font-family:'Lato',sans-serif; font-weight:700; cursor:pointer;
        background:rgba(249,198,208,0.4); border:1.5px solid #f0c0d4; color:#d97fa0; transition:all 0.2s;
      }
      .cover-upload-btn:hover { background:rgba(249,198,208,0.7); }
      body.dark .cover-upload-btn { background:rgba(249,198,208,0.1); border-color:rgba(240,192,212,0.3); color:#f4b0c4; }
      #cover-preview-area.show { display:flex; }
      #cover-prev-thumb { width:28px; height:38px; border-radius:5px; object-fit:cover; border:1.5px solid rgba(240,192,212,0.5); }
      #cover-prev-clear { background:none; border:none; cursor:pointer; color:#d97fa0; font-size:0.85rem; padding:0.1rem 0.3rem; line-height:1; }

      .drag-handle { cursor:grab; color:rgba(180,140,160,0.45); font-size:1.1rem; padding:0 0.25rem; flex-shrink:0; user-select:none; transition:color 0.2s; letter-spacing:-1px; }
      .drag-handle:hover { color:var(--rose-deep); }
      .movie-item.dragging { opacity:0.35; transform:scale(0.98); }
      .movie-item.drag-over { border-top:2.5px solid var(--rose-mid) !important; margin-top:-1px; }

      #shimeji-wrap { position:fixed; bottom:0; z-index:9999; pointer-events:auto; user-select:none; }
      #shimeji-img { height:105px; width:auto; display:block; cursor:pointer; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6)); }
      #shimeji-img.paused { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6)) saturate(0.3) !important; }

      .bday-sticker {
        filter:
          drop-shadow(1px 0 0 #000) drop-shadow(-1px 0 0 #000)
          drop-shadow(0 1px 0 #000) drop-shadow(0 -1px 0 #000)
          drop-shadow(0 4px 10px rgba(200,100,150,0.35)) !important;
      }

      .map-sub-tabs { display:flex !important; gap:0.4rem; margin-bottom:1.2rem; flex-wrap:wrap; }
      
      .chat-container { flex:1; display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.6); border-radius:16px; padding:10px; border:var(--border-rose); margin-top:10px; overflow:hidden;}
      .chat-messages-list { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:12px; padding:5px 10px; min-height: 250px;}
      .chat-msg { display:flex; flex-direction:column; max-width:85%; }
      .chat-msg.me { align-self:flex-end; align-items:flex-end; }
      .chat-msg.other { align-self:flex-start; align-items:flex-start; }
      .chat-bubble { padding:10px 14px; border-radius:18px; font-size:0.9rem; line-height:1.4; position:relative; box-shadow:var(--shadow-soft); }
      .chat-msg.me .chat-bubble { background: linear-gradient(135deg, #f4b0c4, #d0a0c0); color:white; border-bottom-right-radius:4px; }
      .chat-msg.other .chat-bubble { background: #fff; color:var(--text); border:var(--border-rose); border-bottom-left-radius:4px; }
      .chat-author { font-size:0.65rem; font-weight:700; opacity:0.8; margin-bottom:2px; }
      .chat-input-wrapper { display:flex; gap:8px; padding-top:8px; border-top:1px solid rgba(240,192,212,0.3); }
      .chat-input-wrapper input { flex:1; padding:10px 15px; border-radius:50px; border:var(--border-rose); outline:none; font-family:'Lato'; font-size:0.85rem; }
      body.dark .chat-container { background: rgba(50,20,40,0.6); }
      body.dark .chat-msg.other .chat-bubble { background:rgba(80,30,60,0.9); color:#fce8f2; border:none; }
      body.dark .chat-input-wrapper input { background:rgba(30,10,25,0.8); color:white; border-color:rgba(244,176,196,0.3); }
      .map-sub-tab { background:rgba(255,255,255,0.7); border:1.5px solid #f0c0d4; border-radius:50px; padding:0.32rem 0.9rem; font-size:0.78rem; font-family:'Lato',sans-serif; color:#8a6878; cursor:pointer; transition:all 0.2s; font-weight:700; outline:none; }
      .map-sub-tab.active, .map-sub-tab:hover { background:rgba(249,198,208,0.5); border-color:#f4b0c4; color:#d97fa0; }
      body.dark .map-sub-tab { background:rgba(60,30,45,0.7); border-color:rgba(240,192,212,0.3); color:#c9a0b8; }
      body.dark .map-sub-tab.active, body.dark .map-sub-tab:hover { background:rgba(249,198,208,0.2); }
      
      /* ── NUEVOS ESTILOS INYECTADOS ── */
      /* Animaciones de Entrada */
      .section.active { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; display:block; }
      @keyframes fadeInUp { from { opacity:0; transform:translateY(25px); } to { opacity:1; transform:translateY(0); } }
      .fade-in-el { opacity:0; animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      
      /* Vinilo Spinning y Caja de Spotify */
      .vinyl-disc-wrapper { position:relative; width:55px; height:55px; cursor:pointer; }
      .vinyl-disc { width:100%; height:100%; border-radius:50%; background:repeating-radial-gradient(#1a1a1a 0px, #111 2px, #333 3px, #1a1a1a 4px); box-shadow:0 4px 10px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; transition:transform 0.2s; border: 1px solid #000; z-index:2; position:relative; }
      .vinyl-disc:hover { transform: scale(1.05); }
      .vinyl-label-center { width:16px; height:16px; border-radius:50%; background: #f4b0c4; border: 1.5px solid #222; position:relative; }
      .vinyl-label-center::after { content:''; position:absolute; inset:5px; border-radius:50%; background:#fff; }
      .vinyl-disc.spin { animation:spinVinyl 2.4s linear infinite; }
      .vinyl-needle { position:absolute; top:-6px; right:-2px; width:4px; height:28px; background:linear-gradient(to right, #e0e0e0, #999); transform-origin:top center; transform:rotate(-35deg); transition:transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); border-radius:2px; z-index:3; filter:drop-shadow(-2px 2px 2px rgba(0,0,0,0.4)); pointer-events:none; }
      .vinyl-needle::before { content:''; position:absolute; top:0; left:-3px; width:10px; height:10px; background:#333; border-radius:50%; box-shadow:inset 0 1px 2px rgba(255,255,255,0.3); }
      .vinyl-needle.play { transform:rotate(12deg); }
      
      /* Carta Envelope Cute Ancho y Responsivo */
      .birthday-unlocked-envelope { padding:2rem; display:flex; justify-content:center; align-items:center; perspective:1200px; width:100%; position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(12px); z-index:1000; opacity:0; pointer-events:none; transition:opacity 0.4s; }
      .birthday-unlocked-envelope.show { opacity:1; pointer-events:auto; }
      .love-envelope { position:relative; width:90vw; max-width:650px; height:50vh; max-height:400px; background:#fbf5ee; border-radius:8px; box-shadow:0 15px 40px rgba(0,0,0,0.25); cursor:pointer; transition:transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275); z-index:10; }
      .love-envelope:hover { transform:translateY(-8px) scale(1.02); box-shadow:0 25px 50px rgba(0,0,0,0.3); }
      .envelope-flap { position:absolute; top:0; left:0; right:0; height:60%; background:#fbf5ee; clip-path:polygon(0 0, 100% 0, 50% 100%); transform-origin:top center; transition:transform 0.5s ease-in-out, z-index 0s 0.5s; z-index:4; filter:drop-shadow(0 4px 6px rgba(142,106,85,0.3)); border-bottom:1px solid rgba(142,106,85,0.1); }
      .envelope-body-left { position:absolute; inset:0; background:#f4ebd8; clip-path:polygon(0 0, 50% 50%, 0 100%); z-index:3; pointer-events:none; }
      .envelope-body-right { position:absolute; inset:0; background:#f4ebd8; clip-path:polygon(100% 0, 100% 100%, 50% 50%); z-index:3; pointer-events:none; }
      .envelope-body-bottom { position:absolute; inset:0; background:#ece4d4; clip-path:polygon(0 100%, 50% 50%, 100% 100%); z-index:3; pointer-events:none; filter:drop-shadow(0 -3px 5px rgba(0,0,0,0.05)); }
      .envelope-heart-seal { position:absolute; top:52%; left:50%; transform:translate(-50%, -50%); color:#e8647c; font-size:2.4rem; z-index:5; pointer-events:none; transition:opacity 0.3s 0.2s; text-shadow:0 2px 4px rgba(0,0,0,0.2); background:#fbf5ee; border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border:2px solid #8e6a55; }
      .letter-paper { position:absolute; left:16px; right:16px; bottom:12px; height:calc(100% - 24px); background:#fff; border:1px solid #ddd; z-index:2; padding:2rem 2.5rem; transition:all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s; overflow:hidden; background-image:repeating-linear-gradient(transparent, transparent 28px, #f0e4d8 28px, #f0e4d8 29px); pointer-events:none; box-shadow:0 0 15px rgba(0,0,0,0.08); border-radius:4px; }
      .love-envelope.open { cursor:default; transform:scale(1.02); }
      .love-envelope.open .envelope-flap { transform:rotateX(180deg); z-index:1; filter:none; opacity:0.8; }
      .love-envelope.open .envelope-heart-seal { opacity:0; }
      .love-envelope.open .letter-paper { position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); right:auto; bottom:auto; width:90vw; max-width:580px; height:auto; min-height:200px; max-height:80vh; z-index:1002; pointer-events:auto; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.35); border-radius:12px; padding:2.5rem 3rem; }
      .letter-paper::-webkit-scrollbar { width:6px; }
      .letter-paper::-webkit-scrollbar-thumb { background:var(--rose-mid); border-radius:6px; }

      /* ── CHAT ACTIONS (editar/borrar) ── */
      .chat-actions span { cursor:pointer; transition:opacity 0.2s; }
      .chat-actions span:hover { opacity:1 !important; }
      .chat-edited { font-size:0.6rem; opacity:0.55; font-style:italic; margin-left:4px; }
      .chat-edit-input {
        width:100%; padding:6px 10px; border:1.5px solid rgba(240,192,212,0.5);
        border-radius:12px; font-size:0.85rem; font-family:'Lato',sans-serif;
        outline:none; background:rgba(255,255,255,0.9); margin-top:4px;
      }
      body.dark .chat-edit-input { background:rgba(30,10,25,0.9); color:#fce8f2; border-color:rgba(244,176,196,0.3); }

      /* ── NOTE TYPE EDITOR ── */
      .note-edit-type { 
        margin-bottom:8px; width:100%; padding:0.45rem 0.7rem; border-radius:10px;
        border:var(--border-rose); background:#fff8fc; color:var(--text);
        font-family:'Lato',sans-serif; font-size:0.82rem; outline:none;
      }
      body.dark .note-edit-type { background:#2a1520; color:var(--text); border-color:rgba(240,192,212,0.25); }
    `;
    document.head.appendChild(s);
  }
  
  function _initDarkModeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'dark-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;opacity:0;transition:opacity 0.8s;';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');
    let stars = [];
    for(let i=0;i<80;i++) {
      stars.push({x:Math.random(), y:Math.random(), s:Math.random()*1.5, o:Math.random(), d:(Math.random() > 0.5 ? 1 : -1)});
    }
    
    function draw() {
      if(!document.body.classList.contains('dark')) {
        canvas.style.opacity = '0';
      } else {
        canvas.style.opacity = '1';
        if(canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
        if(canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        stars.forEach(st => {
           st.o += 0.005 * st.d;
           if(st.o >= 1) st.d = -1;
           else if(st.o <= 0.1) st.d = 1;
           ctx.beginPath();
           ctx.arc(st.x * canvas.width, st.y * canvas.height, st.s, 0, Math.PI*2);
           ctx.fillStyle = `rgba(255,255,255,${st.o})`;
           ctx.fill();
        });
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function _injectEntryAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          const els = entry.target.querySelectorAll('.movie-item, .note-card, .place-item, .gallery-item, .gallery-full-item');
          els.forEach((el, idx) => {
            el.classList.add('fade-in-el');
            el.style.animationDelay = `${idx * 0.06}s`;
          });
        }
      });
    }, { threshold: 0.05 });
    
    document.querySelectorAll('.tab-panel, .section').forEach(sec => {
      observer.observe(sec);
    });
  }

  // ══════════════════════════════════════════════════════
  //  JUEGOS
  // ══════════════════════════════════════════════════════
  function _patchJuegos() {
    const sel = document.getElementById('game-status');
    if (sel) { const o = sel.querySelector('option[value="jugando"]'); if (o) o.textContent = 'Jugados'; }
    document.querySelectorAll('#tab-games .filter-tab').forEach(b => {
      if (b.textContent.trim() === 'Jugando') b.textContent = 'Jugados';
    });
    const orig = window.renderGames;
    if (typeof orig === 'function') {
      window.renderGames = function () {
        orig.apply(this, arguments);
        document.querySelectorAll('#game-list .badge-jugando').forEach(el => {
          if (el.textContent.trim() === 'Jugando') el.textContent = 'Jugados';
        });
      };
    }
  }

  // ══════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════
  //  PORTADA Y DRAG & DROP UNIVERSAL
  // ══════════════════════════════════════════════════════
  let _activeItemType = null;
  let _activeItemId = null;

  function _injectSharedCoverInput() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.id = 'shared-cover-inp'; inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('change', function () {
      const f = this.files[0]; if (!f || !_activeItemId) return;
      _compressImg(f).then(b64 => {
        if(_activeItemType === 'movies' && window.fbUpdateMovie) {
          window.fbUpdateMovie(_activeItemId, { cover: b64 }).catch(console.error);
        } else if(_activeItemType === 'games' && window.fbUpdateGame) {
          window.fbUpdateGame(_activeItemId, { cover: b64 }).catch(console.error);
        }
        _activeItemType = null; _activeItemId = null; this.value = '';
      });
    });
  }

  function _compressImg(file, mw=200, mh=280, q=0.75) {
    return new Promise(res => {
      const r = new FileReader();
      r.onload = e => {
        const img = new Image();
        img.onload = () => {
          const ratio = Math.min(mw/img.width, mh/img.height, 1);
          const w = Math.round(img.width*ratio), h = Math.round(img.height*ratio);
          const c = document.createElement('canvas'); c.width=w; c.height=h;
          c.getContext('2d').drawImage(img,0,0,w,h);
          res(c.toDataURL('image/jpeg', q));
        };
        img.src = e.target.result;
      };
      r.readAsDataURL(file);
    });
  }

  function _watchLists() {
    const lists = ['movie-list', 'game-list'];
    lists.forEach(id => {
      const list = document.getElementById(id);
      if (list) new MutationObserver(() => _upgradeItems(list, id)).observe(list, { childList: true });
    });
  }

  let _dragSrcId = null;
  let _dragListId = null;

  function _upgradeItems(list, listId) {
    if (!list) return;
    const type = listId === 'movie-list' ? 'movies' : 'games';
    const arr = (type === 'movies' ? window.movies : window.games) || [];
    
    list.querySelectorAll('.movie-item').forEach(item => {
      if (item.dataset.upgraded) return;
      item.dataset.upgraded = '1';
      
      const del = item.querySelector('.movie-delete');
      if (!del) return;
      const m = (del.getAttribute('onclick')||'').match(/delete(?:Movie|Game)\('([^']+)'\)/);
      if (!m) return;
      
      const id = m[1]; item.dataset.itemId = id;
      const data = arr.find(d => d.id === id);
      const emojiSpan = item.querySelector('.movie-emoji');
      
      const coverDiv = document.createElement('div'); coverDiv.className = 'movie-cover';
      coverDiv.title = 'Cambiar portada';
      coverDiv.onclick = () => {
        _activeItemType = type; _activeItemId = id;
        document.getElementById('shared-cover-inp').click();
      };

      if (data && data.cover) {
        const img = document.createElement('img'); img.src = data.cover; img.alt = 'portada';
        coverDiv.appendChild(img);
      } else { coverDiv.textContent = emojiSpan ? emojiSpan.textContent : '🎮'; }
      
      if (emojiSpan) emojiSpan.style.display = 'none';
      item.insertBefore(coverDiv, item.firstChild);
      
      const handle = document.createElement('span');
      handle.className = 'drag-handle'; handle.innerHTML = '⠿⠿'; handle.title = 'Arrastrar para reordenar';
      item.appendChild(handle);
      item.setAttribute('draggable', 'true');
      
      item.addEventListener('dragstart', e => { _dragSrcId = id; _dragListId = listId; setTimeout(() => item.classList.add('dragging'), 0); e.dataTransfer.effectAllowed = 'move'; });
      item.addEventListener('dragend', () => { item.classList.remove('dragging'); list.querySelectorAll('.movie-item').forEach(el => el.classList.remove('drag-over')); });
      item.addEventListener('dragover', e => { e.preventDefault(); if (id !== _dragSrcId && listId === _dragListId) { list.querySelectorAll('.movie-item').forEach(el => el.classList.remove('drag-over')); item.classList.add('drag-over'); } });
      item.addEventListener('drop', e => { e.preventDefault(); item.classList.remove('drag-over'); if (id !== _dragSrcId && listId === _dragListId) _reorderItems(list, type, _dragSrcId, id); });
    });
  }

  async function _reorderItems(list, type, srcId, dstId) {
    if (!list) return;
    const ids = Array.from(list.querySelectorAll('.movie-item[data-item-id]')).map(el => el.dataset.itemId);
    const si = ids.indexOf(srcId), di = ids.indexOf(dstId);
    if (si === -1 || di === -1) return;
    ids.splice(si, 1); ids.splice(di, 0, srcId);
    
    const db = window._db; if (!db) return;
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const base = Date.now();
      for (let i = 0; i < ids.length; i++) await updateDoc(doc(db, type, ids[i]), { ts: base - i * 1000 });
    } catch(e) { console.error('reorder error', e); }
  }


  // ══════════════════════════════════════════════════════
  //  CIELO SUB-TAB
  // ══════════════════════════════════════════════════════
  function _insertCieloInMap() {
    const mapTab = document.getElementById('tab-map'); if (!mapTab) return;
    const lug = document.createElement('div'); lug.id = 'map-sub-lugares';
    while (mapTab.firstChild) lug.appendChild(mapTab.firstChild);
    lug.style.display = 'block';
    const ciel = document.createElement('div'); ciel.id = 'map-sub-cielo'; ciel.style.display = 'none';
    ciel.innerHTML = `<div style="display:flex;justify-content:center;padding-top:0.4rem;"><canvas id="sky-canvas" width="540" height="540" style="border-radius:50%;background:#0a0a1e;box-shadow:0 0 40px rgba(200,150,255,0.25);max-width:100%;display:block;"></canvas></div>`;
    const bar = document.createElement('div'); bar.className = 'map-sub-tabs';
    bar.innerHTML = `<button class="map-sub-tab active" data-t="l">Lugares</button><button class="map-sub-tab" data-t="c">Nuestro Cielo</button>`;
    mapTab.appendChild(bar); mapTab.appendChild(lug); mapTab.appendChild(ciel);
    bar.querySelectorAll('.map-sub-tab').forEach(btn => {
      btn.addEventListener('click', function () {
        bar.querySelectorAll('.map-sub-tab').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (this.dataset.t === 'l') { lug.style.display='block'; ciel.style.display='none'; }
        else { lug.style.display='none'; ciel.style.display='block'; _drawSky(); setTimeout(_drawSky,300); }
      });
    });
  }

  function _patchGoTab() {
    const orig = window.goTab; if (typeof orig !== 'function') return;
    window.goTab = function (id, btn) {
      orig(id, btn);
      if (id === 'map') { const c = document.getElementById('map-sub-cielo'); if (c && c.style.display !== 'none') setTimeout(_drawSky, 300); }
    };
  }

  // ══════════════════════════════════════════════════════
  //  SHIMEJI
  // ══════════════════════════════════════════════════════
  function _launchShimeji() {
    const wrap = document.createElement('div'); wrap.id = 'shimeji-wrap';
    const img = document.createElement('img'); img.id = 'shimeji-img';
    img.src = './niiicoooomylooooveee-removebg-preview.png'; img.alt = ''; img.draggable = false;
    wrap.appendChild(img); document.body.appendChild(wrap);

    function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
    let x = 0, dir = 1, stepT = 0;
    const STEP_DUR = 28, STEP_W = 14, HOP_H = 14;
    let special = null, specialT = 0, idleFrames = 0, nextSpecial = rnd(300, 600);
    let paused = false;

    function _setFlip() { if (special === 'spin') return; img.style.transform = dir === 1 ? 'scaleX(-1)' : ''; }

    img.addEventListener('click', () => { paused = !paused; img.classList.toggle('paused', paused); });

    function tick() {
      if (paused) { requestAnimationFrame(tick); return; }
      const imgW = img.offsetWidth || 90, maxX = window.innerWidth - imgW;
      if (special === 'bigJump') {
        specialT++; const dur = 55;
        wrap.style.bottom = Math.sin(Math.PI * specialT / dur) * 52 + 'px';
        if (specialT >= dur) { special = null; specialT = 0; wrap.style.bottom = '0px'; }
      } else if (special === 'spin') {
        specialT++; const dur = 24;
        img.style.transform = (dir === 1 ? 'scaleX(-1) ' : '') + `rotate(${(specialT/dur)*360}deg)`;
        if (specialT >= dur) { special = null; specialT = 0; img.style.transform = dir === 1 ? 'scaleX(-1)' : ''; }
      }
      if (!special) {
        stepT++; x += (STEP_W / STEP_DUR) * dir;
        wrap.style.bottom = Math.sin(Math.PI * stepT / STEP_DUR) * HOP_H + 'px';
        if (stepT >= STEP_DUR) stepT = 0;
        if (x >= maxX) { x = maxX; dir = -1; _setFlip(); stepT = 0; }
        if (x <= 0)    { x = 0;    dir = 1;  _setFlip(); stepT = 0; }
        wrap.style.left = x + 'px';
        idleFrames++;
        if (idleFrames >= nextSpecial) {
          idleFrames = 0; nextSpecial = rnd(280, 580);
          special = rnd(0,1) === 0 ? 'bigJump' : 'spin'; specialT = 0;
        }
      }
      requestAnimationFrame(tick);
    }

    img.onload = () => requestAnimationFrame(tick);
    img.onerror = () => { img.style.display='none'; };
    setTimeout(() => requestAnimationFrame(tick), 800);
  }

  // ══════════════════════════════════════════════════════
  //  MAPA ESTELAR
  // ══════════════════════════════════════════════════════
  const STARS=[['Achernar',192,26,.5],['Canopus',218,55,-.7],['Sirius',284,38,-1.4],['Rigil Kentaurus',169,52,-.3],['Antares',94,38,1.1],['Fomalhaut',26,17,1.2],['Acrux',178,62,.8],['Gacrux',171,61,1.6],['Spica',111,43,1],['Arcturus',105,26,0],['Regulus',147,26,1.4],['Procyon',258,30,.4],['Pollux',250,22,1.1],['Castor',247,19,1.6],['Mizar',145,15,2]];
  const PLANETS=[['Júpiter',135,20,'#ffe8a0'],['Saturno',82,32,'#f0d080'],['Marte',300,10,'#ff8060'],['Venus',285,5,'#ffffc0'],['Mercurio',290,3,'#d0d0d0']];
  const CLINES=[['Crux',178,62,174,56],['Crux',171,61,183,57],['Cen',169,52,178,62],['Cen',169,52,160,48],['Sco',94,38,100,35],['Sco',100,35,108,28],['Sco',94,38,88,30],['Vir',111,43,120,38]];
  const CLABELS=[['Crux',177,57],['Centaurus',163,50],['Scorpius',97,34],['Virgo',114,40],['Canis Major',270,35],['Sagittarius',75,28],['Ophiuchus',78,42]];

  function _drawSky(){
    const cv=document.getElementById('sky-canvas');if(!cv)return;
    const c=cv.getContext('2d');if(!c)return;
    const W=cv.width,H=cv.height,CX=W/2,CY=H/2,R=W/2-4;
    c.clearRect(0,0,W,H);
    const bg=c.createRadialGradient(CX,CY,0,CX,CY,R);
    bg.addColorStop(0,'#12082a');bg.addColorStop(.6,'#0a0520');bg.addColorStop(1,'#050210');
    c.fillStyle=bg;c.beginPath();c.arc(CX,CY,R,0,Math.PI*2);c.fill();
    c.save();c.beginPath();c.arc(CX,CY,R,0,Math.PI*2);c.clip();
    
    // Background noise / thousands of realistic tiny stars
    const starColors = ['#ffffff', '#fff4e8', '#e8f4ff', '#ffe8e8'];
    for(let i=0; i<600; i++){
      const x=Math.random()*W, y=Math.random()*H;
      const dist=Math.sqrt((x-CX)**2 + (y-CY)**2);
      if(dist>R) continue;
      const op = Math.random()*0.8;
      c.globalAlpha = op;
      c.fillStyle = starColors[Math.floor(Math.random()*starColors.length)];
      c.beginPath();c.arc(x,y,Math.random()*0.9,0,Math.PI*2);c.fill();
    }
    c.globalAlpha=1.0;

    const g=c.createLinearGradient(CX-R*.3,CY-R*.8,CX+R*.3,CY+R*.2);
    g.addColorStop(0,'rgba(120,100,180,0)');g.addColorStop(.3,'rgba(120,100,180,.07)');g.addColorStop(.5,'rgba(150,130,200,.11)');g.addColorStop(.7,'rgba(120,100,180,.07)');g.addColorStop(1,'rgba(120,100,180,0)');
    c.fillStyle=g;c.save();c.translate(CX,CY);c.rotate(-.4);c.scale(.25,1);c.beginPath();c.arc(0,0,R,0,Math.PI*2);c.restore();c.fill();
    
    // Some subtle nebula clouds
    for(let i=0; i<3; i++) {
        const nx = CX + (Math.random()-0.5)*R, ny = CY + (Math.random()-0.5)*R;
        const nsz = R*0.4*Math.random()+R*0.2;
        const ng = c.createRadialGradient(nx,ny,0,nx,ny,nsz);
        ng.addColorStop(0,'rgba(100,60,180,0.06)'); ng.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle=ng; c.beginPath(); c.arc(nx,ny,nsz,0,Math.PI*2); c.fill();
    }

    c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=.8;
    [10,30,60].forEach(a=>{const r=R*(1-a/90);c.beginPath();c.arc(CX,CY,r,0,Math.PI*2);c.stroke();});
    c.strokeStyle='rgba(255,255,255,.12)';c.setLineDash([4,6]);
    [[CX,CY-R,CX,CY+R],[CX-R,CY,CX+R,CY]].forEach(([x1,y1,x2,y2])=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();});
    c.setLineDash([]);
    c.strokeStyle='rgba(180,140,255,.35)';c.lineWidth=.9;
    CLINES.forEach(([,a1,b1,a2,b2])=>{const[x1,y1]=xy(a1,b1,CX,CY,R),[x2,y2]=xy(a2,b2,CX,CY,R);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();});
    STARS.forEach(([n,a,b,m])=>{const[x,y]=xy(a,b,CX,CY,R),sz=Math.max(1.2,4.5-m*.9);star(c,x,y,sz,'#fff');if(m<=.5){c.fillStyle='rgba(255,255,255,.7)';c.font='9px Lato,sans-serif';c.fillText(n,x+sz+2,y-sz);}});
    PLANETS.forEach(([n,a,b,col])=>{if(b<2)return;const[x,y]=xy(a,b,CX,CY,R);star(c,x,y,4.5,col,true);c.fillStyle=col;c.font='bold 8.5px Lato,sans-serif';c.fillText(n,x+6,y-4);});
    c.fillStyle='rgba(200,180,255,.55)';c.font='8px Lato,sans-serif';
    CLABELS.forEach(([n,a,b])=>{const[x,y]=xy(a,b,CX,CY,R);c.fillText(n,x,y);});
    c.restore();
    c.strokeStyle='rgba(200,150,255,.4)';c.lineWidth=2;c.beginPath();c.arc(CX,CY,R,0,Math.PI*2);c.stroke();
    c.fillStyle='rgba(255,200,220,.9)';c.font='bold 11px Lato,sans-serif';c.textAlign='center';
    [['N',CX,12],['S',CX,H-6],['E',W-8,CY+4],['O',8,CY+4]].forEach(([l,x,y])=>c.fillText(l,x,y));
    c.fillStyle='rgba(255,200,220,.6)';c.font='9px Lato,sans-serif';c.fillText('16 · jul · 2025',CX,H-14);c.textAlign='left';
  }
  function xy(az,alt,cx,cy,R){const r=R*(1-alt/90),a=(az-90)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)];}
  function star(c,x,y,sz,col,pl=false){
    const g=c.createRadialGradient(x,y,0,x,y,sz*2);g.addColorStop(0,col);g.addColorStop(.4,col);g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g;c.beginPath();c.arc(x,y,sz*(pl?1.8:2),0,Math.PI*2);c.fill();
    c.fillStyle=col;c.beginPath();c.arc(x,y,sz*.5,0,Math.PI*2);c.fill();
  }


// ==========================================
// NUEVAS FUNCIONALIDADES SOLICITADAS
// ==========================================

// 1. SOBRESCRIBIR CHAT (Editar y Borrar)
window.fbDeleteMessage = async function(id) {
  const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  await deleteDoc(doc(window._db, 'chat', id));
};
window.fbUpdateMessage = async function(id, data) {
  const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  await updateDoc(doc(window._db, 'chat', id), data);
};
window.renderChat = function() {
  const lst=document.getElementById('chat-messages-list');
  if(!lst)return;
  if(!window.chatMessages || !window.chatMessages.length){
    lst.innerHTML='<div class="empty-state"><div class="empty-icon">💬</div><p>No hay mensajes aún.</p></div>';
    return;
  }
  let html='';
  window.chatMessages.forEach(m => {
    const isMe = (m.author === window.currentUser);
    const actions = isMe ? `<div class="chat-actions" style="display:flex;gap:12px;justify-content:flex-end;margin-top:6px;"><span style="cursor:pointer;font-size:0.75rem;opacity:0.8;color:inherit;" onclick="editMessage('${m.id}')">✏️ editar</span><span style="cursor:pointer;font-size:0.75rem;opacity:0.8;color:inherit;" onclick="deleteMessage('${m.id}')">✕ borrar</span></div>` : '';
    html += `
      <div class="chat-msg ${isMe ? 'me' : 'other'}">
        <div class="chat-bubble">
          <div class="chat-author">${window.escHtml(m.author)}</div>
          <div class="chat-text" id="chat-text-${m.id}">${window.escHtml(m.text)}${m.edited ? '<span class="chat-edited">(editado)</span>' : ''}</div>
          ${actions}
        </div>
      </div>`;
  });
  lst.innerHTML = html;
  lst.scrollTop = lst.scrollHeight;
};
window.editMessage = async function(id) {
  const m = window.chatMessages.find(x => x.id === id);
  if (!m) return;
  const newTxt = prompt("Editar mensaje:", m.text);
  if (newTxt && newTxt.trim() !== "" && newTxt !== m.text) {
    if(window.showSync) window.showSync();
    await window.fbUpdateMessage(id, {text: newTxt.trim()});
  }
};
window.deleteMessage = async function(id) {
  if(window.showConfirm) {
    const ok = await window.showConfirm("¿Borrar este mensaje?");
    if(!ok) return;
  } else {
    if(!confirm("¿Borrar este mensaje?")) return;
  }
  if(window.showSync) window.showSync();
  await window.fbDeleteMessage(id);
};

// 2. SOBRESCRIBIR EDITAR NOTA (Selector de Tipo)
window.editNote = function(id){
  const card=document.getElementById('note-card-'+id);
  const note=window.notes.find(n=>n.id===id);
  if(!note||!card)return;
  const bodyEl=card.querySelector('.note-body');
  if(card.querySelector('.note-edit-area'))return;
  
  const typeSelect=document.createElement('select');
  typeSelect.className='note-edit-type';
  typeSelect.innerHTML='<option value="nota">Nota</option><option value="poema">Poema</option>';
  typeSelect.value = note.type || 'nota';
  typeSelect.style.cssText = 'margin-bottom:8px; width:100%; padding:0.4rem; border-radius:8px; border:1px solid #f4b0c4; background:var(--cream); color:var(--text);';

  const area=document.createElement('textarea');
  area.className='note-edit-area'; area.value=note.body;
  const btn=document.createElement('button');
  btn.className='note-edit-save'; btn.textContent='Guardar';
  btn.onclick=async()=>{
    const newBody=area.value.trim();
    const newType=typeSelect.value;
    if(!newBody)return;
    if(window.showSync) window.showSync();
    await window.fbUpdateNote(id,{body:newBody, type:newType}).catch(console.error);
    typeSelect.remove();area.remove();btn.remove();
  };
  bodyEl.after(typeSelect); typeSelect.after(area); area.after(btn); area.focus();
};

// 3. OVERRIDE TMDB PARA PELÍCULAS (Guardar Portadas Automáticas)
window._lastTmdbCover = '';
window.selectTmdb = function(el) {
  document.getElementById('tmdb-input').value = el.dataset.title;
  document.getElementById('movie-type-hidden').value = el.dataset.type;
  window._lastTmdbCover = el.dataset.cover || '';
  document.getElementById('tmdb-dropdown').style.display = 'none';
};
window.addMovie = function() {
  const title = document.getElementById('tmdb-input').value.trim(); if (!title) return;
  const movie = {
      title, 
      type: document.getElementById('movie-type-hidden').value || '🎬',
      cover: window._lastTmdbCover || '',
      status: document.getElementById('movie-status').value, 
      date: new Date().toLocaleDateString('es')
  };
  document.getElementById('tmdb-input').value = '';
  document.getElementById('movie-type-hidden').value = '🎬';
  window._lastTmdbCover = '';
  document.getElementById('tmdb-dropdown').style.display = 'none';
  if(window.showSync) window.showSync();
  window.fbAddMovie(movie).catch(console.error);
};

// 4. MEJORA ESTÉTICA DEL VINILO
document.head.insertAdjacentHTML('beforeend', `
<style>
  body.dark #vinyl-popup, body #vinyl-popup { background: none !important; }
  body:not(.dark) #vinyl-popup { background: rgba(255, 255, 255, 0.95) !important; }
  body.dark .vinyl-popup { background: rgba(30, 15, 22, 0.9) !important; border: 1.5px solid rgba(244,176,196,0.2) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; }
  
  .vinyl-popup {
    padding: 20px !important;
    border-radius: 16px !important;
    backdrop-filter: blur(10px) !important;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .vinyl-info {
    font-family: 'Dancing Script', cursive !important;
    font-size: 1.6rem !important;
    color: var(--rose-deep) !important;
    text-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 20px !important;
    width: 100%;
    text-align: center;
  }
  body.dark .vinyl-info { color: #fce8f2 !important; text-shadow: 0 2px 8px rgba(255,100,150,0.4); }
  
  .vinyl-eq { display:flex; gap:4px; margin-bottom:15px; height:20px; align-items:flex-end; }
  .vinyl-eq span { width:5px; background:#d97fa0; border-radius:3px; animation: eq 0.6s ease-in-out infinite alternate; opacity:0.3; transition:opacity 0.3s; }
  body.dark .vinyl-eq span { background: #fce8f2; box-shadow: 0 0 5px rgba(255,255,255,0.5); }
  .vinyl-eq.playing span { opacity:1; }
  .vinyl-eq span:nth-child(2) { animation-delay: 0.2s; }
  .vinyl-eq span:nth-child(3) { animation-delay: 0.4s; }
  .vinyl-eq span:nth-child(4) { animation-delay: 0.1s; }
  .vinyl-eq span:nth-child(5) { animation-delay: 0.5s; }
  @keyframes eq { 0% { height: 4px; } 100% { height: 20px; } }
</style>
`);

setTimeout(() => {
  const vp = document.getElementById('vinyl-popup');
  if(vp && !document.getElementById('vinyl-eq')) {
    const vk = document.createElement('div');
    vk.className = 'vinyl-eq';
    vk.id = 'vinyl-eq';
    vk.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
    vp.insertBefore(vk, vp.children[1]);
  }
  const oldUpd = window.updateVinylVisuals;
  if(oldUpd) {
    window.updateVinylVisuals = function() {
      oldUpd();
      const eq = document.getElementById('vinyl-eq');
      const audio = document.getElementById('vinyl-audio');
      if(eq && audio) {
        if(!audio.paused) eq.classList.add('playing');
        else eq.classList.remove('playing');
      }
    };
  }
}, 1000);

// 5. FONDO INTERACTIVO DE GALAXIA/PARTÍCULAS
(function initReactiveBackground() {
  const cv = document.createElement('canvas');
  cv.id = 'reactive-bg';
  cv.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:0; opacity: 0.8 !important; pointer-events:none;';
  document.body.prepend(cv);
  
  const ctx = cv.getContext('2d');
  let W = cv.width = window.innerWidth;
  let H = cv.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
  });

  const particles = [];
  const MAX_PARTICLES = 100;
  
  for(let i=0; i<MAX_PARTICLES; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      baseColor: Math.random() > 0.5 ? '249,198,208' : '201,160,220'
    });
  }

  let mouseX = -1000, mouseY = -1000;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
  });
  document.addEventListener('mouseout', () => {
    mouseX = -1000; mouseY = -1000;
  });

  document.addEventListener('click', e => {
    for(let i=0; i<15; i++) {
        particles.push({
            x: e.clientX, y: e.clientY,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 3 + 1.5,
            baseColor: '255,255,255',
            life: 80
        });
    }
  });

  function draw() {
    ctx.clearRect(0,0,W,H);
    const isDark = document.body.classList.contains('dark');
    
    for(let i=particles.length-1; i>=0; i--) {
      let p = particles[i];
      p.x += p.vx; p.y += p.vy;
      
      let dx = mouseX - p.x; let dy = mouseY - p.y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 180) {
        let force = (180 - dist) / 180;
        p.x -= (dx/dist) * force * 1.5;
        p.y -= (dy/dist) * force * 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${p.baseColor}, ${force * 0.8})`;
        ctx.fill();
      }

      if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
      if(p.y < 0) p.y = H; if(p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${p.baseColor}, ${isDark ? 0.6 : 0.3})`;
      ctx.fill();

      for(let j=i-1; j>=0; j--) {
        let p2 = particles[j];
        if(!p2) continue;
        let d2 = Math.sqrt((p.x-p2.x)**2 + (p.y-p2.y)**2);
        if(d2 < 80) {
           ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
           ctx.strokeStyle = `rgba(${p.baseColor}, ${(80-d2)/80 * (isDark?0.25:0.1)})`;
           ctx.stroke();
        }
      }

      if(p.life !== undefined) {
         p.life--;
         p.size *= 0.95;
         if(p.life <= 0) particles.splice(i, 1);
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

})();